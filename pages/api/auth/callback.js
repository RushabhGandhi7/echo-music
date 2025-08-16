import { exchangeCodeForToken } from '../spotify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Spotify auth error:', error);
      return res.status(400).json({ error: 'Authentication failed' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code);
    
    // Return the token data to the client
    return res.status(200).json(tokenData);
  } catch (error) {
    console.error('Spotify callback error:', error);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
