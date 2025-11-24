-- Create functions table (main automation/function table)
CREATE TABLE IF NOT EXISTS public.functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_locked BOOLEAN DEFAULT false,
  version_number TEXT DEFAULT '1.0.0',
  editable_by JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_inputs table
CREATE TABLE IF NOT EXISTS public.function_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  default_value JSONB,
  source TEXT,
  constraints JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_outputs table
CREATE TABLE IF NOT EXISTS public.function_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  output_name TEXT NOT NULL,
  output_type TEXT NOT NULL,
  success_structure JSONB DEFAULT '{}'::jsonb,
  failure_structure JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_logic table
CREATE TABLE IF NOT EXISTS public.function_logic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  step_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  error_config JSONB DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_dependencies table
CREATE TABLE IF NOT EXISTS public.function_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  expected_response JSONB DEFAULT '{}'::jsonb,
  timeout INTEGER DEFAULT 30000,
  limit_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_triggers table
CREATE TABLE IF NOT EXISTS public.function_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  authentication_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_security table
CREATE TABLE IF NOT EXISTS public.function_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  require_authentication BOOLEAN DEFAULT true,
  allowed_roles JSONB DEFAULT '[]'::jsonb,
  sanitize_inputs BOOLEAN DEFAULT true,
  filter_outputs BOOLEAN DEFAULT false,
  used_secrets JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_error_handling table
CREATE TABLE IF NOT EXISTS public.function_error_handling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  retry_strategy TEXT DEFAULT 'none',
  max_retries INTEGER DEFAULT 0,
  timeout_behavior TEXT DEFAULT 'abort',
  fallback_action TEXT,
  return_error_format JSONB DEFAULT '{}'::jsonb,
  notification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_performance table
CREATE TABLE IF NOT EXISTS public.function_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  timeout_limit INTEGER DEFAULT 30000,
  max_payload_size INTEGER DEFAULT 1048576,
  concurrency_limit INTEGER DEFAULT 10,
  rate_limit INTEGER DEFAULT 100,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_tests table
CREATE TABLE IF NOT EXISTS public.function_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  test_inputs JSONB DEFAULT '{}'::jsonb,
  expected_outputs JSONB DEFAULT '{}'::jsonb,
  mock_dependencies JSONB DEFAULT '{}'::jsonb,
  preview_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function_validation table
CREATE TABLE IF NOT EXISTS public.function_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  input_validation JSONB DEFAULT '{}'::jsonb,
  output_validation JSONB DEFAULT '{}'::jsonb,
  business_rules JSONB DEFAULT '[]'::jsonb,
  dependency_availability_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_logic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_error_handling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_validation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (you can restrict later based on requirements)
CREATE POLICY "Allow public access functions" ON public.functions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_inputs" ON public.function_inputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_outputs" ON public.function_outputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_logic" ON public.function_logic FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_dependencies" ON public.function_dependencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_triggers" ON public.function_triggers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_security" ON public.function_security FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_error_handling" ON public.function_error_handling FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_performance" ON public.function_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_tests" ON public.function_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access function_validation" ON public.function_validation FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_functions_project_id ON public.functions(project_id);
CREATE INDEX idx_function_inputs_function_id ON public.function_inputs(function_id);
CREATE INDEX idx_function_outputs_function_id ON public.function_outputs(function_id);
CREATE INDEX idx_function_logic_function_id ON public.function_logic(function_id);
CREATE INDEX idx_function_dependencies_function_id ON public.function_dependencies(function_id);
CREATE INDEX idx_function_triggers_function_id ON public.function_triggers(function_id);
CREATE INDEX idx_function_security_function_id ON public.function_security(function_id);
CREATE INDEX idx_function_error_handling_function_id ON public.function_error_handling(function_id);
CREATE INDEX idx_function_performance_function_id ON public.function_performance(function_id);
CREATE INDEX idx_function_tests_function_id ON public.function_tests(function_id);
CREATE INDEX idx_function_validation_function_id ON public.function_validation(function_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_functions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_functions_updated_at
  BEFORE UPDATE ON public.functions
  FOR EACH ROW
  EXECUTE FUNCTION update_functions_updated_at();