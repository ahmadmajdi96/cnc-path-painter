-- Drop and recreate the RLS policies with explicit schema references
DROP POLICY IF EXISTS "Allow admin full access to clients" ON public.clients;

-- Create separate policies for each operation
CREATE POLICY "Admin can select clients"
ON public.clients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
);