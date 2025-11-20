-- Create website_builds table
CREATE TABLE public.website_builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  website_type TEXT NOT NULL,
  use_cases TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  redirections JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'building',
  result_file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.website_builds ENABLE ROW LEVEL SECURITY;

-- Create policies for website_builds
CREATE POLICY "Users can view their project's website builds" 
ON public.website_builds 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create website builds" 
ON public.website_builds 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their website builds" 
ON public.website_builds 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their website builds" 
ON public.website_builds 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_builds_updated_at
BEFORE UPDATE ON public.website_builds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_website_builds_project_id ON public.website_builds(project_id);
CREATE INDEX idx_website_builds_status ON public.website_builds(status);