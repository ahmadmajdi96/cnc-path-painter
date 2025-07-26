-- Create table for storing 3D printer configurations
CREATE TABLE public.printer_3d_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID REFERENCES public.printer_3d(id) ON DELETE CASCADE,
  endpoint_url TEXT,
  build_volume_x NUMERIC DEFAULT 200,
  build_volume_y NUMERIC DEFAULT 200,
  build_volume_z NUMERIC DEFAULT 200,
  models JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.printer_3d_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching the pattern of other tables)
CREATE POLICY "Allow public read access printer_3d_configurations" 
ON public.printer_3d_configurations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert printer_3d_configurations" 
ON public.printer_3d_configurations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update printer_3d_configurations" 
ON public.printer_3d_configurations 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete printer_3d_configurations" 
ON public.printer_3d_configurations 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_printer_3d_configurations_updated_at
BEFORE UPDATE ON public.printer_3d_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();