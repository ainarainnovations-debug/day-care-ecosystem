-- =====================================================
-- PHOTO STORAGE SYSTEM MIGRATION
-- =====================================================
-- Creates comprehensive photo upload and storage system:
-- - Storage buckets configuration
-- - photos table for metadata
-- - RLS policies
-- - Helper functions
-- =====================================================

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets (if not exists)
-- Note: Storage buckets are created via Supabase Dashboard or API
-- This is a reference for manual setup

-- Bucket: profile-photos
-- Purpose: User profile pictures
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: child-photos
-- Purpose: Child profile photos and activity photos
-- Public: false (requires authentication)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: facility-photos
-- Purpose: Provider facility photos
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Bucket: activity-photos
-- Purpose: Daily activity photos from teachers
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4

-- Bucket: message-attachments
-- Purpose: Files attached to messages
-- Public: false
-- File size limit: 20MB
-- Allowed MIME types: All

-- =====================================================
-- PHOTOS METADATA TABLE
-- =====================================================

CREATE TYPE photo_type AS ENUM (
  'profile',
  'child_profile',
  'facility',
  'activity',
  'meal',
  'nap',
  'play',
  'learning',
  'message_attachment',
  'other'
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Storage details
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  
  -- Photo metadata
  type photo_type NOT NULL,
  caption TEXT,
  
  -- Related entities
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Full storage URL (computed)
  url TEXT GENERATED ALWAYS AS (
    'https://[project-ref].supabase.co/storage/v1/object/public/' || bucket || '/' || path
  ) STORED,
  
  -- Unique constraint on path
  UNIQUE(bucket, path)
);

