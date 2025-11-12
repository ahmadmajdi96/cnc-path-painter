-- Create storage bucket for dataset files
INSERT INTO storage.buckets (id, name, public)
VALUES ('dataset-files', 'dataset-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for dataset files bucket
CREATE POLICY "Allow public read access to dataset files"
ON storage.objects FOR SELECT
USING (bucket_id = 'dataset-files');

CREATE POLICY "Allow authenticated users to upload dataset files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dataset-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update their dataset files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dataset-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete their dataset files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dataset-files' 
  AND auth.role() = 'authenticated'
);

-- Add file_url column to dataset_items if it doesn't exist
ALTER TABLE dataset_items ADD COLUMN IF NOT EXISTS file_url TEXT;