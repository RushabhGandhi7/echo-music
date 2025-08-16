-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on songs" ON songs
  FOR ALL USING (true);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for music bucket
CREATE POLICY "Public read access for music" ON storage.objects
  FOR SELECT USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload music" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'music');