-- Create indexes
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_photos_child_id ON photos(child_id) WHERE child_id IS NOT NULL;
CREATE INDEX idx_photos_provider_id ON photos(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX idx_photos_activity_id ON photos(activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX idx_photos_type ON photos(type);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR PHOTOS TABLE
-- =====================================================

-- Users can view their own uploaded photos
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = uploaded_by);

-- Users can view public photos
CREATE POLICY "Anyone can view public photos"
  ON photos FOR SELECT
  USING (is_public = true);

-- Parents can view photos of their children
CREATE POLICY "Parents can view their children's photos"
  ON photos FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Providers can view photos from their facility
CREATE POLICY "Providers can view their facility photos"
  ON photos FOR SELECT
  USING (provider_id = auth.uid());

-- Teachers can view photos from children they care for
CREATE POLICY "Teachers can view photos from assigned children"
  ON photos FOR SELECT
  USING (
    child_id IN (
      SELECT DISTINCT child_id 
      FROM attendance 
      WHERE checked_in_by_teacher_id = auth.uid() 
        OR checked_out_by_teacher_id = auth.uid()
    )
  );

-- Users can insert their own photos
CREATE POLICY "Users can upload photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Admins can do everything
CREATE POLICY "Admins can manage all photos"
  ON photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- STORAGE POLICIES (Reference)
-- =====================================================
-- These are set via Supabase Dashboard or API
-- Included here for documentation

-- POLICY: profile-photos bucket
-- SELECT: public (anyone can view)
-- INSERT: authenticated users can upload to their own folder
-- UPDATE: users can update their own photos
-- DELETE: users can delete their own photos

-- POLICY: child-photos bucket
-- SELECT: parents can view their children's photos
-- INSERT: teachers and parents can upload
-- UPDATE: uploader only
-- DELETE: uploader only

-- POLICY: facility-photos bucket
-- SELECT: public (anyone can view)
-- INSERT: providers only
-- UPDATE: provider only
-- DELETE: provider only

-- POLICY: activity-photos bucket
-- SELECT: parents of the child, teachers, provider
-- INSERT: teachers only
-- UPDATE: uploader only
-- DELETE: uploader only

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create photo record
CREATE OR REPLACE FUNCTION create_photo(
  p_bucket TEXT,
  p_path TEXT,
  p_filename TEXT,
  p_mime_type TEXT,
  p_size_bytes INTEGER,
  p_type photo_type,
  p_caption TEXT DEFAULT NULL,
  p_child_id UUID DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL,
  p_activity_id UUID DEFAULT NULL,
  p_message_id UUID DEFAULT NULL,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_photo_id UUID;
BEGIN
  INSERT INTO photos (
    uploaded_by,
    bucket,
    path,
    filename,
    mime_type,
    size_bytes,
    type,
    caption,
    child_id,
    provider_id,
    activity_id,
    message_id,
    width,
    height,
    is_public
  ) VALUES (
    auth.uid(),
    p_bucket,
    p_path,
    p_filename,
    p_mime_type,
    p_size_bytes,
    p_type,
    p_caption,
    p_child_id,
    p_provider_id,
    p_activity_id,
    p_message_id,
    p_width,
    p_height,
    p_is_public
  ) RETURNING id INTO v_photo_id;
  
  RETURN v_photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's photos
CREATE OR REPLACE FUNCTION get_user_photos(p_user_id UUID DEFAULT NULL)
RETURNS SETOF photos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM photos
  WHERE uploaded_by = COALESCE(p_user_id, auth.uid())
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get child's photos
CREATE OR REPLACE FUNCTION get_child_photos(p_child_id UUID)
RETURNS SETOF photos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM photos
  WHERE child_id = p_child_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity photos
CREATE OR REPLACE FUNCTION get_activity_photos(p_activity_id UUID)
RETURNS SETOF photos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM photos
  WHERE activity_id = p_activity_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete photo (also removes from storage)
CREATE OR REPLACE FUNCTION delete_photo(p_photo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_bucket TEXT;
  v_path TEXT;
BEGIN
  -- Get storage details
  SELECT bucket, path INTO v_bucket, v_path
  FROM photos
  WHERE id = p_photo_id AND uploaded_by = auth.uid();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Delete from database
  DELETE FROM photos WHERE id = p_photo_id;
  
  -- Note: Actual storage deletion should be done via client SDK
  -- This function only removes the database record
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ACTIVITIES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Activity details
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity info
  type TEXT NOT NULL, -- meal, nap, play, learning, diaper, etc.
  title TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notes
  notes TEXT
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_activities_child_id ON activities(child_id);
CREATE INDEX IF NOT EXISTS idx_activities_teacher_id ON activities(teacher_id);
CREATE INDEX IF NOT EXISTS idx_activities_provider_id ON activities(provider_id);
CREATE INDEX IF NOT EXISTS idx_activities_occurred_at ON activities(occurred_at DESC);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Parents can view their children's activities"
  ON activities FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view activities they logged"
  ON activities FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Providers can view their facility activities"
  ON activities FOR SELECT
  USING (provider_id = auth.uid());

CREATE POLICY "Teachers can create activities"
  ON activities FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their activities"
  ON activities FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their activities"
  ON activities FOR DELETE
  USING (teacher_id = auth.uid());

-- =====================================================
-- MESSAGES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Thread grouping (optional)
  thread_id UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id) WHERE thread_id IS NOT NULL;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view sent messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view received messages"
  ON messages FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update messages (mark as read)"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- =====================================================
-- UPDATE PROFILES TABLE
-- =====================================================

-- Add profile_photo_url column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL;

-- Add facility photo references
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS facility_photos JSONB DEFAULT '[]';

-- =====================================================
-- UPDATE CHILDREN TABLE
-- =====================================================

-- Add photo_url column if not exists
ALTER TABLE children
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_id UUID REFERENCES photos(id) ON DELETE SET NULL;

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_photo TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_photos TO authenticated;
GRANT EXECUTE ON FUNCTION get_child_photos TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_photos TO authenticated;
GRANT EXECUTE ON FUNCTION delete_photo TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE photos IS 'Stores metadata for all uploaded photos across the platform';
COMMENT ON COLUMN photos.bucket IS 'Supabase Storage bucket name';
COMMENT ON COLUMN photos.path IS 'Full path within the bucket';
COMMENT ON COLUMN photos.type IS 'Category of photo (profile, activity, facility, etc)';
COMMENT ON COLUMN photos.is_public IS 'Whether photo is publicly accessible';
COMMENT ON FUNCTION create_photo IS 'Helper function to create photo record after upload';
COMMENT ON FUNCTION delete_photo IS 'Soft delete photo from database (client must delete from storage)';

-- =====================================================
-- NOTIFICATION INTEGRATION
-- =====================================================

-- Trigger: Notify parent when activity photo is uploaded
CREATE OR REPLACE FUNCTION notify_activity_photo_uploaded()
RETURNS TRIGGER AS $$
DECLARE
  v_child_name TEXT;
  v_parent_id UUID;
  v_teacher_name TEXT;
  v_activity_title TEXT;
BEGIN
  -- Get activity details
  SELECT 
    c.first_name || ' ' || c.last_name,
    c.parent_id,
    p.display_name,
    a.title
  INTO v_child_name, v_parent_id, v_teacher_name, v_activity_title
  FROM activities a
  JOIN children c ON a.child_id = c.id
  JOIN profiles p ON a.teacher_id = p.id
  WHERE a.id = NEW.activity_id;
  
  -- Create notification for parent
  IF v_parent_id IS NOT NULL THEN
    PERFORM create_notification(
      v_parent_id,
      'activity_logged',
      'New Activity Photo',
      v_teacher_name || ' posted a photo for ' || v_child_name || ': ' || v_activity_title,
      jsonb_build_object(
        'photo_id', NEW.id,
        'activity_id', NEW.activity_id,
        'child_id', NEW.child_id
      ),
      NEW.child_id,
      NEW.provider_id,
      NEW.uploaded_by,
      NULL,
      '/parent/dashboard',
      'View Activity'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_activity_photo
  AFTER INSERT ON photos
  FOR EACH ROW
  WHEN (NEW.type = 'activity' OR NEW.type = 'meal' OR NEW.type = 'nap' OR NEW.type = 'play' OR NEW.type = 'learning')
  EXECUTE FUNCTION notify_activity_photo_uploaded();

-- =====================================================
-- STORAGE BUCKET SETUP INSTRUCTIONS
-- =====================================================

-- Note: Storage buckets must be created via Supabase Dashboard or API
-- 
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create the following buckets:
--    - profile-photos (public: true, 5MB limit)
--    - child-photos (public: false, 10MB limit)
--    - facility-photos (public: true, 10MB limit)
--    - activity-photos (public: false, 10MB limit)
--    - message-attachments (public: false, 20MB limit)
-- 
-- 3. Set storage policies for each bucket (see above for reference)
--
-- Or use the Supabase CLI:
-- npx supabase storage create profile-photos --public
-- npx supabase storage create child-photos
-- npx supabase storage create facility-photos --public
-- npx supabase storage create activity-photos
-- npx supabase storage create message-attachments
