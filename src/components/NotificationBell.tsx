import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { Notification } from '@/services/notificationService';

const notificationConfig: Record<string, { icon: string; color: string }> = {
  child_check_in: { icon: '👋', color: 'bg-green-100 text-green-800' },
  child_check_out: { icon: '👋', color: 'bg-blue-100 text-blue-800' },
  teacher_clock_in: { icon: '⏰', color: 'bg-purple-100 text-purple-800' },
  teacher_clock_out: { icon: '⏰', color: 'bg-indigo-100 text-indigo-800' },
  booking_confirmed: { icon: '✅', color: 'bg-green-100 text-green-800' },
  booking_cancelled: { icon: '❌', color: 'bg-red-100 text-red-800' },
  message_received: { icon: '💬', color: 'bg-blue-100 text-blue-800' },
  payment_received: { icon: '💵', color: 'bg-green-100 text-green-800' },
  payment_due: { icon: '⚠️', color: 'bg-yellow-100 text-yellow-800' },
  time_entry_approved: { icon: '✅', color: 'bg-green-100 text-green-800' },
  time_entry_rejected: { icon: '❌', color: 'bg-red-100 text-red-800' },
  review_received: { icon: '⭐', color: 'bg-yellow-100 text-yellow-800' },
  activity_logged: { icon: '📝', color: 'bg-blue-100 text-blue-800' },
  alert: { icon: '⚠️', color: 'bg-orange-100 text-orange-800' },
  system: { icon: '🔔', color: 'bg-gray-100 text-gray-800' },
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = notificationConfig[notification.type] || notificationConfig.system;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleClick = () => {
    if (!notification.is_read) onMarkAsRead(notification.id);
    if (notification.link) window.location.href = notification.link;
  };

  return (
    <div
      className={cn(
        'group relative p-4 hover:bg-accent/50 transition-colors cursor-pointer border-b last:border-0',
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg', config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn('font-medium text-sm', !notification.is_read && 'font-semibold')}>{notification.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
            </div>
            {!notification.is_read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-muted-foreground">{unreadCount} unread</p>}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllAsRead}>
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Separator />
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
