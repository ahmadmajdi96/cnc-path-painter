
-- Create endpoints table to store endpoint configurations for machines
CREATE TABLE public.endpoints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;

-- Create policies for endpoints
CREATE POLICY "Allow public read access endpoints" 
  ON public.endpoints 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert endpoints" 
  ON public.endpoints 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update endpoints" 
  ON public.endpoints 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete endpoints" 
  ON public.endpoints 
  FOR DELETE 
  USING (true);

-- Add trigger to update updated_at column
CREATE TRIGGER update_endpoints_updated_at
  BEFORE UPDATE ON public.endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
