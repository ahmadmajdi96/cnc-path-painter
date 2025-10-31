-- Create location_datasets table to store named location datasets
CREATE TABLE IF NOT EXISTS public.location_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table to link locations to datasets
CREATE TABLE IF NOT EXISTS public.location_dataset_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.location_datasets(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dataset_id, location_id)
);

-- Enable RLS
ALTER TABLE public.location_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_dataset_items ENABLE ROW LEVEL SECURITY;

-- Create policies for location_datasets
CREATE POLICY "Allow public read access location_datasets" 
ON public.location_datasets 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert location_datasets" 
ON public.location_datasets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update location_datasets" 
ON public.location_datasets 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete location_datasets" 
ON public.location_datasets 
FOR DELETE 
USING (true);

-- Create policies for location_dataset_items
CREATE POLICY "Allow public read access location_dataset_items" 
ON public.location_dataset_items 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert location_dataset_items" 
ON public.location_dataset_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public delete location_dataset_items" 
ON public.location_dataset_items 
FOR DELETE 
USING (true);

-- Create trigger for updating location_datasets updated_at
CREATE TRIGGER update_location_datasets_updated_at
BEFORE UPDATE ON public.location_datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();