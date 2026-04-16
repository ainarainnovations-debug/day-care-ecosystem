import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';
import { notificationSound } from '@/services/notificationSound';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(50),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      notificationSound.playForNotificationType(notification.type);
      toast({ title: notification.title, description: notification.body || undefined });
      if (permission === 'granted') notificationService.showBrowserNotification(notification);
    };

    notificationService.subscribe(user.id, handleNewNotification);
    fetchNotifications();

    return () => { notificationService.unsubscribe(handleNewNotification); };
  }, [user, fetchNotifications, toast, permission]);

  const requestPermission = useCallback(async () => {
    const perm = await notificationService.requestBrowserPermission();
    setPermission(perm);
    return perm;
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    permission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
    refresh: fetchNotifications,
  };
}
