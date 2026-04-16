import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = string;

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface NotificationSubscriptionCallback {
  (notification: Notification): void;
}

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private callbacks: Set<NotificationSubscriptionCallback> = new Set();

  async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  }

  async getUnreadCount(): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_count');

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return data || 0;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }

    return data || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase.rpc('mark_all_notifications_read');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    options: {
      link?: string;
    } = {}
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        link: options.link || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  }

  async subscribe(
    userId: string,
    callback: NotificationSubscriptionCallback
  ): Promise<void> {
    this.callbacks.add(callback);

    if (this.channel) return;

    this.channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          this.callbacks.forEach((cb) => {
            try { cb(notification); } catch (error) { console.error('Error in notification callback:', error); }
          });
        }
      )
      .subscribe();
  }

  async unsubscribe(callback?: NotificationSubscriptionCallback): Promise<void> {
    if (callback) {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0 && this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }
    } else {
      this.callbacks.clear();
      if (this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }
    }
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error) {
      console.error('Error fetching notification:', error);
      return null;
    }

    return data;
  }

  async getNotificationsByType(type: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }

    return data || [];
  }

  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }

  showBrowserNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const browserNotification = new window.Notification(notification.title, {
      body: notification.body || undefined,
      icon: '/favicon.ico',
      tag: notification.id,
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.link) window.location.href = notification.link;
      browserNotification.close();
    };
  }
}

export const notificationService = new NotificationService();
