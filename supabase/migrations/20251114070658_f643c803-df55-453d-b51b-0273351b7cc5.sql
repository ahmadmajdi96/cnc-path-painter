-- Add project_id to hardware tables that don't have it yet

-- Add project_id to cnc_machines
ALTER TABLE public.cnc_machines 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to conveyor_belts
ALTER TABLE public.conveyor_belts 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to laser_machines
ALTER TABLE public.laser_machines 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to hardware
ALTER TABLE public.hardware 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to endpoints
ALTER TABLE public.endpoints 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to joint_configurations
ALTER TABLE public.joint_configurations 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to motion_paths
ALTER TABLE public.motion_paths 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to laser_toolpaths
ALTER TABLE public.laser_toolpaths 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Update RLS policies for cnc_machines to filter by project
DROP POLICY IF EXISTS "Allow public read access cnc_machines" ON public.cnc_machines;
DROP POLICY IF EXISTS "Allow public insert cnc_machines" ON public.cnc_machines;
DROP POLICY IF EXISTS "Allow public update cnc_machines" ON public.cnc_machines;
DROP POLICY IF EXISTS "Allow public delete cnc_machines" ON public.cnc_machines;

CREATE POLICY "Allow authenticated users to view project cnc_machines"
ON public.cnc_machines FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project cnc_machines"
ON public.cnc_machines FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project cnc_machines"
ON public.cnc_machines FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project cnc_machines"
ON public.cnc_machines FOR DELETE
USING (true);

-- Update RLS policies for conveyor_belts to filter by project
DROP POLICY IF EXISTS "Allow public read access conveyor_belts" ON public.conveyor_belts;
DROP POLICY IF EXISTS "Allow public insert conveyor_belts" ON public.conveyor_belts;
DROP POLICY IF EXISTS "Allow public update conveyor_belts" ON public.conveyor_belts;
DROP POLICY IF EXISTS "Allow public delete conveyor_belts" ON public.conveyor_belts;

CREATE POLICY "Allow authenticated users to view project conveyor_belts"
ON public.conveyor_belts FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project conveyor_belts"
ON public.conveyor_belts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project conveyor_belts"
ON public.conveyor_belts FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project conveyor_belts"
ON public.conveyor_belts FOR DELETE
USING (true);

-- Update RLS policies for laser_machines to filter by project
DROP POLICY IF EXISTS "Allow public read access laser_machines" ON public.laser_machines;
DROP POLICY IF EXISTS "Allow public insert laser_machines" ON public.laser_machines;
DROP POLICY IF EXISTS "Allow public update laser_machines" ON public.laser_machines;
DROP POLICY IF EXISTS "Allow public delete laser_machines" ON public.laser_machines;

CREATE POLICY "Allow authenticated users to view project laser_machines"
ON public.laser_machines FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project laser_machines"
ON public.laser_machines FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project laser_machines"
ON public.laser_machines FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project laser_machines"
ON public.laser_machines FOR DELETE
USING (true);

-- Update RLS policies for hardware to filter by project
DROP POLICY IF EXISTS "Allow public read access" ON public.hardware;
DROP POLICY IF EXISTS "Allow public insert hardware" ON public.hardware;
DROP POLICY IF EXISTS "Allow public update hardware" ON public.hardware;
DROP POLICY IF EXISTS "Allow public delete hardware" ON public.hardware;

CREATE POLICY "Allow authenticated users to view project hardware"
ON public.hardware FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project hardware"
ON public.hardware FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project hardware"
ON public.hardware FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project hardware"
ON public.hardware FOR DELETE
USING (true);

-- Update RLS policies for endpoints to filter by project
DROP POLICY IF EXISTS "Allow public read access endpoints" ON public.endpoints;
DROP POLICY IF EXISTS "Allow public insert endpoints" ON public.endpoints;
DROP POLICY IF EXISTS "Allow public update endpoints" ON public.endpoints;
DROP POLICY IF EXISTS "Allow public delete endpoints" ON public.endpoints;

CREATE POLICY "Allow authenticated users to view project endpoints"
ON public.endpoints FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project endpoints"
ON public.endpoints FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project endpoints"
ON public.endpoints FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project endpoints"
ON public.endpoints FOR DELETE
USING (true);

-- Update RLS policies for joint_configurations
DROP POLICY IF EXISTS "Allow public read access joint_configurations" ON public.joint_configurations;
DROP POLICY IF EXISTS "Allow public insert joint_configurations" ON public.joint_configurations;
DROP POLICY IF EXISTS "Allow public update joint_configurations" ON public.joint_configurations;
DROP POLICY IF EXISTS "Allow public delete joint_configurations" ON public.joint_configurations;

CREATE POLICY "Allow authenticated users to view project joint_configurations"
ON public.joint_configurations FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project joint_configurations"
ON public.joint_configurations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project joint_configurations"
ON public.joint_configurations FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project joint_configurations"
ON public.joint_configurations FOR DELETE
USING (true);

-- Update RLS policies for motion_paths
DROP POLICY IF EXISTS "Allow public read access motion_paths" ON public.motion_paths;
DROP POLICY IF EXISTS "Allow public insert motion_paths" ON public.motion_paths;
DROP POLICY IF EXISTS "Allow public update motion_paths" ON public.motion_paths;
DROP POLICY IF EXISTS "Allow public delete motion_paths" ON public.motion_paths;

CREATE POLICY "Allow authenticated users to view project motion_paths"
ON public.motion_paths FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project motion_paths"
ON public.motion_paths FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project motion_paths"
ON public.motion_paths FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project motion_paths"
ON public.motion_paths FOR DELETE
USING (true);

-- Update RLS policies for laser_toolpaths
DROP POLICY IF EXISTS "Allow public read access laser_toolpaths" ON public.laser_toolpaths;
DROP POLICY IF EXISTS "Allow public insert laser_toolpaths" ON public.laser_toolpaths;
DROP POLICY IF EXISTS "Allow public update laser_toolpaths" ON public.laser_toolpaths;
DROP POLICY IF EXISTS "Allow public delete laser_toolpaths" ON public.laser_toolpaths;

CREATE POLICY "Allow authenticated users to view project laser_toolpaths"
ON public.laser_toolpaths FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert project laser_toolpaths"
ON public.laser_toolpaths FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project laser_toolpaths"
ON public.laser_toolpaths FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated users to delete project laser_toolpaths"
ON public.laser_toolpaths FOR DELETE
USING (true);