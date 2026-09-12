'use client';

import { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
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
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem('uhrate_user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask to use wallet login.');
      return;
    }
    setWalletLoading(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      const nonceRes = await fetch('/api/auth/wallet-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.error);

      const message = `Sign in to UHRATE\n\nWallet: ${walletAddress}\nNonce: ${nonceData.nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      const loginRes = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature, message }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error);

      localStorage.setItem('uhrate_user', JSON.stringify(loginData.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Wallet connection cancelled.');
      } else {
        setError(err.message || 'Wallet login failed. Please try again.');
      }
    } finally {
      setWalletLoading(false);
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
              '✓ ETH, BNB, Base & Polygon supported',
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

          {/* Wallet Login */}
          <button
            onClick={handleWalletLogin}
            disabled={walletLoading}
            className="w-full py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mb-6"
          >
            {walletLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Connecting wallet...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 35 33" fill="none">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.04858 1L15.0707 10.809L12.7402 4.99098L2.04858 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28.2292 23.5334L24.7346 28.872L32.2175 30.9324L34.3611 23.6501L28.2292 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0.651367 23.6501L2.78282 30.9324L10.2538 28.872L6.77133 23.5334L0.651367 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.85437 14.5149L7.75891 17.6507L15.1614 17.9924L14.9085 9.98291L9.85437 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M25.1459 14.515L20.0155 9.89355L19.8589 17.9925L27.2494 17.6508L25.1459 14.515Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.2538 28.872L14.7082 26.6958L10.8836 23.7029L10.2538 28.872Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.2915 26.6958L24.7341 28.872L24.1162 23.7029L20.2915 26.6958Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Connect with MetaMask
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email Login */}
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
                <button
                  onClick={() => window.location.href = '/forgot-password'}
                  className="text-xs text-gray-500 hover:text-black bg-transparent border-0 cursor-pointer"
                >
                  Forgot password?
                </button>
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
              ) : 'Sign in with Email'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => window.location.href = '/register'} className="text-black font-semibold hover:underline bg-transparent border-0 cursor-pointer">
                Create one free
              </button>
            </p>
            <p className="text-xs text-gray-400">
              🔒 Wallet login uses cryptographic signatures — no password needed
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}