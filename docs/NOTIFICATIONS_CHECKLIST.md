# ✅ Notification System - Final Checklist

## Pre-deployment Tasks

### 1. Database Migration ⏳
```bash
# Make sure Docker Desktop is running
# Then run:
npx supabase db reset
```

**Expected Output:**
```
✓ Database reset complete
✓ All migrations applied
✓ Seed data loaded (if any)
```

**Verify:**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM notifications;  -- Should return 0 (empty table)
SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';  -- Should show 6 triggers
```

---

### 2. Enable Realtime on Notifications Table 🔴

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to **Database > Replication**
3. Find `notifications` table
4. Click **Enable Replication**
5. Verify status shows "Enabled"

**Why:** Real-time subscriptions require replication to be enabled

---

### 3. Test Basic Functionality 🧪

#### A. Test Manual Notifications
```bash
# Start dev server
npm run dev
```

1. Visit `http://localhost:5173/icons`
2. Scroll to **Notification Tester** card
3. Click each quick test button:
   - ✅ Check-in notification appears
   - ✅ Check-out notification appears
   - ✅ Clock-in notification appears
   - ✅ Booking notification appears
   - ✅ Payment notification appears
   - ✅ Alert notification appears

4. Check notification bell in navbar:
   - ✅ Unread count increases
   - ✅ Badge shows correct number
   - ✅ Dropdown displays notifications

5. Visit `/notifications` page:
   - ✅ All notifications listed
   - ✅ Stats cards show correct counts
   - ✅ Filters work properly

---

#### B. Test Automatic Triggers

**Child Check-In:**
1. Login as **teacher**
2. Go to **Teacher Dashboard > Check-In/Out**
3. Check in a child
4. Login as **parent** (in new incognito window)
5. ✅ Verify notification appears instantly

**Teacher Clock-In:**
1. Login as **teacher**
2. Go to **Teacher Dashboard > Punch Clock**
3. Click "Clock In"
4. Login as **provider** (in new incognito window)
5. ✅ Verify notification appears instantly

**Time Entry Approval:**
1. Login as **provider**
2. Go to **Provider Dashboard > Time & Labor**
3. Approve a time entry
4. Login as **teacher** (in new incognito window)
5. ✅ Verify notification appears instantly

---

#### C. Test Real-time Updates

1. Open two browser windows side by side
2. Login to the same account in both
3. In window 1: Visit `/icons` > Send notification
4. In window 2: Watch navbar bell
5. ✅ Verify badge updates without refresh
6. ✅ Verify dropdown updates without refresh

---

#### D. Test Browser Notifications

1. Visit `/notifications`
2. Click **"Enable Notifications"**
3. Click **"Allow"** in browser prompt
4. Send a test notification from `/icons`
5. ✅ Verify desktop notification appears
6. ✅ Verify clicking notification navigates to action URL

---

#### E. Test Sound Alerts

1. Visit `/icons`
2. Click a quick test button
3. ✅ Verify you hear a notification sound
4. Try different notification types
5. ✅ Verify different sounds play

**Disable sounds:**
```javascript
// In browser console
notificationSound.setEnabled(false);
```

---

### 4. Test Mark as Read/Delete 🗑️

1. Generate several test notifications
2. Click notification bell dropdown
3. Hover over a notification
4. ✅ Click checkmark (mark as read)
5. ✅ Verify notification becomes "read"
6. ✅ Verify badge count decreases
7. ✅ Click trash icon (delete)
8. ✅ Verify notification disappears

**Mark All as Read:**
1. Have multiple unread notifications
2. Click "Mark all read" button
3. ✅ Verify all notifications marked as read
4. ✅ Verify badge count goes to 0

---

### 5. Test Filters 🔍

Visit `/notifications` page:

1. Click **"Unread"** tab
   - ✅ Only unread notifications show

2. Click **"All"** tab
   - ✅ All notifications show

3. Use type dropdown:
   - ✅ Select "Check-in" → Only check-in notifications
   - ✅ Select "Bookings" → Only booking notifications
   - ✅ Select "All types" → All notifications return

---

### 6. Test Mobile Responsiveness 📱

1. Open dev tools (F12)
2. Toggle device emulation (Ctrl+Shift+M)
3. Test on various screen sizes:
   - ✅ iPhone SE (375px)
   - ✅ iPhone 12 Pro (390px)
   - ✅ iPad (768px)
   - ✅ Desktop (1920px)

4. Verify:
   - ✅ Notification bell works on mobile
   - ✅ Dropdown doesn't overflow screen
   - ✅ Notifications page is readable
   - ✅ Buttons are tappable

