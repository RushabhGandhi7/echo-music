import Cookies from 'js-cookie';

// Server-side cookie helpers
export const getServerCookie = (req, name) => {
  if (!req.headers.cookie) return null;
  
  const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies[name];
};

export const setServerCookie = (res, name, value, options = {}) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    ...options
  };
  
  res.setHeader('Set-Cookie', `${name}=${value}; ${Object.entries(cookieOptions)
    .map(([key, val]) => `${key}=${val}`)
    .join('; ')}`);
};

// Client-side cookie helpers
export const getClientCookie = (name) => {
  return Cookies.get(name);
};

export const setClientCookie = (name, value, options = {}) => {
  Cookies.set(name, value, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    ...options
  });
};

export const removeClientCookie = (name) => {
  Cookies.remove(name);
};

// Spotify-specific cookie names
export const SPOTIFY_COOKIES = {
  ACCESS_TOKEN: 'sp_access_token',
  REFRESH_TOKEN: 'sp_refresh_token',
  TOKEN_EXPIRES: 'sp_token_expires'
};
