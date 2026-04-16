
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.user_role AS ENUM ('parent', 'provider', 'admin');
CREATE TYPE public.booking_type AS ENUM ('full_day', 'half_day', 'hourly');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE public.activity_type AS ENUM ('meal', 'nap', 'diaper', 'activity', 'medicine', 'note', 'incident', 'photo');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'parent',
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROVIDER PROFILES
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  address TEXT, city TEXT, state TEXT, zip_code TEXT,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION,
  license_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 8,
  hourly_rate NUMERIC(10,2), half_day_rate NUMERIC(10,2), full_day_rate NUMERIC(10,2),
  age_range_min INTEGER DEFAULT 0, age_range_max INTEGER DEFAULT 12,
  amenities TEXT[] DEFAULT '{}', photos TEXT[] DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  provider_type TEXT DEFAULT 'home',
  custom_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active providers" ON public.provider_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Providers can update own profile" ON public.provider_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can insert own profile" ON public.provider_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all providers" ON public.provider_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON public.provider_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CHILDREN
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE, gender TEXT, allergies TEXT, medical_notes TEXT,
  emergency_contact_name TEXT, emergency_contact_phone TEXT, photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage own children" ON public.children FOR ALL USING (auth.uid() = parent_id);
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROVIDER AVAILABILITY
CREATE TABLE public.provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME, close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (provider_id, day_of_week)
);
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability" ON public.provider_availability FOR SELECT USING (true);
CREATE POLICY "Providers can manage own availability" ON public.provider_availability FOR ALL USING (auth.uid() = provider_id);

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  booking_type booking_type NOT NULL DEFAULT 'full_day',
  date DATE NOT NULL, start_time TIME, end_time TIME,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT, stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Providers can view their bookings" ON public.bookings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Parents can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Providers can update booking status" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Parents can cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Now add the children policy that references bookings
CREATE POLICY "Providers can view booked children" ON public.children FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.child_id = children.id AND b.provider_id = auth.uid() AND b.status IN ('confirmed', 'completed'))
);

-- ATTENDANCE (GPS)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMPTZ, check_out_time TIMESTAMPTZ,
  check_in_lat DOUBLE PRECISION, check_in_lng DOUBLE PRECISION,
  check_out_lat DOUBLE PRECISION, check_out_lng DOUBLE PRECISION,
  checked_in_by TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can manage attendance" ON public.attendance FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Parents can view child attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = attendance.child_id AND c.parent_id = auth.uid())
);

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type activity_type NOT NULL,
  title TEXT, description TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can manage activity logs" ON public.activity_logs FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Parents can view child activities" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.children c WHERE c.id = activity_logs.child_id AND c.parent_id = auth.uid())
);

-- ACTIVITY PHOTOS
CREATE TABLE public.activity_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_log_id UUID REFERENCES public.activity_logs(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL, caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can manage photos" ON public.activity_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.activity_logs al WHERE al.id = activity_photos.activity_log_id AND al.provider_id = auth.uid())
);
CREATE POLICY "Parents can view child photos" ON public.activity_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.activity_logs al JOIN public.children c ON c.id = al.child_id WHERE al.id = activity_photos.activity_log_id AND c.parent_id = auth.uid())
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can mark as read" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT, is_moderated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view moderated reviews" ON public.reviews FOR SELECT USING (is_moderated = true);
CREATE POLICY "Parents can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Admins can moderate reviews" ON public.reviews FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL, commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  period_start DATE, period_end DATE,
  status invoice_status NOT NULL DEFAULT 'draft',
  due_date DATE, paid_at TIMESTAMPTZ, stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Parents can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Providers can create invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false, link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own as read" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- PLATFORM SETTINGS
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.platform_settings (key, value) VALUES ('commission_percentage', '10');

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-photos', 'activity-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-photos', 'provider-photos', true);

CREATE POLICY "Avatar images publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Activity photos publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'activity-photos');
CREATE POLICY "Providers can upload activity photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Provider photos publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'provider-photos');
CREATE POLICY "Providers can upload provider photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'provider-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- INDEXES
CREATE INDEX idx_bookings_parent ON public.bookings(parent_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_activity_logs_child ON public.activity_logs(child_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_provider_profiles_location ON public.provider_profiles(lat, lng);
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
