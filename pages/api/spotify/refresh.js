import { refreshAccessToken } from '../../../lib/spotify';
import { getServerCookie, setServerCookie, SPOTIFY_COOKIES } from '../../../utils/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const refreshToken = getServerCookie(req, SPOTIFY_COOKIES.REFRESH_TOKEN);

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token available' });
    }

    // Refresh the access token
    const tokenData = await refreshAccessToken(refreshToken);
    
    const {
      access_token,
      refresh_token: newRefreshToken,
      expires_in
    } = tokenData;

    // Calculate expiry timestamp
    const expiresAt = Date.now() + (expires_in * 1000);

    // Set new cookies
    setServerCookie(res, SPOTIFY_COOKIES.ACCESS_TOKEN, access_token);
    if (newRefreshToken) {
      setServerCookie(res, SPOTIFY_COOKIES.REFRESH_TOKEN, newRefreshToken);
    }
    setServerCookie(res, SPOTIFY_COOKIES.TOKEN_EXPIRES, expiresAt.toString());

    res.json({
      access_token,
      expires_at: expiresAt,
      expires_in
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear cookies on refresh failure
    res.setHeader('Set-Cookie', [
      `${SPOTIFY_COOKIES.ACCESS_TOKEN}=; Max-Age=0; Path=/`,
      `${SPOTIFY_COOKIES.REFRESH_TOKEN}=; Max-Age=0; Path=/`,
      `${SPOTIFY_COOKIES.TOKEN_EXPIRES}=; Max-Age=0; Path=/`
    ]);
    
    res.status(401).json({ error: 'Token refresh failed' });
  }
}
