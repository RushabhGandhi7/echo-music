import { transferPlayback } from '../../../lib/spotify';
import { getServerCookie, SPOTIFY_COOKIES } from '../../../utils/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    // Get access token from cookies
    const accessToken = getServerCookie(req, SPOTIFY_COOKIES.ACCESS_TOKEN);
    const tokenExpires = getServerCookie(req, SPOTIFY_COOKIES.TOKEN_EXPIRES);

    // Check if token is expired
    if (!accessToken || (tokenExpires && Date.now() > parseInt(tokenExpires))) {
      return res.status(401).json({ error: 'Access token expired or missing' });
    }

    // Transfer playback to the specified device
    await transferPlayback(device_id, accessToken);

    res.json({ success: true, message: 'Playback transferred successfully' });
  } catch (error) {
    console.error('Playback transfer error:', error);
    res.status(500).json({ error: 'Playback transfer failed' });
  }
}
