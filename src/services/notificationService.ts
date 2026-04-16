import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType =
  | 'child_check_in'
  | 'child_check_out'
  | 'teacher_clock_in'
  | 'teacher_clock_out'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'message_received'
  | 'payment_received'
  | 'payment_due'
  | 'time_entry_approved'
  | 'time_entry_rejected'
  | 'review_received'
  | 'activity_logged'
  | 'alert'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  
  // Related entities
  child_id?: string;
  provider_id?: string;
  teacher_id?: string;
  booking_id?: string;
  
  // Status
  read: boolean;
  read_at?: string;
  
  // Metadata
  created_at: string;
  expires_at?: string;
  
  // Action
  action_url?: string;
  action_label?: string;
}

export interface NotificationSubscriptionCallback {
  (notification: Notification): void;
}

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private callbacks: Set<NotificationSubscriptionCallback> = new Set();

  /**
   * Get all notifications for the current user
   */
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

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_count');

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase.rpc('mark_all_notifications_read');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
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

  /**
   * Create a manual notification (for testing or manual triggers)
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    notificationData: Record<string, any> = {},
    options: {
      childId?: string;
      providerId?: string;
      teacherId?: string;
      bookingId?: string;
      actionUrl?: string;
      actionLabel?: string;
    } = {}
  ): Promise<Notification> {
    const { data: notificationId, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_data: notificationData,
      p_child_id: options.childId || null,
      p_provider_id: options.providerId || null,
      p_teacher_id: options.teacherId || null,
      p_booking_id: options.bookingId || null,
      p_action_url: options.actionUrl || null,
      p_action_label: options.actionLabel || null,
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    // Fetch the created notification
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchError) {
      console.error('Error fetching created notification:', fetchError);
      throw fetchError;
    }

    return notification;
  }

  /**
   * Subscribe to real-time notifications
   */
  async subscribe(
    userId: string,
    callback: NotificationSubscriptionCallback
  ): Promise<void> {
    // Add callback to set
    this.callbacks.add(callback);

    // If channel already exists, don't create a new one
    if (this.channel) {
      return;
    }

    // Create channel for user's notifications
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
          
          // Call all registered callbacks
          this.callbacks.forEach((cb) => {
            try {
              cb(notification);
            } catch (error) {
              console.error('Error in notification callback:', error);
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to notifications');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        }
      });
  }

  /**
   * Unsubscribe from real-time notifications
   */
  async unsubscribe(callback?: NotificationSubscriptionCallback): Promise<void> {
    if (callback) {
      // Remove specific callback
      this.callbacks.delete(callback);
      
      // If no more callbacks, remove channel
      if (this.callbacks.size === 0 && this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }
    } else {
      // Remove all callbacks and channel
      this.callbacks.clear();
      if (this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }
    }
  }

  /**
   * Get notification by ID
   */
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

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    type: NotificationType,
    limit = 20
  ): Promise<Notification[]> {
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

  /**
   * Get notifications for a specific child
   */
  async getChildNotifications(childId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching child notifications:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Request browser notification permission
   */
  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification: Notification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: false,
      silent: false,
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
      browserNotification.close();
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