---

### 7. Performance Testing ⚡

**Database Performance:**
```sql
-- Test unread count query
EXPLAIN ANALYZE 
SELECT COUNT(*) FROM notifications 
WHERE user_id = '[your-user-id]' AND read = false;

-- Should use index: idx_notifications_user_unread
-- Execution time should be < 10ms
```

**Frontend Performance:**
1. Open dev tools > Network tab
2. Reload page
3. ✅ Verify notification service loads < 50ms
4. ✅ Verify no console errors

**Real-time Latency:**
1. Send notification
2. Measure time until it appears
3. ✅ Should be < 100ms

---

### 8. Security Testing 🔒

**RLS Policies:**
```sql
-- Try to view another user's notifications
-- Should return empty
SELECT * FROM notifications 
WHERE user_id != auth.uid();

-- Try to insert notification as user
-- Should fail
INSERT INTO notifications (user_id, type, title, message)
VALUES (auth.uid(), 'test', 'Test', 'Test');
```

✅ Verify users can only see their own notifications  
✅ Verify users cannot manually insert notifications  
✅ Verify system functions work (SECURITY DEFINER)

---

### 9. Clean Up Test Data 🧹

**Before Production:**
```sql
-- Delete all test notifications
DELETE FROM notifications WHERE data->>'test' = 'true';

-- Or reset everything
TRUNCATE notifications;
```

---

### 10. Production Preparation 🚀

#### A. Remove Development Tools

Comment out or remove `NotificationTester` from production:

```typescript
// src/pages/IconShowcase.tsx
// import { NotificationTester } from '@/components/NotificationTester';

// ...

// Remove this line:
// <NotificationTester />
```

#### B. Update Environment Variables

Ensure Supabase URL and keys are correct:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### C. Enable Realtime in Production

In Supabase Dashboard (Production):
1. Database > Replication
2. Enable `notifications` table
3. Verify status

#### D. Set Up Cron Job (Optional)

For automatic cleanup:
```sql
-- Create cron extension (if not exists)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 2 * * *',
  $$SELECT cleanup_old_notifications()$$
);
```

---

## Post-deployment Verification ✅

### After deploying to production:

1. **Test Realtime Connection**
   ```javascript
   // Browser console
   console.log(supabase.channel('test').subscribe());
   // Should show: SUBSCRIBED
   ```

2. **Test Trigger Functions**
   - Check in a child → Parent gets notification
   - Clock in as teacher → Provider gets notification
   - Approve time entry → Teacher gets notification

3. **Monitor Logs**
   - Supabase Dashboard > Logs
   - Look for any errors
   - Verify triggers are firing

4. **User Acceptance Testing**
   - Have real users test the system
   - Collect feedback
   - Fix any issues

---

## Troubleshooting Common Issues 🔧

### Issue: Notifications not appearing

**Solution:**
1. Check Supabase connection
2. Verify Realtime is enabled
3. Check RLS policies
4. Review trigger functions
5. Check browser console for errors

### Issue: Browser notifications blocked

**Solution:**
1. Check browser permissions
2. Must be on HTTPS (or localhost)
3. User must grant permission
4. Check browser notification settings

### Issue: Sounds not playing

**Solution:**
1. User must interact with page first
2. Check volume settings
3. Verify audio is enabled
4. Check browser audio permissions

---

## Success Criteria 🎯

Before marking as complete, verify:

- [ ] Migration runs without errors
- [ ] All 6 triggers created successfully
- [ ] Realtime enabled on notifications table
- [ ] Manual notifications work
- [ ] Automatic notifications work
- [ ] Real-time updates work
- [ ] Browser notifications work
- [ ] Sound alerts work
- [ ] Mark as read/delete works
- [ ] Filters work correctly
- [ ] Mobile responsive
- [ ] Security tests pass
- [ ] Performance is acceptable
- [ ] Documentation complete
- [ ] Test data cleaned up
- [ ] Production ready

---

## Next Steps After Completion 🎉

1. **Deploy to Production**
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```

2. **Monitor Usage**
   - Track notification counts
   - Monitor database performance
   - Collect user feedback

3. **Plan Enhancements**
   - Email notifications
   - SMS notifications
   - Notification preferences
   - Digest emails

4. **Document Learnings**
   - What worked well
   - What could be improved
   - Best practices discovered

---

**Status:** Ready for Final Testing  
**Estimated Time:** 1-2 hours for complete testing  
**Priority:** High - Core feature

**Last Updated:** April 13, 2026
