
-- Admin audit log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.admin_audit_log FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_audit_log_admin ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_audit_log_target ON public.admin_audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_created ON public.admin_audit_log(created_at DESC);

-- Security definer function to log admin access
CREATE OR REPLACE FUNCTION public.log_admin_access(
  _action TEXT,
  _target_type TEXT,
  _target_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), _action, _target_type, _target_id, _details);
END;
$$;

-- Alert severity enum
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Admin alerts table
CREATE TABLE public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  related_provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view alerts" ON public.admin_alerts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update alerts" ON public.admin_alerts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert alerts" ON public.admin_alerts FOR INSERT WITH CHECK (true);
CREATE INDEX idx_alerts_unresolved ON public.admin_alerts(is_resolved, created_at DESC);

-- Trigger: alert on booking cancellation
CREATE OR REPLACE FUNCTION public.check_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  cancel_count INTEGER;
BEGIN
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Count recent cancellations by this parent
    SELECT COUNT(*) INTO cancel_count
    FROM public.bookings
    WHERE parent_id = NEW.parent_id
      AND status = 'cancelled'
      AND updated_at > now() - interval '30 days';

    IF cancel_count >= 3 THEN
      INSERT INTO public.admin_alerts (alert_type, severity, title, description, related_user_id, related_booking_id)
      VALUES (
        'cancellation_spike',
        'medium',
        'Frequent cancellations detected',
        format('Parent has cancelled %s bookings in the last 30 days', cancel_count + 1),
        NEW.parent_id,
        NEW.id
      );
    END IF;

    -- Also create a single alert for any cancellation
    INSERT INTO public.admin_alerts (alert_type, severity, title, description, related_user_id, related_booking_id, related_provider_id)
    VALUES (
      'booking_cancelled',
      'low',
      'Booking cancelled',
      format('Booking on %s was cancelled', NEW.date),
      NEW.parent_id,
      NEW.id,
      NEW.provider_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_booking_cancellation
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_booking_cancellation();

-- Trigger: alert on negative review
CREATE OR REPLACE FUNCTION public.check_negative_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating <= 2 THEN
    INSERT INTO public.admin_alerts (alert_type, severity, title, description, related_user_id, related_provider_id)
    VALUES (
      'negative_review',
      CASE WHEN NEW.rating = 1 THEN 'high'::alert_severity ELSE 'medium'::alert_severity END,
      format('%s-star review submitted', NEW.rating),
      COALESCE(LEFT(NEW.comment, 200), 'No comment provided'),
      NEW.parent_id,
      NEW.provider_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_negative_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.check_negative_review();

-- Trigger: alert on overdue invoice
CREATE OR REPLACE FUNCTION public.check_invoice_overdue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    INSERT INTO public.admin_alerts (alert_type, severity, title, description, related_user_id, related_provider_id)
    VALUES (
      'payment_issue',
      'high',
      format('Invoice overdue: $%s', NEW.amount),
      format('Invoice for period %s to %s is overdue', NEW.period_start, NEW.period_end),
      NEW.parent_id,
      NEW.provider_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_invoice_overdue
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.check_invoice_overdue();

-- Add privacy notice to platform settings
INSERT INTO public.platform_settings (key, value) VALUES 
  ('privacy_notice', 'For safety and support purposes, CareConnect may access booking data when necessary.'),
  ('admin_sensitive_access_requires_logging', 'true');
