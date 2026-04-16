
DROP POLICY "System can insert alerts" ON public.admin_alerts;
CREATE POLICY "Admins can insert alerts" ON public.admin_alerts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
