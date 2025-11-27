-- 1. Create function_groups table
CREATE TABLE public.function_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.function_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow public access function_groups" ON public.function_groups
  FOR ALL USING (true) WITH CHECK (true);

-- Add group_id to functions table
ALTER TABLE public.functions ADD COLUMN group_id UUID REFERENCES public.function_groups(id) ON DELETE SET NULL;

-- Remove tags from functions (keep column but we won't use it)
-- We'll handle this in the UI

-- Remove source from function_inputs (keep column but we won't use it)
-- We'll handle this in the UI

-- Add new columns to function_logic for input/output mappings
ALTER TABLE public.function_logic 
  ADD COLUMN input_mappings JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN fixed_variables JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN output_variables JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN step_output_mappings JSONB DEFAULT '[]'::jsonb;

-- Modify function_outputs for dynamic building from steps
ALTER TABLE public.function_outputs
  ADD COLUMN source_type TEXT DEFAULT 'fixed',
  ADD COLUMN source_step_id TEXT,
  ADD COLUMN fixed_value JSONB DEFAULT '{}'::jsonb;

-- Modify function_error_handling for unified fallback
ALTER TABLE public.function_error_handling
  ADD COLUMN description TEXT,
  ADD COLUMN fallback_type TEXT DEFAULT 'failed',
  ADD COLUMN connected_step_id TEXT,
  ADD COLUMN connected_function_id UUID REFERENCES public.functions(id) ON DELETE SET NULL,
  ADD COLUMN connected_group_id UUID REFERENCES public.function_groups(id) ON DELETE SET NULL;

-- Create index for faster group lookups
CREATE INDEX idx_functions_group_id ON public.functions(group_id);
CREATE INDEX idx_function_groups_project_id ON public.function_groups(project_id);

-- Create trigger for updated_at on function_groups
CREATE TRIGGER update_function_groups_updated_at
  BEFORE UPDATE ON public.function_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();