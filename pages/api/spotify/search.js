import { searchTracks } from '../../../lib/spotify';
import { getServerCookie, SPOTIFY_COOKIES } from '../../../utils/cookies';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Get access token from cookies
    let accessToken = getServerCookie(req, SPOTIFY_COOKIES.ACCESS_TOKEN);
    const tokenExpires = getServerCookie(req, SPOTIFY_COOKIES.TOKEN_EXPIRES);

    // Check if token is expired
    if (!accessToken || (tokenExpires && Date.now() > parseInt(tokenExpires))) {
      return res.status(401).json({ error: 'Access token expired or missing' });
    }

    // Search for tracks
    const searchResults = await searchTracks(q, accessToken);
    
    // Transform results to match our app's format
    const tracks = searchResults.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: Math.round(track.duration_ms / 1000),
      albumArt: track.album.images[0]?.url || null,
      uri: track.uri,
      isSpotify: true,
      spotifyId: track.id
    }));

    res.json({
      tracks,
      total: searchResults.tracks.total
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}
