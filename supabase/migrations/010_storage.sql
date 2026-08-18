-- 010_storage.sql

-- Insert buckets into the Supabase storage.buckets table
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('restaurant_documents', 'restaurant_documents', false),
  ('ngo_documents', 'ngo_documents', false),
  ('food_images', 'food_images', true),
  ('user_avatars', 'user_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for restaurant_documents
CREATE POLICY "Restaurants can upload their own documents" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant_documents' AND auth.uid() = owner);

CREATE POLICY "Users can view their own restaurant documents" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'restaurant_documents' AND auth.uid() = owner);

-- RLS Policies for ngo_documents
CREATE POLICY "NGOs can upload their own documents" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ngo_documents' AND auth.uid() = owner);

CREATE POLICY "Users can view their own NGO documents" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'ngo_documents' AND auth.uid() = owner);

-- RLS Policies for food_images (publicly readable, but only authenticated can upload)
CREATE POLICY "Public can view food images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'food_images');

CREATE POLICY "Authenticated users can upload food images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'food_images' AND auth.uid() = owner);

-- RLS Policies for user_avatars (publicly readable, but only owner can upload)
CREATE POLICY "Public can view user avatars" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'user_avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user_avatars' AND auth.uid() = owner);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'user_avatars' AND auth.uid() = owner);
