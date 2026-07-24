-- ====================================================================
-- Milestone 4: Supabase Storage Bucket & RLS Policies
-- Bucket Name: medical-records
-- ====================================================================

-- 1. Create the storage bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Allow authenticated users to upload files to their own folder ({user_id}/*)
CREATE POLICY "Users can upload medical records to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: Allow users to view/download their own uploaded medical files
CREATE POLICY "Users can view own medical records"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow users to delete their own uploaded medical files
CREATE POLICY "Users can delete own medical records"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-records'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
