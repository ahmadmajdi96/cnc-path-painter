-- Create vision_systems table to store vision system hardware
CREATE TABLE IF NOT EXISTS public.vision_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  camera_type TEXT NOT NULL,
  resolution TEXT NOT NULL,
  communication_type TEXT DEFAULT 'http',
  status TEXT NOT NULL DEFAULT 'offline',
  ip_address TEXT,
  port INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vision_systems ENABLE ROW LEVEL SECURITY;

-- Create policies for vision_systems
CREATE POLICY "Allow public read access vision_systems" 
ON public.vision_systems 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert vision_systems" 
ON public.vision_systems 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update vision_systems" 
ON public.vision_systems 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete vision_systems" 
ON public.vision_systems 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_vision_systems_updated_at
BEFORE UPDATE ON public.vision_systems
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();