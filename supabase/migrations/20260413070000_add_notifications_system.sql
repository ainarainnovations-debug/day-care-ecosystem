-- =====================================================
-- NOTIFICATIONS SYSTEM MIGRATION
-- =====================================================
-- Creates comprehensive notification system with:
-- - notifications table
-- - Real-time subscriptions support
-- - RLS policies
-- - Trigger functions for auto-notifications
-- =====================================================

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'child_check_in',
  'child_check_out',
  'teacher_clock_in',
  'teacher_clock_out',
  'booking_confirmed',
  'booking_cancelled',
  'message_received',
  'payment_received',
  'payment_due',
  'time_entry_approved',
  'time_entry_rejected',
  'review_received',
  'activity_logged',
  'alert',
  'system'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  -- Related entities
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Status tracking
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Action link (optional)
  action_url TEXT,
  action_label TEXT
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_child_id ON notifications(child_id) WHERE child_id IS NOT NULL;
CREATE INDEX idx_notifications_provider_id ON notifications(provider_id) WHERE provider_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (through triggers)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER FUNCTIONS FOR AUTO-NOTIFICATIONS
-- =====================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_child_id UUID DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL,
  p_teacher_id UUID DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, data,
    child_id, provider_id, teacher_id, booking_id,
    action_url, action_label
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data,
    p_child_id, p_provider_id, p_teacher_id, p_booking_id,
    p_action_url, p_action_label
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ATTENDANCE NOTIFICATIONS
-- =====================================================

-- Trigger: Child Check-In Notification
CREATE OR REPLACE FUNCTION notify_child_check_in()
RETURNS TRIGGER AS $$
DECLARE
  v_child_name TEXT;
  v_parent_id UUID;
  v_teacher_name TEXT;
