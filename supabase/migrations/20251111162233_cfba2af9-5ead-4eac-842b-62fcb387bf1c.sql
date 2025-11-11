-- Create integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  result_destination TEXT NOT NULL DEFAULT 'client',
  configuration JSONB NOT NULL DEFAULT '{}',
  source_endpoint JSONB NOT NULL DEFAULT '{}',
  target_endpoint JSONB NOT NULL DEFAULT '{}',
  automation_steps JSONB DEFAULT '[]',
  output_mappings JSONB DEFAULT '[]',
  parameters JSONB NOT NULL DEFAULT '{}',
  data_configuration JSONB,
  live_data JSONB,
  last_test JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  operations JSONB NOT NULL DEFAULT '[]',
  input_parameters JSONB DEFAULT '[]',
  output_parameters JSONB DEFAULT '[]',
  on_failure JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations
CREATE POLICY "Allow public read access integrations"
ON integrations FOR SELECT
USING (true);

CREATE POLICY "Allow public insert integrations"
ON integrations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update integrations"
ON integrations FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete integrations"
ON integrations FOR DELETE
USING (true);

-- Create policies for automations
CREATE POLICY "Allow public read access automations"
ON automations FOR SELECT
USING (true);

CREATE POLICY "Allow public insert automations"
ON automations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update automations"
ON automations FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete automations"
ON automations FOR DELETE
USING (true);

-- Create indexes
CREATE INDEX idx_integrations_project_id ON integrations(project_id);
CREATE INDEX idx_automations_project_id ON automations(project_id);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_automations_enabled ON automations(enabled);