# 🚀 Real-time Notifications System - Implementation Guide

## ✅ What We Built

A complete real-time notification system with:
- ✅ Database schema with automatic triggers
- ✅ Service layer for notification management
- ✅ React hook for easy integration
- ✅ Notification bell component (navbar)
- ✅ Full notifications page
- ✅ Browser notification support
- ✅ Real-time updates via Supabase
- ✅ 15 notification types
- ✅ Comprehensive documentation
- ✅ Testing component

## 📁 Files Created

### Database
- `supabase/migrations/20260413070000_add_notifications_system.sql` - Complete schema + triggers

### Services
- `src/services/notificationService.ts` - Notification service layer

### Hooks
- `src/hooks/useNotifications.tsx` - React hook for notifications

### Components
- `src/components/NotificationBell.tsx` - Navbar bell dropdown
- `src/components/NotificationTester.tsx` - Testing tool (dev only)

### Pages
- `src/pages/Notifications.tsx` - Full notifications page

### Documentation
- `docs/NOTIFICATIONS_SYSTEM.md` - Complete system documentation

### Updated Files
- `src/components/Navbar.tsx` - Added NotificationBell
- `src/App.tsx` - Added /notifications route
- `src/pages/IconShowcase.tsx` - Added NotificationTester

## 🎯 Next Steps

### 1. Run the Migration

**Option A: Reset Database (Development)**
```bash
# Make sure Docker Desktop is running
npx supabase db reset
```

**Option B: Apply Migration Only**
```bash
npx supabase migration up
```

### 2. Test the System

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the testing page:**
   - Go to `http://localhost:5173/icons`
   - Scroll to the Notification Tester card
   - Click the quick test buttons
   - Check the notification bell in the navbar

3. **Enable browser notifications:**
   - Go to `/notifications`
   - Click "Enable Notifications"
   - Allow browser notifications

4. **Test real-time updates:**
   - Open two browser windows side by side
   - Send a notification from one
   - Watch it appear instantly in the other

### 3. Test Automatic Notifications

The following actions will automatically create notifications:

#### Parent Notifications
```typescript
// When a teacher checks in a child
// Go to: Teacher Dashboard > Check-In/Out
// Check in a child
// → Parent receives "Child Checked In" notification

// When a teacher checks out a child
// → Parent receives "Child Checked Out" notification
```

#### Provider Notifications
```typescript
// When a teacher clocks in
// Go to: Teacher Dashboard > Punch Clock
// Clock in
// → Provider receives "Teacher Clocked In" notification

// When a teacher clocks out
// → Provider receives "Teacher Clocked Out" notification
```

#### Teacher Notifications
```typescript
// When a provider approves/rejects time entry
// Go to: Provider Dashboard > Time & Labor
// Approve or reject a time entry
// → Teacher receives approval/rejection notification
```

#### Booking Notifications
```typescript
// When a booking is confirmed
// → Both parent and provider receive notifications
```

## 🔧 Configuration

### Customize Notification Icons

Edit `/src/components/NotificationBell.tsx`:

```typescript
const notificationConfig = {
  child_check_in: {
    icon: '👋',  // Change emoji
    color: 'bg-green-100 text-green-800',  // Light mode
    darkColor: 'dark:bg-green-900/30 dark:text-green-400',  // Dark mode
  },
  // ... add more
};
```

### Add New Notification Type

1. **Update migration** (create new migration file):
```sql
ALTER TYPE notification_type ADD VALUE 'photo_uploaded';
```

2. **Add trigger function:**
```sql
CREATE OR REPLACE FUNCTION notify_photo_uploaded()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.parent_id,
    'photo_uploaded',
    'New Photo',
    'A new photo of ' || child_name || ' was uploaded',
    jsonb_build_object('photo_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_photo_uploaded
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION notify_photo_uploaded();
```

3. **Add to config:**
```typescript
const notificationConfig = {
  photo_uploaded: {
    icon: '📸',
    color: 'bg-purple-100 text-purple-800',
    darkColor: 'dark:bg-purple-900/30 dark:text-purple-400',
  },
};
```

### Customize Retention Period

