
-- Add 'teacher' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'teacher';

-- Create teacher_profiles table
CREATE TABLE public.teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  bio text,
  certifications text[],
  years_experience integer,
  specializations text[],
  hourly_rate numeric,
  employment_start_date date,
  employment_status text NOT NULL DEFAULT 'active',
  emergency_contact_name text,
  emergency_contact_phone text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create teacher_permissions table
CREATE TABLE public.teacher_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL,
  can_check_in_children boolean NOT NULL DEFAULT true,
  can_check_out_children boolean NOT NULL DEFAULT true,
  can_log_activities boolean NOT NULL DEFAULT true,
  can_upload_photos boolean NOT NULL DEFAULT true,
  can_message_parents boolean NOT NULL DEFAULT true,
  can_view_billing boolean NOT NULL DEFAULT false,
  can_manage_bookings boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  clock_in_time timestamptz NOT NULL DEFAULT now(),
  clock_out_time timestamptz,
  break_duration_minutes integer DEFAULT 0,
  clock_in_lat double precision,
  clock_in_lng double precision,
  clock_out_lat double precision,
  clock_out_lng double precision,
  hourly_rate_snapshot numeric,
  total_hours numeric,
  gross_pay numeric,
  is_approved boolean NOT NULL DEFAULT false,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Teacher profiles: teachers can view/update own, providers can view their teachers
CREATE POLICY "Teachers can view own profile" ON public.teacher_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can update own profile" ON public.teacher_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can view their teachers" ON public.teacher_profiles FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can manage their teachers" ON public.teacher_profiles FOR ALL USING (auth.uid() = provider_id);

-- Teacher permissions: teachers can view own, providers can manage
CREATE POLICY "Teachers can view own permissions" ON public.teacher_permissions FOR SELECT USING (EXISTS (SELECT 1 FROM public.teacher_profiles tp WHERE tp.id = teacher_permissions.teacher_id AND tp.user_id = auth.uid()));
CREATE POLICY "Providers can manage permissions" ON public.teacher_permissions FOR ALL USING (auth.uid() = provider_id);

-- Time entries: teachers can manage own, providers can view/approve
CREATE POLICY "Teachers can view own time entries" ON public.time_entries FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can insert own time entries" ON public.time_entries FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own time entries" ON public.time_entries FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Providers can view their time entries" ON public.time_entries FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can update time entries" ON public.time_entries FOR UPDATE USING (auth.uid() = provider_id);

-- Updated_at triggers
CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON public.teacher_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_permissions_updated_at BEFORE UPDATE ON public.teacher_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
