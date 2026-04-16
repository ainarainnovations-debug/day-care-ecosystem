-- Create admin user
-- This migration will be run after the user signs up

-- Function to create admin profile when user signs up
CREATE OR REPLACE FUNCTION create_admin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'acerneau.97@gmail.com' THEN
    INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      'admin',
      'Admin User',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'admin',
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin user creation
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_admin_on_signup();
