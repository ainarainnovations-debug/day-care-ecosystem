
-- Create claim status enum
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-- Create provider_claims table
CREATE TABLE public.provider_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claimant_user_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  business_ein TEXT,
  verification_notes TEXT,
  document_urls TEXT[] DEFAULT '{}',
  status claim_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(claimant_user_id, provider_id)
);

-- Enable RLS
ALTER TABLE public.provider_claims ENABLE ROW LEVEL SECURITY;

-- Users can submit claims
CREATE POLICY "Users can create claims"
  ON public.provider_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = claimant_user_id);

-- Users can view own claims
CREATE POLICY "Users can view own claims"
  ON public.provider_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = claimant_user_id);

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON public.provider_claims FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update claims
CREATE POLICY "Admins can update claims"
  ON public.provider_claims FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_provider_claims_updated_at
  BEFORE UPDATE ON public.provider_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
