
-- Create the cnc_machines table
CREATE TABLE public.cnc_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT,
  status TEXT NOT NULL DEFAULT 'idle',
  work_area TEXT,
  max_spindle_speed INTEGER,
  max_feed_rate INTEGER,
  plunge_rate INTEGER,
  safe_height NUMERIC,
  work_height NUMERIC,
  ip_address TEXT,
  port INTEGER,
  protocol TEXT DEFAULT 'modbus',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the toolpaths table
CREATE TABLE public.toolpaths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnc_machine_id UUID NOT NULL REFERENCES public.cnc_machines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points JSONB NOT NULL DEFAULT '[]'::jsonb,
  machine_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for cnc_machines
ALTER TABLE public.cnc_machines ENABLE ROW LEVEL SECURITY;

-- Create policies for cnc_machines (allowing public access for now)
CREATE POLICY "Allow public read access cnc_machines" 
  ON public.cnc_machines 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert cnc_machines" 
  ON public.cnc_machines 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update cnc_machines" 
  ON public.cnc_machines 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete cnc_machines" 
  ON public.cnc_machines 
  FOR DELETE 
  USING (true);

-- Enable Row Level Security (RLS) for toolpaths
ALTER TABLE public.toolpaths ENABLE ROW LEVEL SECURITY;

-- Create policies for toolpaths (allowing public access for now)
CREATE POLICY "Allow public read access toolpaths" 
  ON public.toolpaths 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert toolpaths" 
  ON public.toolpaths 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update toolpaths" 
  ON public.toolpaths 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete toolpaths" 
  ON public.toolpaths 
  FOR DELETE 
  USING (true);

-- Create trigger to update updated_at column for cnc_machines
CREATE TRIGGER update_cnc_machines_updated_at
  BEFORE UPDATE ON public.cnc_machines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at column for toolpaths
CREATE TRIGGER update_toolpaths_updated_at
  BEFORE UPDATE ON public.toolpaths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
