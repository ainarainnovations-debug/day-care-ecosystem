-- Create claim_status enum
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');

-- Create provider_claims table
CREATE TABLE provider_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification information
  business_ein TEXT,
  verification_notes TEXT,
  document_urls TEXT[],
  
  -- Status tracking
  status claim_status NOT NULL DEFAULT 'pending',
  
  -- Review information
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_provider_claims_provider_id ON provider_claims(provider_id);
CREATE INDEX idx_provider_claims_claimant_user_id ON provider_claims(claimant_user_id);
CREATE INDEX idx_provider_claims_status ON provider_claims(status);
CREATE INDEX idx_provider_claims_created_at ON provider_claims(created_at DESC);

-- Enable Row Level Security
ALTER TABLE provider_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own claims
CREATE POLICY "Users can view their own claims"
  ON provider_claims
  FOR SELECT
  USING (claimant_user_id = auth.uid());

-- Users can create claims for themselves
CREATE POLICY "Users can create claims"
  ON provider_claims
  FOR INSERT
  WITH CHECK (claimant_user_id = auth.uid());

-- Users can update their own pending claims
CREATE POLICY "Users can update their pending claims"
  ON provider_claims
  FOR UPDATE
  USING (claimant_user_id = auth.uid() AND status = 'pending')
  WITH CHECK (claimant_user_id = auth.uid() AND status = 'pending');

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON provider_claims
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update claims (for review)
CREATE POLICY "Admins can update claims"
  ON provider_claims
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Providers can view claims for their business
CREATE POLICY "Providers can view claims for their business"
  ON provider_claims
  FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM provider_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_provider_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_claims_updated_at
  BEFORE UPDATE ON provider_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_claims_updated_at();

-- Comments
COMMENT ON TABLE provider_claims IS 'Claims submitted by users to verify ownership of daycare businesses';
COMMENT ON COLUMN provider_claims.business_ein IS 'Business EIN for verification';
COMMENT ON COLUMN provider_claims.verification_notes IS 'Additional notes from claimant for verification';
COMMENT ON COLUMN provider_claims.document_urls IS 'URLs to uploaded verification documents';
COMMENT ON COLUMN provider_claims.status IS 'Current status of the claim: pending, approved, or rejected';
COMMENT ON COLUMN provider_claims.reviewed_by IS 'Admin user who reviewed the claim';
COMMENT ON COLUMN provider_claims.admin_notes IS 'Notes from admin during review';
