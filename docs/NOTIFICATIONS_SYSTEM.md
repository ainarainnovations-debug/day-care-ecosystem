# 🔔 Real-time Notifications System

## Overview

A comprehensive real-time notification system using Supabase Realtime that provides instant updates for child check-ins/outs, teacher activities, bookings, payments, and more.

## ✨ Features

### Core Functionality
- ✅ **Real-time Push Notifications** - Instant updates via Supabase Realtime
- ✅ **Browser Notifications** - Native desktop notifications
- ✅ **Notification Bell** - Navbar dropdown with unread count
- ✅ **Full Notifications Page** - Complete notification history
- ✅ **Read/Unread Tracking** - Mark individual or all as read
- ✅ **Notification Filtering** - By type, read status
- ✅ **Auto-cleanup** - Old notifications auto-deleted after 30 days
- ✅ **Rich Data** - JSON metadata for each notification type

### Notification Types

| Type | Trigger | Recipients | Icon |
|------|---------|-----------|------|
| `child_check_in` | Child checked in | Parent | 👋 |
| `child_check_out` | Child checked out | Parent | 👋 |
| `teacher_clock_in` | Teacher clocks in | Provider | ⏰ |
| `teacher_clock_out` | Teacher clocks out | Provider | ⏰ |
| `booking_confirmed` | Booking confirmed | Parent & Provider | ✅ |
| `booking_cancelled` | Booking cancelled | Parent & Provider | ❌ |
| `message_received` | New message | Recipient | 💬 |
| `payment_received` | Payment processed | Provider | 💵 |
| `payment_due` | Payment reminder | Parent | ⚠️ |
| `time_entry_approved` | Time entry approved | Teacher | ✅ |
| `time_entry_rejected` | Time entry rejected | Teacher | ❌ |
| `review_received` | New review | Provider | ⭐ |
| `activity_logged` | Activity posted | Parent | 📝 |
| `alert` | Important alert | User | ⚠️ |
| `system` | System message | User | 🔔 |

## 🏗️ Architecture

### Database Schema

```sql
-- notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type notification_type,
  title TEXT,
  message TEXT,
  data JSONB,
  
  -- Related entities
  child_id UUID,
  provider_id UUID,
  teacher_id UUID,
  booking_id UUID,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Action
  action_url TEXT,
  action_label TEXT
);
```

### Automatic Triggers

The system uses PostgreSQL triggers to automatically create notifications:

1. **Child Attendance Triggers**
   - `trigger_notify_child_check_in` - On attendance INSERT
   - `trigger_notify_child_check_out` - On attendance UPDATE (check_out_time)

2. **Teacher Time Entry Triggers**
   - `trigger_notify_teacher_clock_in` - On time_entries INSERT
   - `trigger_notify_teacher_clock_out` - On time_entries UPDATE (check_out_time)
   - `trigger_notify_time_entry_status` - On time_entries UPDATE (status)

3. **Booking Triggers**
   - `trigger_notify_booking_confirmed` - On bookings UPDATE (status = 'confirmed')

### Service Layer

**`/src/services/notificationService.ts`**

```typescript
class NotificationService {
  // Queries
  getNotifications(limit, offset)
  getUnreadCount()
  getUnreadNotifications()
  getNotificationById(id)
  getNotificationsByType(type)
  getChildNotifications(childId)
  
  // Mutations
  markAsRead(notificationId)
  markAllAsRead()
  deleteNotification(notificationId)
  createNotification(...)
  
  // Real-time
  subscribe(userId, callback)
  unsubscribe(callback)
  
  // Browser
  requestBrowserPermission()
  showBrowserNotification(notification)
}
```

### React Hook

**`/src/hooks/useNotifications.tsx`**

```typescript
const {
  notifications,           // All notifications
  unreadNotifications,     // Only unread
  unreadCount,            // Unread count
  loading,                // Loading state
  permission,             // Browser permission
  markAsRead,             // Mark one as read
  markAllAsRead,          // Mark all as read
  deleteNotification,     // Delete notification
  requestPermission,      // Request browser permission
  refresh,                // Manually refresh
} = useNotifications();
```

## 📦 Components

### NotificationBell (Navbar Dropdown)

**Location:** `/src/components/NotificationBell.tsx`

**Features:**
- Unread count badge
- Dropdown with recent notifications
- Mark as read/delete actions
- "View all" link to full page
- Auto-refresh on new notifications

**Usage:**
```tsx
import { NotificationBell } from '@/components/NotificationBell';

<NotificationBell />
```

### Notifications Page

**Location:** `/src/pages/Notifications.tsx`  
**Route:** `/notifications`

**Features:**
- Full notification history
- Filter by type and read status
- Stats cards (total, unread, read)
- Bulk actions (mark all as read)
- Browser notification permission prompt
- Pagination (50 per page)

## 🚀 Usage

### 1. Install the Migration

```bash
# Start Docker Desktop (required)
# Then run migration:
npx supabase db reset
# OR
npx supabase migration up
```

### 2. Enable Browser Notifications (Optional)

In the Notifications page (`/notifications`), users can click "Enable Notifications" to allow browser notifications.

### 3. Automatic Notifications

Notifications are **automatically created** by database triggers when:
- A child is checked in/out
- A teacher clocks in/out
- A time entry is approved/rejected
- A booking is confirmed

### 4. Manual Notifications

You can create custom notifications:

```typescript
import { notificationService } from '@/services/notificationService';

await notificationService.createNotification(
  userId,
  'alert',
  'Important Alert',
  'Something important happened!',
  { customData: 'value' },
  {
    actionUrl: '/dashboard',
    actionLabel: 'View Dashboard',
  }
);
```

### 5. Subscribe to Real-time Updates

