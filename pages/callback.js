import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const { code, error } = router.query;

    if (error) {
      setStatus('Authentication failed. Please try again.');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (code) {
      handleTokenExchange(code);
    }
  }, [router.query, router]);

  const handleTokenExchange = async (code) => {
    try {
      setStatus('Exchanging authorization code...');
      
      // Exchange code for tokens
      const response = await fetch('/api/auth/callback?' + new URLSearchParams({ code }));
      
      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Store tokens in localStorage
        const expiresAt = Date.now() + (data.expires_in * 1000);
        
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        localStorage.setItem('spotify_token_expires_at', expiresAt.toString());

        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Callback error:', error);
      setStatus('Authentication failed. Please try again.');
      setTimeout(() => router.push('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Echo Music</h1>
        <p className="text-gray-300">{status}</p>
      </div>
    </div>
  );
}
