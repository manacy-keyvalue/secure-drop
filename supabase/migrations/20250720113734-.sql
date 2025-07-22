-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file uploads table
CREATE TABLE public.file_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'approved', 'rejected', 'expired')),
  scan_result JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  watermark_applied BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create upload configurations table for admin settings
CREATE TABLE public.upload_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_name TEXT NOT NULL UNIQUE,
  allowed_mime_types TEXT[] NOT NULL DEFAULT '{}',
  max_file_size BIGINT NOT NULL DEFAULT 10485760, -- 10MB default
  max_files_per_user INTEGER DEFAULT 100,
  default_expiry_hours INTEGER DEFAULT 72,
  require_watermark BOOLEAN DEFAULT false,
  auto_scan BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table for compliance
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for file uploads
CREATE POLICY "Users can view their own uploads" 
ON public.file_uploads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads" 
ON public.file_uploads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" 
ON public.file_uploads FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all uploads" 
ON public.file_uploads FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policies for upload configs
CREATE POLICY "Everyone can read upload configs" 
ON public.upload_configs FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify upload configs" 
ON public.upload_configs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policies for audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- Create functions for automated tasks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at
BEFORE UPDATE ON public.file_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_upload_configs_updated_at
BEFORE UPDATE ON public.upload_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default upload configuration (without foreign key reference)
INSERT INTO public.upload_configs (
  config_name,
  allowed_mime_types,
  max_file_size,
  max_files_per_user,
  default_expiry_hours,
  require_watermark,
  auto_scan
) VALUES (
  'default',
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  10485760, -- 10MB
  100,
  72, -- 3 days
  true,
  true
);

-- Enable realtime for file uploads
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_uploads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;