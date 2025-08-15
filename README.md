# 🎵 Echo - Music Streaming Web App

A production-ready music streaming web application with Spotify integration and MP3 uploads, built with Next.js, Supabase, and Tailwind CSS.

## ✨ Features

### 🎧 Spotify Integration
- **OAuth Authentication** - Connect your Spotify account
- **Global Search** - Search millions of tracks from Spotify
- **Web Playback SDK** - Stream Spotify tracks directly in the browser (Premium required)
- **Playback Controls** - Play, pause, next, previous, shuffle, repeat

### 📁 MP3 Uploads
- **Drag & Drop Upload** - Easy MP3 file uploads to Supabase Storage
- **Music Library** - Organize and play your uploaded tracks
- **Search & Filter** - Find songs by title, artist, or album
- **HTML5 Audio Player** - Full playback controls for uploaded music

### 🎨 Modern UI/UX
- **Sky Blue + Black Theme** - Beautiful gradient design with #A7D7F4 accents
- **Responsive Design** - Mobile-first approach with smooth animations
- **Framer Motion** - Smooth transitions and micro-interactions
- **Tailwind CSS** - Utility-first styling with custom design system

## 🚀 Tech Stack

- **Frontend**: Next.js 13 (Pages Router), React 18
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Spotify OAuth
- **Audio**: HTML5 Audio API, Spotify Web Playback SDK

## 📋 Prerequisites

- Node.js 18+ and npm
- Spotify Developer Account
- Supabase Account
- Spotify Premium Account (for playback)

## 🛠️ Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd echo-music-streaming
npm install
```

### 2. Environment Variables

Create `.env.local` in your project root:

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

### 3. Spotify Developer Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback`
4. Copy Client ID and Client Secret to `.env.local`

### 4. Supabase Setup

1. Create a new Supabase project
2. Go to **Storage** → Create bucket named `music`
   - Set as public
   - File size limit: 100MB
   - Allowed MIME types: `audio/*`
3. Go to **SQL Editor** → Run the SQL from `database-schema.sql`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing Checklist

### Uploads
- [ ] Select an MP3 → confirm it appears in Supabase Storage bucket `music/songs/...`
- [ ] Confirm a row added in `songs` table
- [ ] See it in Uploads list → click Play → it plays in the Uploads tab player

### Spotify Auth
- [ ] Click "Connect with Spotify" → login → redirect back OK
- [ ] Check cookies are set: `sp_access_token`, `sp_refresh_token`, `sp_token_expires`

### Spotify Playback
- [ ] Search for a track → click Play → SDK player shows track + controls
- [ ] Confirm device transfer success (audio via site player)

### Responsive
- [ ] Test on mobile viewport
- [ ] Player fixed bottom, controls usable
- [ ] All animations work smoothly

## 📁 Project Structure

```
echo-music-streaming/
├── components/           # React components
│   ├── PlayerBar.js     # Main audio player with tabs
│   ├── SearchBar.js     # Spotify search interface
│   ├── Upload.js        # MP3 upload component
│   └── UploadLibrary.js # Uploaded songs library
├── lib/                 # Utility libraries
│   ├── supabase.js      # Supabase client
│   └── spotify.js       # Spotify API helpers
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   ├── auth/        # Spotify OAuth
│   │   └── spotify/     # Spotify API endpoints
│   └── index.js         # Main app page
├── styles/              # Global styles
│   └── globals.css      # Tailwind + custom CSS
├── utils/               # Utility functions
│   └── cookies.js       # Cookie management
└── tailwind.config.js   # Tailwind configuration
```

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Spotify OAuth
- `GET /api/auth/callback` - Handle OAuth callback

### Spotify
- `POST /api/spotify/refresh` - Refresh access token
- `GET /api/spotify/search?q=<query>` - Search tracks
- `POST /api/spotify/transfer` - Transfer playback to device

## 🎯 Key Features Implementation

### Spotify Web Playback SDK
- Dynamically loads `https://sdk.scdn.co/spotify-player.js`
- Handles device transfer and playback control
- Manages authentication tokens and refresh

### Supabase Integration
- Secure file uploads to `music` bucket
- Metadata storage in PostgreSQL
- Public file URLs for streaming

### Audio Player
- Dual-mode: Spotify SDK + HTML5 Audio
- Tabbed interface for different audio sources
- Full playback controls with visual feedback

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
Update `.env.local` with production URLs:
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/auth/callback
```

Don't forget to add production redirect URI in Spotify Developer Dashboard!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase bucket and policies are configured
4. Confirm Spotify app settings match your environment

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