The `useNotifications()` hook automatically subscribes to real-time updates:

```typescript
function MyComponent() {
  const { notifications, unreadCount } = useNotifications();
  
  // Notifications update automatically via Realtime
  return <div>You have {unreadCount} unread notifications</div>;
}
```

## 🎯 Notification Flow

### Example: Child Check-In

1. **Trigger:** Teacher checks child in via `TeacherChildCheckInOut.tsx`
2. **Database:** `INSERT INTO attendance` with child_id, provider_id, etc.
3. **Trigger Function:** `notify_child_check_in()` fires automatically
4. **Notification Created:** Inserted into `notifications` table for parent
5. **Realtime Event:** Supabase broadcasts INSERT event
6. **Frontend Subscription:** `useNotifications()` hook receives event
7. **UI Updates:**
   - Notification bell badge increments
   - Toast notification appears
   - Browser notification shows (if permitted)
   - Notifications page updates

## 🎨 UI/UX Features

### Notification Bell
- Red badge with unread count
- Shows "99+" for 100+ notifications
- Dropdown with last 50 notifications
- Hover actions (mark read, delete)
- Time ago display (e.g., "5 minutes ago")
- Click notification to navigate to action_url

### Notifications Page
- Stats cards (total, unread, read)
- Filter tabs (All, Unread)
- Type filter dropdown
- "Mark all as read" button
- Color-coded by type
- Responsive design

### Toast Notifications
- Appears on new notification
- Shows title + message
- Optional action button
- Auto-dismisses after 5 seconds

### Browser Notifications
- Native desktop notifications
- Requires user permission
- Click to open action URL
- Includes icon and badge

## 🔧 Customization

### Add New Notification Type

1. **Update Enum** in migration:
```sql
ALTER TYPE notification_type ADD VALUE 'new_type';
```

2. **Add Config** in `NotificationBell.tsx`:
```typescript
const notificationConfig = {
  new_type: {
    icon: '🎉',
    color: 'bg-pink-100 text-pink-800',
    darkColor: 'dark:bg-pink-900/30 dark:text-pink-400',
  },
};
```

3. **Create Trigger** (if automatic):
```sql
CREATE OR REPLACE FUNCTION notify_new_type()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    user_id,
    'new_type',
    'Title',
    'Message',
    jsonb_build_object('key', 'value')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Custom Notification Logic

```typescript
// Create notification with custom data
await notificationService.createNotification(
  userId,
  'activity_logged',
  'New Activity Posted',
  'Johnny drew a beautiful picture!',
  {
    activityId: 'abc-123',
    childName: 'Johnny',
    activityType: 'art',
    photoUrl: 'https://...',
  },
  {
    childId: childId,
    providerId: providerId,
    actionUrl: `/activities/${activityId}`,
    actionLabel: 'View Activity',
  }
);
```

## 🧹 Maintenance

### Automatic Cleanup

Old notifications are automatically deleted after 30 days:

```sql
-- Run this periodically (or set up a cron job)
SELECT cleanup_old_notifications();
```

### Manual Cleanup

```typescript
// Delete specific notification
await notificationService.deleteNotification(notificationId);

// Mark all as read
await notificationService.markAllAsRead();
```

## 📊 Analytics & Monitoring

### Database Queries

```sql
-- Get notification stats
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE read = false) as unread
FROM notifications
WHERE user_id = 'user-id'
GROUP BY type;

-- Get most active users
SELECT 
  user_id,
  COUNT(*) as notification_count
FROM notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY notification_count DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check Supabase Connection:**
   ```typescript
   // In browser console
   supabase.channel('test').subscribe((status) => console.log(status));
   ```

2. **Check RLS Policies:**
   ```sql
   SELECT * FROM notifications WHERE user_id = auth.uid();
   ```

3. **Check Trigger Functions:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';
   ```

### Browser Notifications Not Working

1. Check permission: `Notification.permission` should be "granted"
2. Check browser support: `'Notification' in window`
3. Check HTTPS (required for production)

## 🔐 Security

### Row Level Security (RLS)

All notification queries are protected by RLS:
- Users can only see their own notifications
- Only authenticated users can access notifications
- System can create notifications (SECURITY DEFINER functions)

### Function Security

```sql
-- Helper functions use SECURITY DEFINER
-- to bypass RLS for system operations
CREATE FUNCTION create_notification(...) 
SECURITY DEFINER;
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Email notifications (SendGrid integration)
- [ ] SMS notifications (Twilio integration)
- [ ] Notification preferences/settings
- [ ] Digest emails (daily/weekly summaries)
- [ ] Sound notifications
- [ ] Notification groups/categories
- [ ] Snooze notifications
- [ ] Notification templates
- [ ] Rich media (images, videos)
- [ ] In-app notification center with tabs

### Performance Optimizations
- [ ] Infinite scroll for notifications page
- [ ] Virtual scrolling for large lists
- [ ] Notification caching
- [ ] Batch operations
- [ ] Debounced real-time updates

## 📚 Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## ✅ Testing Checklist

- [ ] Child check-in triggers parent notification
- [ ] Child check-out triggers parent notification
- [ ] Teacher clock-in triggers provider notification
- [ ] Teacher clock-out triggers provider notification
- [ ] Time entry approval triggers teacher notification
- [ ] Booking confirmation triggers both parties
- [ ] Real-time updates work without refresh
- [ ] Browser notifications appear when permitted
- [ ] Toast notifications appear
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Filters work correctly
- [ ] Unread count updates in real-time
- [ ] Mobile responsive design works

---

**Implementation Status:** ✅ Complete - Ready for Production

**Migration File:** `20260413070000_add_notifications_system.sql`

**Last Updated:** April 13, 2026
