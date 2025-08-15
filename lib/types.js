// Types for the Echo Music Streaming App

export const Track = {
  id: String,
  title: String,
  artist: String,
  album: String,
  duration: Number,
  albumArt: String,
  audioUrl: String,
  genre: String,
  isSpotify: Boolean,
  spotifyId: String,
  isUploaded: Boolean,
  firebasePath: String,
  uploadedAt: Date,
  fileSize: Number,
};

export const Playlist = {
  id: String,
  name: String,
  description: String,
  tracks: Array,
  coverArt: String,
  createdAt: Date,
  isPublic: Boolean,
  createdBy: String,
};

export const User = {
  id: String,
  name: String,
  email: String,
  spotifyId: String,
  favorites: Array,
  playlists: Array,
  recentlyPlayed: Array,
  uploadedTracks: Array,
  isAdmin: Boolean,
  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  spotifyTokenExpiry: Number,
};

export const UploadProgress = {
  progress: Number,
  status: String, // 'uploading' | 'processing' | 'complete' | 'error'
  message: String,
};

export const SpotifySearchResult = {
  tracks: {
    items: Array,
  },
};
