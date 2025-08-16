import { createContext, useContext, useState, useEffect } from 'react';

const SpotifyContext = createContext();

export function SpotifyProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if token is expired
  const isTokenExpired = () => {
    if (!tokenExpiresAt) return true;
    return Date.now() >= tokenExpiresAt;
  };

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Echo Music Player',
        getOAuthToken: cb => { cb(accessToken); }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
        setIsAuthenticated(false);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
      });

      // Playback status updates
      player.addListener('player_state_changed', state => {
        if (!state) return;
        
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayer(player);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId(null);
      });

      // Connect to the player
      player.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [accessToken]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have valid tokens in localStorage
      const storedAccessToken = localStorage.getItem('spotify_access_token');
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
      const storedExpiresAt = localStorage.getItem('spotify_token_expires_at');

      if (storedAccessToken && storedRefreshToken && storedExpiresAt) {
        const expiresAt = parseInt(storedExpiresAt);
        
        if (Date.now() < expiresAt) {
          // Token is still valid
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setTokenExpiresAt(expiresAt);
          setIsAuthenticated(true);
        } else {
          // Token expired, try to refresh
          await refreshAccessToken(storedRefreshToken);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh-token',
          refreshToken: refreshToken
        })
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      
      const expiresAt = Date.now() + (data.expires_in * 1000);
      
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token || refreshToken);
      setTokenExpiresAt(expiresAt);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_refresh_token', data.refresh_token || refreshToken);
      localStorage.setItem('spotify_token_expires_at', expiresAt.toString());

    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsAuthenticated(false);
      // Clear stored tokens
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expires_at');
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setTokenExpiresAt(null);
    setIsAuthenticated(false);
    setPlayer(null);
    setDeviceId(null);
    setCurrentTrack(null);
    setIsPlaying(false);

    // Clear localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
  };

  const searchTracks = async (query) => {
    if (!accessToken || isTokenExpired()) {
      throw new Error('No valid access token');
    }

    const response = await fetch(`/api/spotify?action=search&q=${encodeURIComponent(query)}&accessToken=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    return await response.json();
  };

  const playTrack = async (trackUri) => {
    if (!player || !deviceId) {
      throw new Error('Player not ready');
    }

    try {
      await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + deviceId, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const skipToNext = async () => {
    if (!player) return;

    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const skipToPrevious = async () => {
    if (!player) return;

    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  };

  const setVolume = async (volume) => {
    if (!player) return;

    try {
      await player.setVolume(volume / 100);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const value = {
    accessToken,
    isAuthenticated,
    player,
    deviceId,
    currentTrack,
    isPlaying,
    login,
    logout,
    searchTracks,
    playTrack,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    setVolume,
    checkAuthStatus
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
