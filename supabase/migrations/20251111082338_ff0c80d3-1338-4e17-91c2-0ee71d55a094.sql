-- Drop the existing policy that's missing the 'to authenticated' clause
DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admin_profiles;

-- Recreate it with the proper 'to authenticated' clause
CREATE POLICY "Users can view own admin profile"
ON public.admin_profiles
FOR SELECT
TO authenticated  -- This is critical!
USING (auth.uid() = user_id);