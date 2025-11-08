-- Fix workflows table schema and add missing tables

-- 1. Update workflows table to match expected schema
ALTER TABLE public.workflows 
ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS run_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_run TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_run TIMESTAMP WITH TIME ZONE;

-- Add check constraint for trigger_type
ALTER TABLE public.workflows
ADD CONSTRAINT workflows_trigger_type_check 
CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event', 'file_change'));

-- Add check constraint for status
ALTER TABLE public.workflows
ADD CONSTRAINT workflows_status_check 
CHECK (status IN ('draft', 'active', 'paused', 'completed', 'error'));

-- 2. Create workflow_nodes table
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('trigger', 'action', 'condition', 'delay', 'loop', 'end')),
  component_type TEXT NOT NULL CHECK (component_type IN ('cnc', 'laser', 'printer3d', 'robotic_arm', 'conveyor', 'vision_system', 'chatbot', 'automation', 'integration', 'manual', 'ai_model')),
  component_id UUID,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_nodes
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_nodes
CREATE POLICY "Allow public read access workflow_nodes" 
ON public.workflow_nodes 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert workflow_nodes" 
ON public.workflow_nodes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update workflow_nodes" 
ON public.workflow_nodes 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete workflow_nodes" 
ON public.workflow_nodes 
FOR DELETE 
USING (true);

-- Create index for faster workflow lookups
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON public.workflow_nodes(workflow_id);

-- 3. Create workflow_connections table
CREATE TABLE IF NOT EXISTS public.workflow_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL DEFAULT 'always' CHECK (condition_type IN ('always', 'success', 'error', 'conditional')),
  condition_value JSONB DEFAULT '{}',
  source_handle TEXT,
  target_handle TEXT,
  edge_type TEXT DEFAULT 'smoothstep',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_connections
ALTER TABLE public.workflow_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_connections
CREATE POLICY "Allow public read access workflow_connections" 
ON public.workflow_connections 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert workflow_connections" 
ON public.workflow_connections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update workflow_connections" 
ON public.workflow_connections 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete workflow_connections" 
ON public.workflow_connections 
FOR DELETE 
USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow_id ON public.workflow_connections(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_source_node ON public.workflow_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_target_node ON public.workflow_connections(target_node_id);

-- 4. Create workflow_executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_data JSONB DEFAULT '{}',
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_executions
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_executions
CREATE POLICY "Allow public read access workflow_executions" 
ON public.workflow_executions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert workflow_executions" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update workflow_executions" 
ON public.workflow_executions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete workflow_executions" 
ON public.workflow_executions 
FOR DELETE 
USING (true);

-- Create index for faster workflow lookups
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON public.workflow_executions(started_at DESC);

-- 5. Add triggers for updated_at
CREATE TRIGGER update_workflow_nodes_updated_at
BEFORE UPDATE ON public.workflow_nodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create function to update workflow last_run and run_count
CREATE OR REPLACE FUNCTION public.update_workflow_execution_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workflows
  SET 
    run_count = run_count + 1,
    last_run = NEW.started_at,
    success_count = CASE WHEN NEW.status = 'completed' THEN success_count + 1 ELSE success_count END,
    error_count = CASE WHEN NEW.status = 'failed' THEN error_count + 1 ELSE error_count END
  WHERE id = NEW.workflow_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating workflow stats
CREATE TRIGGER update_workflow_stats_on_execution
AFTER INSERT ON public.workflow_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_workflow_execution_stats();