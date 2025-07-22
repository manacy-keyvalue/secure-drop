-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

-- Create storage policies for file uploads
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can access all files
CREATE POLICY "Admins can access all files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'files' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);