-- Create table for dataset combinations
CREATE TABLE IF NOT EXISTS public.dataset_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  dataset_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dataset_combinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view dataset combinations"
  ON public.dataset_combinations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create dataset combinations"
  ON public.dataset_combinations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update dataset combinations"
  ON public.dataset_combinations
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete dataset combinations"
  ON public.dataset_combinations
  FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_dataset_combinations_updated_at
  BEFORE UPDATE ON public.dataset_combinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();