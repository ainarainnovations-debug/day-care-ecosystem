
-- =====================================================
-- MIGRATION: Add Teacher Role & Outstanding Enhancements
-- =====================================================

-- 1. Add 'teacher' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'teacher';

-- 2. Create teacher_profiles table for teacher-specific data
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Professional info
  bio TEXT,
  certifications TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  specializations TEXT[] DEFAULT '{}',
  
  -- Employment details
  hourly_rate NUMERIC(10,2),
  employment_start_date DATE,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave')),
  
  -- Metadata
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Teachers can view and update their own profile
CREATE POLICY "Teachers can view own profile" 
  ON public.teacher_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile" 
  ON public.teacher_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Providers can view their teachers' profiles
CREATE POLICY "Providers can view their teachers" 
  ON public.teacher_profiles FOR SELECT 
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage their teachers" 
  ON public.teacher_profiles FOR ALL 
  USING (auth.uid() = provider_id);

-- Admins can manage all teacher profiles
CREATE POLICY "Admins can manage all teacher profiles" 
  ON public.teacher_profiles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_teacher_profiles_updated_at 
  BEFORE UPDATE ON public.teacher_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create teacher_permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.teacher_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Permission flags
  can_check_in_children BOOLEAN DEFAULT true,
  can_check_out_children BOOLEAN DEFAULT true,
  can_log_activities BOOLEAN DEFAULT true,
  can_upload_photos BOOLEAN DEFAULT true,
  can_message_parents BOOLEAN DEFAULT false,
  can_view_billing BOOLEAN DEFAULT false,
  can_manage_bookings BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(teacher_id, provider_id)
);

ALTER TABLE public.teacher_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own permissions" 
  ON public.teacher_permissions FOR SELECT 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Providers can manage teacher permissions" 
  ON public.teacher_permissions FOR ALL 
  USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all permissions" 
  ON public.teacher_permissions FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_teacher_permissions_updated_at 
  BEFORE UPDATE ON public.teacher_permissions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create time_entries table for teacher clock in/out with auto pay calculation
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Time tracking
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  
  -- Location tracking
  clock_in_lat DOUBLE PRECISION,
  clock_in_lng DOUBLE PRECISION,
  clock_out_lat DOUBLE PRECISION,
  clock_out_lng DOUBLE PRECISION,
  
  -- Pay calculation
  hourly_rate_snapshot NUMERIC(10,2),
  total_hours NUMERIC(10,2),
  gross_pay NUMERIC(10,2),
  
  -- Status
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own time entries" 
  ON public.time_entries FOR SELECT 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create time entries" 
  ON public.time_entries FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own entries" 
  ON public.time_entries FOR UPDATE 
  USING (auth.uid() = teacher_id AND clock_out_time IS NULL);

CREATE POLICY "Providers can view their teachers' time entries" 
  ON public.time_entries FOR SELECT 
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can approve time entries" 
  ON public.time_entries FOR UPDATE 
  USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all time entries" 
  ON public.time_entries FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON public.time_entries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create function to auto-calculate pay when clocking out
CREATE OR REPLACE FUNCTION public.calculate_time_entry_pay()
RETURNS TRIGGER AS $$
DECLARE
  teacher_hourly_rate NUMERIC(10,2);
  hours_worked NUMERIC(10,2);
BEGIN
  -- Only calculate when clocking out
  IF NEW.clock_out_time IS NOT NULL AND OLD.clock_out_time IS NULL THEN
    -- Get teacher's hourly rate
    SELECT hourly_rate INTO teacher_hourly_rate
    FROM public.teacher_profiles
    WHERE user_id = NEW.teacher_id;
    
    -- Calculate hours worked (excluding breaks)
    hours_worked := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0 
                    - (COALESCE(NEW.break_duration_minutes, 0) / 60.0);
    
    -- Update the entry with calculations
    NEW.hourly_rate_snapshot := COALESCE(teacher_hourly_rate, 0);
    NEW.total_hours := ROUND(hours_worked, 2);
    NEW.gross_pay := ROUND(hours_worked * COALESCE(teacher_hourly_rate, 0), 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_pay_on_clock_out
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_time_entry_pay();

-- 6. Update attendance table to allow teachers to check in/out children
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS checked_in_by_teacher_id UUID REFERENCES auth.users(id);
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS checked_out_by_teacher_id UUID REFERENCES auth.users(id);

-- Add policy for teachers to manage attendance
CREATE POLICY "Teachers can manage attendance for their provider" 
  ON public.attendance FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.provider_id = attendance.provider_id
    )
  );

-- 7. Add policy for teachers to create activity logs
CREATE POLICY "Teachers can create activity logs" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.provider_id = activity_logs.provider_id
    )
  );

CREATE POLICY "Teachers can view activity logs for their provider" 
  ON public.activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.provider_id = activity_logs.provider_id
    )
  );

-- 8. Allow teachers to upload activity photos
CREATE POLICY "Teachers can upload activity photos" 
  ON public.activity_photos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activity_logs al
      JOIN public.teacher_profiles tp ON tp.provider_id = al.provider_id
      WHERE al.id = activity_photos.activity_log_id 
      AND tp.user_id = auth.uid()
    )
  );

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_provider ON public.teacher_profiles(provider_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_permissions_teacher ON public.teacher_permissions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_teacher ON public.time_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_provider ON public.time_entries(provider_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(clock_in_time);

-- 10. Create view for teacher dashboard stats
CREATE OR REPLACE VIEW public.teacher_dashboard_stats AS
SELECT 
  te.teacher_id,
  COUNT(DISTINCT DATE(te.clock_in_time)) as days_worked_this_month,
  COALESCE(SUM(te.total_hours), 0) as total_hours_this_month,
  COALESCE(SUM(te.gross_pay), 0) as total_earnings_this_month,
  COUNT(DISTINCT CASE WHEN te.is_approved = false THEN te.id END) as pending_approvals
FROM public.time_entries te
WHERE DATE_TRUNC('month', te.clock_in_time) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY te.teacher_id;

-- 11. Add comments for documentation
COMMENT ON TABLE public.teacher_profiles IS 'Stores teacher-specific professional information and employment details';
COMMENT ON TABLE public.teacher_permissions IS 'Granular permission system for teacher access control per provider';
COMMENT ON TABLE public.time_entries IS 'Teacher time tracking with automatic pay calculation';
COMMENT ON FUNCTION public.calculate_time_entry_pay() IS 'Automatically calculates pay when teacher clocks out';

