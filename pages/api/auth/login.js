import { getSpotifyAuthUrl } from '../spotify';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUrl = getSpotifyAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Spotify login error:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
}
