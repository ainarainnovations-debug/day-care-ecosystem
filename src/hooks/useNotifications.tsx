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

  // Fetch initial notifications
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
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification: Notification) => {
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount((prev) => prev + 1);
      
      // Play notification sound
      notificationSound.playForNotificationType(notification.type);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      });
      
      // Show browser notification if permitted
      if (permission === 'granted') {
        notificationService.showBrowserNotification(notification);
      }
    };

    // Subscribe to real-time updates
    notificationService.subscribe(user.id, handleNewNotification);

    // Fetch initial data
    fetchNotifications();

    // Cleanup
    return () => {
      notificationService.unsubscribe(handleNewNotification);
    };
  }, [user, fetchNotifications, toast, permission]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    const perm = await notificationService.requestBrowserPermission();
    setPermission(perm);
    return perm;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
          )
        );
        
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notification as read',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);
        
        const notification = notifications.find((n) => n.id === notificationId);
        
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        toast({
          title: 'Success',
          description: 'Notification deleted',
        });
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete notification',
          variant: 'destructive',
        });
      }
    },
    [notifications, toast]
  );

  // Get unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);

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
