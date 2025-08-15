import { exchangeCodeForTokens } from '../../../lib/spotify';
import { setServerCookie, SPOTIFY_COOKIES } from '../../../utils/cookies';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Spotify auth error:', error);
      return res.redirect('/?error=auth_failed');
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    
    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code, redirectUri);
    
    const {
      access_token,
      refresh_token,
      expires_in
    } = tokenData;

    // Calculate expiry timestamp
    const expiresAt = Date.now() + (expires_in * 1000);

    // Set cookies
    setServerCookie(res, SPOTIFY_COOKIES.ACCESS_TOKEN, access_token);
    setServerCookie(res, SPOTIFY_COOKIES.REFRESH_TOKEN, refresh_token);
    setServerCookie(res, SPOTIFY_COOKIES.TOKEN_EXPIRES, expiresAt.toString());

    // Redirect to home page
    res.redirect('/?success=spotify_connected');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/?error=token_exchange_failed');
  }
}
