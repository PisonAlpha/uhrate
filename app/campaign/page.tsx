'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const POINT_ACTIONS = [
  { icon: '🔏', action: 'Seal a Document', points: 50, desc: 'Seal any file on the blockchain' },
  { icon: '✅', action: 'Verify a Document', points: 10, desc: 'Run a file through our scanner' },
  { icon: '🔍', action: 'Lookup a Certificate', points: 5, desc: 'Search for a sealed certificate' },
  { icon: '👥', action: 'Refer a Friend', points: 25, desc: 'Per successful referral signup' },
  { icon: '🎁', action: 'Early Registration', points: 100, desc: 'One-time bonus for joining now' },
];

type Step = 'home' | 'register' | 'dashboard';

interface UserData {
  email: string;
  walletAddress: string;
  totalPoints: number;
  referralCode: string;
  createdAt: string;
}

interface HistoryItem {
  action: string;
  points: number;
  description: string;
  created_at: string;
}

export default function CampaignPage() {
  const [step, setStep] = useState<Step>('home');
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);

    // Check if already registered
    const saved = localStorage.getItem('uhrate_campaign');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEmail(parsed.email);
      setUserData(parsed);
      setStep('dashboard');
      fetchUserData(parsed.email);
    }

    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/campaign?leaderboard=true');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch {}
  };

  const fetchUserData = async (userEmail: string) => {
    try {
      const res = await fetch(`/api/campaign?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.found) {
        setUserData(data.user);
        setHistory(data.history);
        localStorage.setItem('uhrate_campaign', JSON.stringify(data.user));
      }
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, walletAddress: wallet, referralCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserData(data.user);
      setHistory(data.history);
      localStorage.setItem('uhrate_campaign', JSON.stringify(data.user));
      setStep('dashboard');
      fetchLeaderboard();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaign?email=${encodeURIComponent(lookupEmail)}`);
      const data = await res.json();
      if (!data.found) throw new Error('No campaign account found for that email.');
      setEmail(lookupEmail);
      setUserData(data.user);
      setHistory(data.history);
      localStorage.setItem('uhrate_campaign', JSON.stringify(data.user));
      setStep('dashboard');
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    if (!userData) return;
    const url = `${window.location.origin}/campaign?ref=${userData.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logout = () => {
    localStorage.removeItem('uhrate_campaign');
    setUserData(null);
    setStep('home');
    setEmail('');
    setWallet('');
    setHistory([]);
  };

  // ── Token conversion estimate ──────────────────────────────────────────
  const estimatedUHR = userData ? (userData.totalPoints / 1000).toFixed(3) : '0';

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      {/* Hero */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
            🎯 UHR Points Campaign · Season 1
          </div>
          <h1 className="text-5xl font-black mb-4">Earn UHR Tokens</h1>
          <p className="text-xl text-gray-300 mb-2">
            Use UHRATE. Earn points. Convert to real UHR tokens.
          </p>
          <p className="text-sm text-gray-500">
            Points convert at <span className="text-yellow-400 font-bold">1,000 pts = 1 UHR</span> at the end of Season 1
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* How to earn */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-6">How to Earn Points</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POINT_ACTIONS.map(item => (
              <div key={item.action} className="p-4 bg-gray-50 rounded-xl flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{item.action}</p>
                    <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full font-bold">+{item.points}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content: register / dashboard */}
        {step === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Register */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-1">Join the Campaign</h2>
              <p className="text-sm text-gray-500 mb-6">Register to start earning points</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={wallet}
                    onChange={e => setWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-black"
                  />
                  <p className="text-xs text-gray-400 mt-1">UHR tokens will be airdropped here</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Referral Code <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white rounded-xl font-black text-base hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registering...' : '🎯 Register & Earn 100 Points'}
                </button>
              </form>
            </div>

            {/* Already registered */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
              <h2 className="text-xl font-black text-gray-900 mb-1">Already Registered?</h2>
              <p className="text-sm text-gray-500 mb-6">Look up your points with your email</p>
              <form onSubmit={handleLookup} className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={lookupEmail}
                    onChange={e => setLookupEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  />
                </div>
                {error && step === 'home' && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 border-2 border-black text-black rounded-xl font-black text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Looking up...' : '🔍 Check My Points'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-800 font-semibold mb-1">⚡ Season 1 ends when</p>
                <p className="text-xs text-yellow-700">UHR token listing is announced. Points convert automatically to UHR and airdrop to your wallet.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'dashboard' && userData && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black text-white rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Total Points</p>
                <p className="text-4xl font-black">{userData.totalPoints.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">pts</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Estimated UHR</p>
                <p className="text-4xl font-black text-gray-900">{estimatedUHR}</p>
                <p className="text-gray-400 text-xs mt-1">at 1,000 pts = 1 UHR</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Activities</p>
                <p className="text-4xl font-black text-gray-900">{history.length}</p>
                <p className="text-gray-400 text-xs mt-1">total actions</p>
              </div>
            </div>

            {/* User info + referral */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900">{userData.email}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{userData.walletAddress}</p>
                </div>
                <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
                  Sign out
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">🔗 Your Referral Link</p>
                <p className="text-xs text-gray-500 mb-3">Share this link. Earn <strong>25 points</strong> for every person who signs up.</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/campaign?ref=${userData.referralCode}` : ''}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-600"
                  />
                  <button
                    onClick={copyReferral}
                    className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Earn more */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Earn More Points</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => window.location.href = '/seal'} className="p-4 border border-gray-200 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-all">
                  <span className="text-2xl">🔏</span>
                  <p className="font-bold text-gray-900 text-sm mt-2">Seal a Document</p>
                  <p className="text-xs text-gray-500">+50 points</p>
                </button>
                <button onClick={() => window.location.href = '/scan'} className="p-4 border border-gray-200 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-all">
                  <span className="text-2xl">✅</span>
                  <p className="font-bold text-gray-900 text-sm mt-2">Verify a Document</p>
                  <p className="text-xs text-gray-500">+10 points</p>
                </button>
                <button onClick={() => window.location.href = '/lookup'} className="p-4 border border-gray-200 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-all">
                  <span className="text-2xl">🔍</span>
                  <p className="font-bold text-gray-900 text-sm mt-2">Lookup a Certificate</p>
                  <p className="text-xs text-gray-500">+5 points</p>
                </button>
              </div>
            </div>

            {/* Points history */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Points History</h3>
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm">No activity yet. Start earning by sealing or verifying a document.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span className="font-black text-green-600">+{item.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">🏆 Leaderboard</h2>
            <span className="text-xs text-gray-400">Top 20 earners</span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-sm">No participants yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`flex items-center gap-4 py-3 px-4 rounded-xl ${i < 3 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${
                    i === 0 ? 'bg-yellow-400 text-black' :
                    i === 1 ? 'bg-gray-300 text-black' :
                    i === 2 ? 'bg-orange-300 text-black' :
                    'bg-gray-200 text-gray-600'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.email}</p>
                    <p className="text-xs text-gray-400 font-mono">{entry.wallet}</p>
                  </div>
                  <span className="font-black text-gray-900">{entry.totalPoints.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-6">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'When do points convert to UHR?', a: 'At the end of Season 1, which concludes when the official UHR token listing is announced. We will email all registered participants before the snapshot.' },
              { q: 'What wallet should I use?', a: 'Any EVM-compatible wallet (MetaMask, Trust Wallet, etc.). UHR is a BEP-20 token on BNB Smart Chain, so make sure your wallet supports BNB Chain.' },
              { q: 'Is there a limit on points?', a: 'There is no cap. The more you use the platform and refer friends, the more UHR you receive.' },
              { q: 'Do points expire?', a: 'No. Points accumulated in Season 1 are locked in until conversion. If Season 2 launches, unused points carry over.' },
              { q: 'How does the referral work?', a: 'Share your unique referral link. When someone signs up using it, you receive 25 points immediately. There is no limit on how many people you can refer.' },
            ].map(item => (
              <div key={item.q} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.q}</p>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}

