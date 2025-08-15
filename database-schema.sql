-- Echo Music Streaming App - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'Unknown Artist',
  album TEXT DEFAULT 'My Uploads',
  duration INTEGER DEFAULT 0,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  url TEXT NOT NULL,
  genre TEXT DEFAULT 'Unknown',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON songs
  FOR SELECT USING (true);

-- Allow public insert access (for uploads)
CREATE POLICY "Allow public insert access" ON songs
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_at ON songs(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);

-- Create Storage bucket for music files
-- Note: This needs to be done in the Supabase dashboard under Storage
-- Bucket name: 'music'
-- Public bucket: true
-- File size limit: 100MB
-- Allowed MIME types: audio/*

-- Storage policies (run these after creating the bucket)
-- Allow public read access to music files
-- INSERT INTO storage.policies (name, bucket_id, definition) VALUES (
--   'Public music access',
--   (SELECT id FROM storage.buckets WHERE name = 'music'),
--   '{"name": "Public music access", "definition": {"policy": "SELECT", "using": "true"}}'
-- );

-- Allow authenticated users to upload music files
-- INSERT INTO storage.policies (name, bucket_id, definition) VALUES (
--   'Authenticated uploads',
--   (SELECT id FROM storage.buckets WHERE name = 'music'),
--   '{"name": "Authenticated uploads", "definition": {"policy": "INSERT", "using": "auth.role() = \'authenticated\'"}}'
-- );
