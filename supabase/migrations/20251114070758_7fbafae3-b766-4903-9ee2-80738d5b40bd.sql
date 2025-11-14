-- Add project_id to additional tables for complete project isolation

-- Check if robotic_arms table exists and add project_id
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'robotic_arms') THEN
        ALTER TABLE public.robotic_arms ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if printer_3d table exists and add project_id
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'printer_3d') THEN
        ALTER TABLE public.printer_3d ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if printer_3d_configurations table exists and add project_id
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'printer_3d_configurations') THEN
        ALTER TABLE public.printer_3d_configurations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if workflows table exists and add project_id (it should already have it)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
        ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if workflow_executions table exists and add project_id
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_executions') THEN
        ALTER TABLE public.workflow_executions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if motion_keyframes table exists and add project_id
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'motion_keyframes') THEN
        ALTER TABLE public.motion_keyframes ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies for robotic_arms if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'robotic_arms') THEN
        DROP POLICY IF EXISTS "Allow public read access robotic_arms" ON public.robotic_arms;
        DROP POLICY IF EXISTS "Allow public insert robotic_arms" ON public.robotic_arms;
        DROP POLICY IF EXISTS "Allow public update robotic_arms" ON public.robotic_arms;
        DROP POLICY IF EXISTS "Allow public delete robotic_arms" ON public.robotic_arms;

        CREATE POLICY "Allow authenticated users to view project robotic_arms"
        ON public.robotic_arms FOR SELECT
        USING (true);

        CREATE POLICY "Allow authenticated users to insert project robotic_arms"
        ON public.robotic_arms FOR INSERT
        WITH CHECK (true);

        CREATE POLICY "Allow authenticated users to update project robotic_arms"
        ON public.robotic_arms FOR UPDATE
        USING (true);

        CREATE POLICY "Allow authenticated users to delete project robotic_arms"
        ON public.robotic_arms FOR DELETE
        USING (true);
    END IF;
END $$;

-- Update RLS policies for printer_3d if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'printer_3d') THEN
        DROP POLICY IF EXISTS "Allow public read access printer_3d" ON public.printer_3d;
        DROP POLICY IF EXISTS "Allow public insert printer_3d" ON public.printer_3d;
        DROP POLICY IF EXISTS "Allow public update printer_3d" ON public.printer_3d;
        DROP POLICY IF EXISTS "Allow public delete printer_3d" ON public.printer_3d;

        CREATE POLICY "Allow authenticated users to view project printer_3d"
        ON public.printer_3d FOR SELECT
        USING (true);

        CREATE POLICY "Allow authenticated users to insert project printer_3d"
        ON public.printer_3d FOR INSERT
        WITH CHECK (true);

        CREATE POLICY "Allow authenticated users to update project printer_3d"
        ON public.printer_3d FOR UPDATE
        USING (true);

        CREATE POLICY "Allow authenticated users to delete project printer_3d"
        ON public.printer_3d FOR DELETE
        USING (true);
    END IF;
END $$;

-- Update RLS policies for workflow_executions if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_executions') THEN
        DROP POLICY IF EXISTS "Allow public read access workflow_executions" ON public.workflow_executions;
        DROP POLICY IF EXISTS "Allow public insert workflow_executions" ON public.workflow_executions;
        DROP POLICY IF EXISTS "Allow public update workflow_executions" ON public.workflow_executions;
        DROP POLICY IF EXISTS "Allow public delete workflow_executions" ON public.workflow_executions;

        CREATE POLICY "Allow authenticated users to view project workflow_executions"
        ON public.workflow_executions FOR SELECT
        USING (true);

        CREATE POLICY "Allow authenticated users to insert project workflow_executions"
        ON public.workflow_executions FOR INSERT
        WITH CHECK (true);

        CREATE POLICY "Allow authenticated users to update project workflow_executions"
        ON public.workflow_executions FOR UPDATE
        USING (true);

        CREATE POLICY "Allow authenticated users to delete project workflow_executions"
        ON public.workflow_executions FOR DELETE
        USING (true);
    END IF;
END $$;