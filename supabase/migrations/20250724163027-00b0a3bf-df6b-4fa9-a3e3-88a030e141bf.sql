
-- Create the 3d_printers table
CREATE TABLE IF NOT EXISTS public.3d_printers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  model text NOT NULL,
  manufacturer text,
  status text NOT NULL DEFAULT 'idle'::text,
  max_build_volume_x numeric,
  max_build_volume_y numeric,
  max_build_volume_z numeric,
  nozzle_diameter numeric,
  max_hotend_temp integer,
  max_bed_temp integer,
  endpoint_url text,
  ip_address text,
  port integer,
  protocol text DEFAULT 'http'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.3d_printers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (matching other machine tables)
CREATE POLICY "Allow public read access 3d_printers" 
  ON public.3d_printers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert 3d_printers" 
  ON public.3d_printers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update 3d_printers" 
  ON public.3d_printers 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete 3d_printers" 
  ON public.3d_printers 
  FOR DELETE 
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_3d_printers_updated_at 
  BEFORE UPDATE ON public.3d_printers 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
