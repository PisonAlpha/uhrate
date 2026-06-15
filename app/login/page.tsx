'use client';

import { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    const successMsg = params.get('success');
    if (errorMsg) setError(errorMsg);
    if (successMsg) setSuccess(successMsg);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('uhrate_user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black text-sm font-bold">UH</span>
          </div>
          <span className="font-bold text-white text-lg">UHRATE</span>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            The world's most trusted<br />authenticity network.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            AI-powered verification with permanent blockchain proof. Trusted by journalists, institutions, and creators worldwide.
          </p>
          <div className="space-y-3">
            {[
              '✓ AI deepfake & manipulation detection',
              '✓ Permanent blockchain registration',
              '✓ NFT authenticity certificates',
              '✓ 8 blockchain networks supported',
            ].map(item => (
              <p key={item} className="text-gray-300 text-sm">{item}</p>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">© 2026 UHRATE. Decentralized Authenticity Network.</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <button onClick={() => window.location.href = '/'} className="inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">UH</span>
              </div>
              <span className="font-bold text-xl text-gray-900">UHRATE</span>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your UHRATE account</p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6">
              {success}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => window.location.href = '/register'}
                className="text-black font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Create one free
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}