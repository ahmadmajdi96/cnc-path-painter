-- Add is_built column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_built boolean DEFAULT false;

-- Create project_components table
CREATE TABLE IF NOT EXISTS public.project_components (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  component_type text NOT NULL, -- 'integration', 'automation', 'dataset', 'chatbot', 'workflow'
  component_id uuid NOT NULL,
  component_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_components ENABLE ROW LEVEL SECURITY;

-- Create policies for project_components
CREATE POLICY "Allow admin full access to project_components"
  ON public.project_components
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_project_components_updated_at
  BEFORE UPDATE ON public.project_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_components_project_id ON public.project_components(project_id);
CREATE INDEX IF NOT EXISTS idx_project_components_component_type ON public.project_components(component_type);