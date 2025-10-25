-- Create datasets table
CREATE TABLE public.datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'file', 'text')),
  mode TEXT CHECK (mode IN ('classify', 'annotate')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dataset_classes table
CREATE TABLE public.dataset_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dataset_items table (for images, files, text)
CREATE TABLE public.dataset_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  content TEXT,
  classification_class_id UUID REFERENCES public.dataset_classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dataset_annotations table
CREATE TABLE public.dataset_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_item_id UUID NOT NULL REFERENCES public.dataset_items(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.dataset_classes(id) ON DELETE CASCADE,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for datasets
CREATE POLICY "Allow public read access datasets"
  ON public.datasets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update datasets"
  ON public.datasets FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete datasets"
  ON public.datasets FOR DELETE
  USING (true);

-- Create policies for dataset_classes
CREATE POLICY "Allow public access dataset_classes"
  ON public.dataset_classes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for dataset_items
CREATE POLICY "Allow public access dataset_items"
  ON public.dataset_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for dataset_annotations
CREATE POLICY "Allow public access dataset_annotations"
  ON public.dataset_annotations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_dataset_classes_dataset_id ON public.dataset_classes(dataset_id);
CREATE INDEX idx_dataset_items_dataset_id ON public.dataset_items(dataset_id);
CREATE INDEX idx_dataset_annotations_item_id ON public.dataset_annotations(dataset_item_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();