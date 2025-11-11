-- Drop ALL existing policies on admin_profiles to start fresh
DROP POLICY IF EXISTS "Allow users to read their own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow admins to read all admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow super admins to manage admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow admin to read admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow super_admin to manage admin_profiles" ON public.admin_profiles;

-- Drop the is_admin function as it causes circular dependency
DROP FUNCTION IF EXISTS public.is_admin();

-- Create simple, non-recursive policies
-- Policy 1: Users can read their own admin profile (needed for login check)
CREATE POLICY "Users can read own admin profile"
ON public.admin_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own admin profile
CREATE POLICY "Users can insert own admin profile"
ON public.admin_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Super admins can do everything (using direct role check, no function)
CREATE POLICY "Super admins full access"
ON public.admin_profiles
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM public.admin_profiles 
    WHERE role = 'super_admin' 
    AND user_id = auth.uid()
  )
);