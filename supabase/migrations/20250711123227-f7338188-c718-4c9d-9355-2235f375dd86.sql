
-- Create laser_machines table
CREATE TABLE public.laser_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  max_power INTEGER DEFAULT 100,
  max_frequency INTEGER DEFAULT 10000,
  max_speed INTEGER DEFAULT 2000,
  beam_diameter NUMERIC DEFAULT 0.1,
  endpoint_url TEXT,
  ip_address TEXT,
  port INTEGER,
  protocol TEXT DEFAULT 'http',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create laser_toolpaths table
CREATE TABLE public.laser_toolpaths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laser_machine_id UUID NOT NULL REFERENCES public.laser_machines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points JSONB NOT NULL DEFAULT '[]'::jsonb,
  laser_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.laser_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laser_toolpaths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for laser_machines
CREATE POLICY "Allow public read access laser_machines" 
  ON public.laser_machines 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert laser_machines" 
  ON public.laser_machines 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update laser_machines" 
  ON public.laser_machines 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete laser_machines" 
  ON public.laser_machines 
  FOR DELETE 
  USING (true);

-- Create RLS policies for laser_toolpaths
CREATE POLICY "Allow public read access laser_toolpaths" 
  ON public.laser_toolpaths 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert laser_toolpaths" 
  ON public.laser_toolpaths 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update laser_toolpaths" 
  ON public.laser_toolpaths 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete laser_toolpaths" 
  ON public.laser_toolpaths 
  FOR DELETE 
  USING (true);

-- Create trigger to update updated_at column
CREATE TRIGGER update_laser_machines_updated_at
  BEFORE UPDATE ON public.laser_machines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laser_toolpaths_updated_at
  BEFORE UPDATE ON public.laser_toolpaths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