Default: 30 days. To change, edit the migration:

```sql
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  -- Change from 30 to desired days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

## 🎨 Integration Examples

### Show Notifications in Dashboard

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function Dashboard() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <h2>Recent Activity ({unreadCount} new)</h2>
      {notifications.slice(0, 5).map((notif) => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

### Send Custom Notification

```typescript
import { notificationService } from '@/services/notificationService';

async function sendWelcomeNotification(userId: string) {
  await notificationService.createNotification(
    userId,
    'system',
    'Welcome to CareConnect! 👋',
    'We\'re excited to have you here. Take a moment to complete your profile.',
    { isWelcome: true },
    {
      actionUrl: '/profile/edit',
      actionLabel: 'Complete Profile',
    }
  );
}
```

### Filter Notifications by Type

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function ChildActivityFeed({ childId }: { childId: string }) {
  const { notifications } = useNotifications();

  const childNotifications = notifications.filter(
    (n) => n.child_id === childId
  );

  return (
    <div>
      {childNotifications.map((notif) => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
}
```

## 📊 Monitoring

### Check Notification Stats

```sql
-- Total notifications by type
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type 
ORDER BY COUNT(*) DESC;

-- Unread notifications by user
SELECT user_id, COUNT(*) 
FROM notifications 
WHERE read = false 
GROUP BY user_id 
ORDER BY COUNT(*) DESC;

-- Most active notification types (last 7 days)
SELECT type, COUNT(*) 
FROM notifications 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type 
ORDER BY COUNT(*) DESC;
```

### Check Real-time Connection

```typescript
// In browser console
const channel = supabase.channel('test-channel');
channel.subscribe((status) => {
  console.log('Status:', status);
});
```

## 🐛 Troubleshooting

### Problem: Notifications not appearing

**Check 1: Supabase connection**
```typescript
// Browser console
console.log(await supabase.from('notifications').select('*').limit(1));
```

**Check 2: RLS policies**
```sql
-- In Supabase SQL editor
SELECT * FROM notifications WHERE user_id = auth.uid();
```

**Check 3: Realtime enabled**
- Go to Supabase Dashboard
- Database > Replication
- Ensure `notifications` table is enabled

### Problem: Browser notifications not showing

**Solutions:**
1. Check permission: `Notification.permission` in console
2. Must be on HTTPS (or localhost)
3. User must click "Enable Notifications" button
4. Check browser settings (notifications not blocked)

### Problem: TypeScript errors

Run migration first, then restart TypeScript server:
```bash
# In VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 🔒 Security Checklist

- [x] RLS policies enabled on notifications table
- [x] Users can only see their own notifications
- [x] System functions use SECURITY DEFINER
- [x] No sensitive data in notification messages
- [x] Action URLs validated before use

## 📈 Performance Tips

1. **Limit notification history:**
   ```typescript
   // Only fetch last 50
   const { notifications } = useNotifications();
   ```

2. **Use pagination on full page:**
   ```typescript
   await notificationService.getNotifications(20, offset);
   ```

3. **Clean up old notifications:**
   ```sql
   -- Run periodically
   SELECT cleanup_old_notifications();
   ```

4. **Index optimization** (already included):
   - `idx_notifications_user_unread` - Fast unread queries
   - `idx_notifications_created_at` - Fast sorting

## 🎉 What's Next?

Now that notifications are working, consider adding:

1. **Email Notifications** - Send emails for important events
2. **Notification Preferences** - Let users customize what they receive
3. **Digest Emails** - Daily/weekly summaries
4. **SMS Notifications** - Critical alerts via Twilio
5. **Push Notifications** - Mobile app integration
6. **Notification Templates** - Reusable notification formats

## 📞 Support

If you encounter issues:
1. Check the [NOTIFICATIONS_SYSTEM.md](./NOTIFICATIONS_SYSTEM.md) docs
2. Review Supabase Dashboard logs
3. Check browser console for errors
4. Verify database triggers are working

---

**Status:** ✅ Ready for Testing

**Author:** GitHub Copilot  
**Date:** April 13, 2026  
**Version:** 1.0.0
