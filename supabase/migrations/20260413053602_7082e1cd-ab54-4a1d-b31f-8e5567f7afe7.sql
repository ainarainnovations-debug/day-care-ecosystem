
-- Enum for invite code type
CREATE TYPE public.invite_code_type AS ENUM ('teacher_invite', 'parent_enrollment');

-- Enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Invite codes table
CREATE TABLE public.invite_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  type invite_code_type NOT NULL,
  provider_id uuid NOT NULL,
  created_by uuid NOT NULL,
  used_by uuid,
  used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Providers can view and create their own codes
CREATE POLICY "Providers can view own codes"
  ON public.invite_codes FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Providers can create codes"
  ON public.invite_codes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Providers can update own codes"
  ON public.invite_codes FOR UPDATE
  USING (auth.uid() = created_by);

-- Anyone authenticated can read a code by value (for verification)
CREATE POLICY "Authenticated users can verify codes"
  ON public.invite_codes FOR SELECT TO authenticated
  USING (true);

-- Admins can manage all codes
CREATE POLICY "Admins can manage all codes"
  ON public.invite_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enrollment applications table
CREATE TABLE public.enrollment_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  child_id uuid,
  status application_status NOT NULL DEFAULT 'pending',
  message text,
  provider_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollment_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own applications"
  ON public.enrollment_applications FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create applications"
  ON public.enrollment_applications FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Providers can view applications to their daycare"
  ON public.enrollment_applications FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.provider_profiles WHERE id = enrollment_applications.provider_id
  ));

CREATE POLICY "Providers can update applications to their daycare"
  ON public.enrollment_applications FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.provider_profiles WHERE id = enrollment_applications.provider_id
  ));

CREATE POLICY "Admins can manage all applications"
  ON public.enrollment_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_enrollment_applications_updated_at
  BEFORE UPDATE ON public.enrollment_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
