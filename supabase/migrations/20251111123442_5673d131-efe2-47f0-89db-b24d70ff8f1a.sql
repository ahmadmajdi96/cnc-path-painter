-- Drop existing policies on clients table
DROP POLICY IF EXISTS "Allow admin full access to clients" ON public.clients;

-- Create new policy that properly checks admin status
CREATE POLICY "Allow admin full access to clients"
ON public.clients
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
);

-- Update payments table policies
DROP POLICY IF EXISTS "Allow admin full access to payments" ON public.payments;

CREATE POLICY "Allow admin full access to payments"
ON public.payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
);

-- Update project_resources table policies
DROP POLICY IF EXISTS "Allow admin full access to project_resources" ON public.project_resources;

CREATE POLICY "Allow admin full access to project_resources"
ON public.project_resources
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  )
);

-- Test by inserting a client record for the admin user
INSERT INTO public.clients (company_name, contact_name, email, phone, address, status)
VALUES ('Test Company', 'Test Contact', 'test@example.com', '123-456-7890', '123 Test St', 'active');