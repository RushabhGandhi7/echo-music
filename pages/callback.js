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
      // Exchange code for token
      fetch('/api/auth/callback?' + new URLSearchParams({ code }))
        .then(response => {
          if (response.ok) {
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => router.push('/'), 2000);
          } else {
            throw new Error('Token exchange failed');
          }
        })
        .catch(error => {
          console.error('Callback error:', error);
          setStatus('Authentication failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
        });
    }
  }, [router.query, router]);

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
