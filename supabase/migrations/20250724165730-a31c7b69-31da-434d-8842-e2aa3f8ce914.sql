-- Create the printer_3d table (renamed to avoid numeric prefix)
CREATE TABLE public.printer_3d (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  endpoint_url TEXT,
  ip_address TEXT,
  port INTEGER,
  protocol TEXT DEFAULT 'http',
  max_build_volume_x NUMERIC,
  max_build_volume_y NUMERIC,
  max_build_volume_z NUMERIC,
  nozzle_diameter NUMERIC,
  max_hotend_temp INTEGER,
  max_bed_temp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.printer_3d ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (similar to other machine tables)
CREATE POLICY "Allow public read access printer_3d" 
  ON public.printer_3d 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert printer_3d" 
  ON public.printer_3d 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update printer_3d" 
  ON public.printer_3d 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete printer_3d" 
  ON public.printer_3d 
  FOR DELETE 
  USING (true);

-- Add trigger for updating updated_at column
CREATE TRIGGER update_printer_3d_updated_at 
  BEFORE UPDATE ON public.printer_3d 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();