BEGIN
  -- Get child name and parent
  SELECT first_name || ' ' || last_name, parent_id
  INTO v_child_name, v_parent_id
  FROM children
  WHERE id = NEW.child_id;
  
  -- Get teacher name
  SELECT display_name INTO v_teacher_name
  FROM profiles
  WHERE id = NEW.checked_in_by_teacher_id;
  
  -- Notify parent
  PERFORM create_notification(
    v_parent_id,
    'child_check_in',
    'Child Checked In',
    v_child_name || ' was checked in by ' || COALESCE(v_teacher_name, 'staff') || ' at ' || 
    TO_CHAR(NEW.check_in_time, 'HH12:MI AM'),
    jsonb_build_object(
      'child_id', NEW.child_id,
      'check_in_time', NEW.check_in_time,
      'teacher_id', NEW.checked_in_by_teacher_id
    ),
    NEW.child_id,
    NEW.provider_id,
    NEW.checked_in_by_teacher_id,
    NULL,
    '/parent/dashboard',
    'View Details'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_child_check_in
  AFTER INSERT ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION notify_child_check_in();

-- Trigger: Child Check-Out Notification
CREATE OR REPLACE FUNCTION notify_child_check_out()
RETURNS TRIGGER AS $$
DECLARE
  v_child_name TEXT;
  v_parent_id UUID;
  v_teacher_name TEXT;
BEGIN
  -- Only notify on check-out (when check_out_time is set)
  IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
    -- Get child name and parent
    SELECT first_name || ' ' || last_name, parent_id
    INTO v_child_name, v_parent_id
    FROM children
    WHERE id = NEW.child_id;
    
    -- Get teacher name
    SELECT display_name INTO v_teacher_name
    FROM profiles
    WHERE id = NEW.checked_out_by_teacher_id;
    
    -- Notify parent
    PERFORM create_notification(
      v_parent_id,
      'child_check_out',
      'Child Checked Out',
      v_child_name || ' was checked out by ' || COALESCE(v_teacher_name, 'staff') || ' at ' || 
      TO_CHAR(NEW.check_out_time, 'HH12:MI AM'),
      jsonb_build_object(
        'child_id', NEW.child_id,
        'check_out_time', NEW.check_out_time,
        'teacher_id', NEW.checked_out_by_teacher_id
      ),
      NEW.child_id,
      NEW.provider_id,
      NEW.checked_out_by_teacher_id,
      NULL,
      '/parent/dashboard',
      'View Details'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_child_check_out
  AFTER UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION notify_child_check_out();

-- =====================================================
-- TEACHER TIME ENTRY NOTIFICATIONS
-- =====================================================

-- Trigger: Teacher Clock-In Notification
CREATE OR REPLACE FUNCTION notify_teacher_clock_in()
RETURNS TRIGGER AS $$
DECLARE
  v_teacher_name TEXT;
BEGIN
  -- Get teacher name
  SELECT display_name INTO v_teacher_name
  FROM profiles
  WHERE id = NEW.teacher_id;
  
  -- Notify provider
  PERFORM create_notification(
    NEW.provider_id,
    'teacher_clock_in',
    'Teacher Clocked In',
    v_teacher_name || ' clocked in at ' || TO_CHAR(NEW.check_in_time, 'HH12:MI AM'),
    jsonb_build_object(
      'teacher_id', NEW.teacher_id,
      'check_in_time', NEW.check_in_time,
      'has_gps', NEW.check_in_latitude IS NOT NULL
    ),
    NULL,
    NEW.provider_id,
    NEW.teacher_id,
    NULL,
    '/provider/dashboard',
    'View Time Entries'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_teacher_clock_in
  AFTER INSERT ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_teacher_clock_in();

-- Trigger: Teacher Clock-Out Notification
CREATE OR REPLACE FUNCTION notify_teacher_clock_out()
RETURNS TRIGGER AS $$
DECLARE
  v_teacher_name TEXT;
BEGIN
  -- Only notify on check-out
  IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
    -- Get teacher name
    SELECT display_name INTO v_teacher_name
    FROM profiles
    WHERE id = NEW.teacher_id;
    
    -- Notify provider
    PERFORM create_notification(
      NEW.provider_id,
      'teacher_clock_out',
      'Teacher Clocked Out',
      v_teacher_name || ' clocked out at ' || TO_CHAR(NEW.check_out_time, 'HH12:MI AM') || 
      ' (' || ROUND(NEW.hours_worked, 2) || ' hours)',
      jsonb_build_object(
        'teacher_id', NEW.teacher_id,
        'check_out_time', NEW.check_out_time,
        'hours_worked', NEW.hours_worked,
        'total_pay', NEW.total_pay
      ),
      NULL,
      NEW.provider_id,
      NEW.teacher_id,
      NULL,
      '/provider/dashboard',
      'Review & Approve'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_teacher_clock_out
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_teacher_clock_out();

-- Trigger: Time Entry Approval/Rejection Notification
CREATE OR REPLACE FUNCTION notify_time_entry_status()
RETURNS TRIGGER AS $$
DECLARE
  v_notification_type notification_type;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only notify on status change
  IF NEW.status != OLD.status THEN
    IF NEW.status = 'approved' THEN
      v_notification_type := 'time_entry_approved';
      v_title := 'Time Entry Approved';
      v_message := 'Your time entry for ' || TO_CHAR(NEW.check_in_time, 'MM/DD/YYYY') || 
                  ' has been approved ($' || ROUND(NEW.total_pay, 2) || ')';
    ELSIF NEW.status = 'rejected' THEN
      v_notification_type := 'time_entry_rejected';
      v_title := 'Time Entry Rejected';
      v_message := 'Your time entry for ' || TO_CHAR(NEW.check_in_time, 'MM/DD/YYYY') || 
                  ' was rejected. Please contact your provider.';
    ELSE
      RETURN NEW;
    END IF;
    
    -- Notify teacher
    PERFORM create_notification(
      NEW.teacher_id,
      v_notification_type,
      v_title,
      v_message,
      jsonb_build_object(
        'time_entry_id', NEW.id,
        'status', NEW.status,
        'hours_worked', NEW.hours_worked,
        'total_pay', NEW.total_pay
      ),
      NULL,
      NEW.provider_id,
      NEW.teacher_id,
      NULL,
      '/teacher',
      'View Details'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_time_entry_status
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_time_entry_status();

-- =====================================================
-- BOOKING NOTIFICATIONS
-- =====================================================

-- Trigger: Booking Confirmation Notification
CREATE OR REPLACE FUNCTION notify_booking_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_name TEXT;
  v_child_name TEXT;
BEGIN
  -- Only notify on status change to confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Get provider name
    SELECT business_name INTO v_provider_name
    FROM profiles
    WHERE id = NEW.provider_id;
    
    -- Get child name
    SELECT first_name || ' ' || last_name INTO v_child_name
    FROM children
    WHERE id = NEW.child_id;
    
    -- Notify parent
    PERFORM create_notification(
      NEW.parent_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking for ' || v_child_name || ' at ' || v_provider_name || 
      ' on ' || TO_CHAR(NEW.start_date, 'MM/DD/YYYY') || ' is confirmed!',
      jsonb_build_object(
        'booking_id', NEW.id,
        'provider_id', NEW.provider_id,
        'child_id', NEW.child_id,
        'start_date', NEW.start_date
      ),
      NEW.child_id,
      NEW.provider_id,
      NULL,
      NEW.id,
      '/parent/dashboard',
      'View Booking'
    );
    
    -- Notify provider
    SELECT first_name || ' ' || last_name INTO v_provider_name
    FROM profiles
    WHERE id = NEW.parent_id;
    
    PERFORM create_notification(
      NEW.provider_id,
      'booking_confirmed',
      'New Booking',
      v_provider_name || ' booked for ' || v_child_name || 
      ' starting ' || TO_CHAR(NEW.start_date, 'MM/DD/YYYY'),
      jsonb_build_object(
        'booking_id', NEW.id,
        'parent_id', NEW.parent_id,
        'child_id', NEW.child_id,
        'start_date', NEW.start_date
      ),
      NEW.child_id,
      NEW.provider_id,
      NULL,
      NEW.id,
      '/provider/dashboard',
      'View Booking'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_booking_confirmed
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_confirmed();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = auth.uid() AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete old notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  -- Delete notifications older than 30 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete expired notifications
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'Stores all system notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification (child_check_in, booking_confirmed, etc)';
COMMENT ON COLUMN notifications.data IS 'JSON data specific to the notification type';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read';
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications';
COMMENT ON FUNCTION mark_notification_read IS 'Mark a specific notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Mark all user notifications as read';
COMMENT ON FUNCTION get_unread_count IS 'Get count of unread notifications for current user';
