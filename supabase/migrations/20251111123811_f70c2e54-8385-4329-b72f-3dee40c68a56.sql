-- Temporarily disable RLS to insert test data
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- Insert test client
INSERT INTO public.clients (company_name, contact_name, email, phone, address, status)
VALUES ('ABC Corporation', 'John Smith', 'john@abc.com', '555-9999', '789 Business Ave', 'active');

-- Re-enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;