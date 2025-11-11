-- Drop all existing policies on admin_profiles
DROP POLICY IF EXISTS "Users can read own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can insert own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admins full access" ON public.admin_profiles;

-- Create a simple policy: users can only read their own admin profile
-- This is all we need for login authentication
CREATE POLICY "Users can view own admin profile"
ON public.admin_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to do everything (for admin operations via backend)
CREATE POLICY "Service role full access"
ON public.admin_profiles
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');