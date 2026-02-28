-- ===============================================
-- Supabase Storage Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor to allow image uploads!
-- ===============================================

-- 1. Allow authenticated users (Admin) to upload (INSERT) files to the bucket
CREATE POLICY "Allow Admin Uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

-- 2. Allow authenticated users (Admin) to update files
CREATE POLICY "Allow Admin Updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images');

-- 3. Allow authenticated users (Admin) to delete files
CREATE POLICY "Allow Admin Deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images');

-- 4. Allow ANYONE (public) to view/read the images 
-- (This ensures images load correctly on your live website)
CREATE POLICY "Allow Public Viewing"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');
