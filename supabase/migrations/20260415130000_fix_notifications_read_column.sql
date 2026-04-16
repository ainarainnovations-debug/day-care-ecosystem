-- Fix notifications table by adding missing read column if it doesn't exist
-- This migration is idempotent and safe to run multiple times

DO $$ 
BEGIN
    -- Check if 'read' column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added read column to notifications table';
    END IF;

    -- Check if 'read_at' column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
        RAISE NOTICE 'Added read_at column to notifications table';
    END IF;
END $$;

-- Create index for unread notifications if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, read) 
WHERE read = false;

-- Update the get_unread_count function to ensure it works correctly
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

COMMENT ON FUNCTION get_unread_count IS 'Get count of unread notifications for current user';
