
-- Function to handle claim approval
CREATE OR REPLACE FUNCTION public.handle_claim_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only act when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Transfer ownership of provider profile to claimant
    UPDATE public.provider_profiles
    SET user_id = NEW.claimant_user_id, updated_at = now()
    WHERE id = NEW.provider_id;

    -- Update claimant's profile role to provider
    UPDATE public.profiles
    SET role = 'provider', updated_at = now()
    WHERE user_id = NEW.claimant_user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on provider_claims
CREATE TRIGGER on_claim_approved
  AFTER UPDATE ON public.provider_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_claim_approval();
