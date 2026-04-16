import { useState } from 'react';
import { Bell, CheckCheck, Filter, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/services/notificationService';

const notificationConfig = {
  child_check_in: { icon: '👋', label: 'Check-in', color: 'text-green-600' },
  child_check_out: { icon: '👋', label: 'Check-out', color: 'text-blue-600' },
  teacher_clock_in: { icon: '⏰', label: 'Clock-in', color: 'text-purple-600' },
  teacher_clock_out: { icon: '⏰', label: 'Clock-out', color: 'text-indigo-600' },
  booking_confirmed: { icon: '✅', label: 'Booking', color: 'text-green-600' },
  booking_cancelled: { icon: '❌', label: 'Cancelled', color: 'text-red-600' },
  message_received: { icon: '💬', label: 'Message', color: 'text-blue-600' },
  payment_received: { icon: '💵', label: 'Payment', color: 'text-green-600' },
  payment_due: { icon: '⚠️', label: 'Payment Due', color: 'text-yellow-600' },
  time_entry_approved: { icon: '✅', label: 'Approved', color: 'text-green-600' },
  time_entry_rejected: { icon: '❌', label: 'Rejected', color: 'text-red-600' },
  review_received: { icon: '⭐', label: 'Review', color: 'text-yellow-600' },
  activity_logged: { icon: '📝', label: 'Activity', color: 'text-blue-600' },
  alert: { icon: '⚠️', label: 'Alert', color: 'text-orange-600' },
  system: { icon: '🔔', label: 'System', color: 'text-gray-600' },
};

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const config = notificationConfig[notification.type];
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-all',
        !notification.read && 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="text-3xl flex-shrink-0">{config.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn('font-semibold', !notification.read && 'text-blue-900 dark:text-blue-100')}>
                {notification.title}
              </h3>
              {!notification.read && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', config.color)}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>

              <div className="flex items-center gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    Mark as read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Notifications() {
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    permission,
    requestPermission,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const handleRequestPermission = async () => {
    const perm = await requestPermission();
    if (perm === 'granted') {
      alert('Browser notifications enabled! You will now receive notifications.');
    } else {
      alert('Browser notifications denied. You can enable them in your browser settings.');
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with important alerts and messages
        </p>
      </div>

      {/* Browser notifications */}
      {permission !== 'granted' && (
        <Card className="mb-6 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Enable Browser Notifications
            </CardTitle>
            <CardDescription>
              Get real-time notifications even when you're not on this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRequestPermission}>
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </div>
            <div className="text-sm text-muted-foreground">Read</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              
              <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as NotificationType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="child_check_in">Check-in</SelectItem>
                  <SelectItem value="child_check_out">Check-out</SelectItem>
                  <SelectItem value="teacher_clock_in">Clock-in</SelectItem>
                  <SelectItem value="teacher_clock_out">Clock-out</SelectItem>
                  <SelectItem value="booking_confirmed">Bookings</SelectItem>
                  <SelectItem value="message_received">Messages</SelectItem>
                  <SelectItem value="payment_received">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications list */}
      {loading ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No notifications</p>
          <p className="text-muted-foreground">
            {filter === 'unread' ? "You're all caught up!" : 'You have no notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
