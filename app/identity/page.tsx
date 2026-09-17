'use client';

import { useEffect } from 'react';

export default function Identity() {
  useEffect(() => {
    window.location.replace('/seal');
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}