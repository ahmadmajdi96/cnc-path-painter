-- Drop the problematic policies
DROP POLICY IF EXISTS "Allow admin to read admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow super_admin to manage admin_profiles" ON public.admin_profiles;

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
$$;

-- Create new policies using the security definer function
CREATE POLICY "Allow users to read their own admin profile"
ON public.admin_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Allow admins to read all admin profiles"
ON public.admin_profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Allow super admins to manage admin profiles"
ON public.admin_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);