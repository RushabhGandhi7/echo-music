// Spotify Service for Echo Music Streaming App

const CLIENT_ID = '94b229a3b49147e0b8ed6747a1e41efc';
const CLIENT_SECRET = 'efeb9ef642bf48e69545d793c393cb63';
const REDIRECT_URI = 'http://localhost:3000/callback';

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    
    // Try to get tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('spotify_access_token');
      this.refreshToken = localStorage.getItem('spotify_refresh_token');
    }
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
    }
  }

  async searchTracks(query) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.searchTracks(query);
        }
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return data.tracks.items.map(item => ({
        id: item.id,
        title: item.name,
        artist: item.artists.map(a => a.name).join(', '),
        album: item.album.name,
        duration: Math.round(item.duration_ms / 1000),
        albumArt: item.album.images[0]?.url || '/default-album-art.png',
        genre: 'Spotify',
        isSpotify: true,
        spotifyId: item.id,
        audioUrl: undefined
      }));
    } catch (error) {
      console.error('Error searching Spotify:', error);
      throw error;
    }
  }

  async getCurrentUserProfile() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.getCurrentUserProfile();
        }
        throw new Error(`Spotify API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('spotify_access_token', data.access_token);
      }

      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      this.accessToken = null;
      this.refreshToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
      }
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
    }
  }

  getAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-read-playback-position',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];

    return `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}`;
  }
}

export const spotifyService = new SpotifyService();
