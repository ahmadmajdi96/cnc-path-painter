
-- Add endpoint_url column to cnc_machines table
ALTER TABLE public.cnc_machines 
ADD COLUMN endpoint_url TEXT;
