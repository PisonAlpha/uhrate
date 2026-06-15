'use client';

import { useState } from 'react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
          <p className="text-gray-500 mb-2">We sent a verification link to</p>
          <p className="font-semibold text-gray-900 mb-6">{email}</p>
          <p className="text-sm text-gray-400 mb-8">Click the link to verify your account. The link expires in 24 hours.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

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
            Join the decentralized<br />authenticity network.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Start verifying files for free. No credit card required. Protect your work and detect fakes with AI and blockchain.
          </p>
          <div className="space-y-3">
            {[
              '✓ 10 free verifications per month',
              '✓ AI deepfake detection',
              '✓ Blockchain-backed certificates',
              '✓ Register documents permanently',
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">Start verifying digital content today — it's free</p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                placeholder="Repeat your password"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create free account'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => window.location.href = '/login'}
                className="text-black font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our{' '}
            <button onClick={() => window.location.href = '/terms'} className="underline bg-transparent border-0 cursor-pointer text-gray-400">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => window.location.href = '/privacy'} className="underline bg-transparent border-0 cursor-pointer text-gray-400">Privacy Policy</button>
          </p>
        </div>
      </div>
    </main>
  );
}