// Spotify API integration - no Supabase needed for this file

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Generate Spotify authorization URL
export function getSpotifyAuthUrl() {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes.join(' '),
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return await response.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return await response.json();
}

// Search Spotify tracks
export async function searchSpotifyTracks(query, accessToken) {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to search Spotify tracks');
  }

  return await response.json();
}

// Get user's current playback
export async function getCurrentPlayback(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get current playback');
  }

  return await response.json();
}

// Transfer playback to a device
export async function transferPlayback(deviceId, accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false
    })
  });

  if (!response.ok) {
    throw new Error('Failed to transfer playback');
  }
}

// Start playback
export async function startPlayback(uri, accessToken, deviceId = null) {
  const url = deviceId 
    ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
    : 'https://api.spotify.com/v1/me/player/play';

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: [uri]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to start playback');
  }
}

// Main API handler
export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        if (query.action === 'auth-url') {
          const authUrl = getSpotifyAuthUrl();
          return res.status(200).json({ authUrl });
        }
        
        if (query.action === 'search') {
          const { q, accessToken } = query;
          if (!q || !accessToken) {
            return res.status(400).json({ error: 'Missing query or access token' });
          }
          
          const searchResults = await searchSpotifyTracks(q, accessToken);
          return res.status(200).json(searchResults);
        }
        
        if (query.action === 'playback') {
          const { accessToken } = query;
          if (!accessToken) {
            return res.status(400).json({ error: 'Missing access token' });
          }
          
          const playback = await getCurrentPlayback(accessToken);
          return res.status(200).json(playback);
        }
        
        break;

      case 'POST':
        if (body.action === 'exchange-token') {
          const { code } = body;
          if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
          }
          
          const tokenData = await exchangeCodeForToken(code);
          return res.status(200).json(tokenData);
        }
        
        if (body.action === 'refresh-token') {
          const { refreshToken } = body;
          if (!refreshToken) {
            return res.status(400).json({ error: 'Missing refresh token' });
          }
          
          const tokenData = await refreshAccessToken(refreshToken);
          return res.status(200).json(tokenData);
        }
        
        if (body.action === 'transfer-playback') {
          const { deviceId, accessToken } = body;
          if (!deviceId || !accessToken) {
            return res.status(400).json({ error: 'Missing device ID or access token' });
          }
          
          await transferPlayback(deviceId, accessToken);
          return res.status(200).json({ message: 'Playback transferred successfully' });
        }
        
        if (body.action === 'start-playback') {
          const { uri, accessToken, deviceId } = body;
          if (!uri || !accessToken) {
            return res.status(400).json({ error: 'Missing URI or access token' });
          }
          
          await startPlayback(uri, accessToken, deviceId);
          return res.status(200).json({ message: 'Playback started successfully' });
        }
        
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Spotify API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
