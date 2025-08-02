
-- Create a storage bucket for 3D model files
INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-models', '3d-models', true);

-- Create RLS policies for the 3d-models bucket
CREATE POLICY "Allow public uploads to 3d-models bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models');

CREATE POLICY "Allow public access to 3d-models bucket"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');

CREATE POLICY "Allow public updates to 3d-models bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = '3d-models');

CREATE POLICY "Allow public deletes from 3d-models bucket"
ON storage.objects FOR DELETE
USING (bucket_id = '3d-models');

-- Update the printer_3d_configurations table to include file URLs
ALTER TABLE printer_3d_configurations 
ADD COLUMN IF NOT EXISTS models_with_files jsonb DEFAULT '[]'::jsonb;
