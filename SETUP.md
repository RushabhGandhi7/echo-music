# 🚀 Quick Setup Guide - Echo Music App

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local`
Create this file in your project root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Spotify Configuration
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET

# Development URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
SPOTIFY_SCOPES=user-read-email user-read-private streaming user-read-playback-state user-modify-playback-state user-read-currently-playing
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Required Setup Steps

### Spotify Developer Dashboard
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback`
4. Copy Client ID and Client Secret to `.env.local`

### Supabase Setup
1. Create a new Supabase project
2. Go to **Storage** → Create bucket named `music`
   - Set as public
   - File size limit: 100MB
   - Allowed MIME types: `audio/*`
3. Go to **SQL Editor** → Run the SQL from `database-schema.sql`

---

## 🧪 Test Your Setup

### Uploads
- Go to Upload tab → Select MP3 → Should upload to Supabase
- Check Library tab → Should see your uploaded song
- Click Play → Should play in the player

### Spotify
- Click "Connect with Spotify" → Should redirect to Spotify login
- After login → Should redirect back to app
- Go to Search tab → Search for a song → Should see results

---

## 🚨 Common Issues

**"Missing Supabase environment variables"**
- Check `.env.local` exists and has correct values

**"Spotify authentication failed"**
- Verify redirect URI in Spotify Dashboard matches exactly
- Check Client ID/Secret in `.env.local`

**"Upload failed"**
- Ensure Supabase bucket `music` exists and is public
- Check RLS policies are set correctly

**"Build failed"**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)

---

## 📱 Features to Test

- ✅ MP3 uploads to Supabase
- ✅ Spotify OAuth authentication
- ✅ Search Spotify tracks
- ✅ Play uploaded MP3s
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Player controls (play, pause, volume, seek)

---

**Need help? Check the main README.md for detailed documentation!**
