-- Fix RLS policies to use the security definer function correctly
DROP POLICY IF EXISTS "Allow admin full access to clients" ON public.clients;

CREATE POLICY "Allow admin full access to clients"
ON public.clients
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix payments
DROP POLICY IF EXISTS "Allow admin full access to payments" ON public.payments;

CREATE POLICY "Allow admin full access to payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Fix project_resources
DROP POLICY IF EXISTS "Allow admin full access to project_resources" ON public.project_resources;

CREATE POLICY "Allow admin full access to project_resources"
ON public.project_resources
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));