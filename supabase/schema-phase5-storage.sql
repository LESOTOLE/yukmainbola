-- Insert storage buckets for venues and gallery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('venues', 'venues', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('gallery', 'gallery', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing
CREATE POLICY "Public Access for Venues" ON storage.objects FOR SELECT USING (bucket_id = 'venues');
CREATE POLICY "Public Access for Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Policy to allow authenticated users with admin/super_admin role to upload
CREATE POLICY "Admin Upload Venues" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'venues' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admin Upload Gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'gallery' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Note: In Supabase, if we upload via Server Action using supabaseAdmin (Service Role), RLS is bypassed. 
-- So these policies are only strictly needed if uploading from the client side.
