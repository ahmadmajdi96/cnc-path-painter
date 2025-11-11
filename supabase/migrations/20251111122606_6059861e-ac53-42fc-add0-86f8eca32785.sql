-- Drop existing policies on clients table
DROP POLICY IF EXISTS "Allow admin full access to clients" ON public.clients;

-- Create new policy using security definer function
CREATE POLICY "Allow admin full access to clients"
ON public.clients
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update payments table policies
DROP POLICY IF EXISTS "Allow admin full access to payments" ON public.payments;

CREATE POLICY "Allow admin full access to payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update project_resources table policies
DROP POLICY IF EXISTS "Allow admin full access to project_resources" ON public.project_resources;

CREATE POLICY "Allow admin full access to project_resources"
ON public.project_resources
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));