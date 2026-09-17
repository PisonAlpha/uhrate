'use client';

import { useState, useEffect } from 'react';

export default function InvestorPage() {
  const [stats, setStats] = useState({
    totalVerifications: 0,
    tokensSold: 0,
    totalRaised: 0,
    presaleProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, presaleRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/presale/stats'),
      ]);
      const statsData = await statsRes.json();
      const presaleData = await presaleRes.json();

      setStats({
        totalVerifications: statsData.totalVerifications || 0,
        tokensSold: presaleData.data?.tokensSold || 0,
        totalRaised: presaleData.data?.totalRaised || 0,
        presaleProgress: Math.round(((presaleData.data?.tokensSold || 0) / 80000000) * 100),
      });
    } catch {}
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://uhrate.online/investors');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    { label: 'Files Sealed', value: stats.totalVerifications.toLocaleString() + '+', icon: '🔏', desc: 'Total files sealed on platform' },
    { label: 'UHR Tokens Sold', value: (stats.tokensSold / 1000000).toFixed(2) + 'M', icon: '🪙', desc: 'Presale tokens distributed' },
    { label: 'USDT Raised', value: '$' + stats.totalRaised.toLocaleString(), icon: '💰', desc: 'Total presale funds raised' },
    { label: 'Presale Progress', value: stats.presaleProgress + '%', icon: '📈', desc: 'Of 80M token presale allocation' },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={copyLink} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors bg-transparent cursor-pointer">
              {copied ? '✓ Link Copied!' : '🔗 Share This Page'}
            </button>
            <button onClick={() => window.location.href = '/presale'} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
              🔥 Join Presale
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-bold mb-6 uppercase tracking-wider">
            🔴 Live Data — Updated in Real Time
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">UHRATE Investor Dashboard</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Live platform metrics, token data, and growth analytics for investors and exchange partners.</p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {metrics.map(m => (
            <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{m.icon}</div>
              <p className="text-2xl font-black text-gray-900">{loading ? '...' : m.value}</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Presale Progress */}
        <div className="bg-black text-white rounded-3xl p-8 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">UHR Presale Progress</h2>
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">🔴 Live</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: (stats.presaleProgress || 0) + '%' }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{loading ? '...' : (stats.tokensSold / 1000000).toFixed(2) + 'M'} UHR sold</span>
            <span>80M UHR total</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Presale Price', value: '$0.01/UHR' },
              { label: 'Swap Price', value: '$0.02/UHR' },
              { label: 'Potential ROI', value: '2x from presale' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-yellow-400 font-black">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="border border-gray-200 rounded-2xl p-6">
            <h3 className="font-black text-gray-900 text-lg mb-4">Token Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Token Name', value: 'UHRATE' },
                { label: 'Ticker', value: 'UHR' },
                { label: 'Network', value: 'BNB Smart Chain (BEP20)' },
                { label: 'Total Supply', value: '1,000,000,000 UHR' },
                { label: 'Presale Allocation', value: '80,000,000 UHR (8%)' },
                { label: 'Presale Price', value: '$0.01 per UHR' },
                { label: 'Swap Price', value: '$0.02 per UHR' },
                { label: 'Presale Contract', value: '0xaDE6...Ca08' },
                { label: 'Token Contract', value: '0xFD87...E447' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6">
            <h3 className="font-black text-gray-900 text-lg mb-4">Token Allocation</h3>
            <div className="space-y-3">
              {[
                { label: 'Community & Ecosystem', value: '30%', color: 'bg-blue-500' },
                { label: 'Platform Rewards & Staking', value: '20%', color: 'bg-purple-500' },
                { label: 'Team & Founders', value: '15%', color: 'bg-gray-700' },
                { label: 'Public Sale', value: '12%', color: 'bg-green-500' },
                { label: 'Treasury & Reserve', value: '10%', color: 'bg-amber-500' },
                { label: 'Presale', value: '8%', color: 'bg-red-500' },
                { label: 'Advisors & Partners', value: '5%', color: 'bg-pink-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={"w-2 h-2 rounded-full flex-shrink-0 " + item.color} />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-10">
          <h3 className="font-black text-gray-900 text-lg mb-6">Platform Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔐', title: 'Digital Identity', desc: 'Give any file a permanent blockchain identity — $0.20 per document' },
              { icon: '🧬', title: 'Verify', desc: 'Free AI-powered deepfake and manipulation detection across 6 models' },
              { icon: '🔍', title: 'File Lookup', desc: 'Instantly verify any sealed file by upload, certificate ID, or SHA-256 hash' },
              { icon: '📄', title: 'Document Registry', desc: 'Register contracts, credentials, media permanently on-chain' },
              { icon: '⛓️', title: '4 Blockchains', desc: 'Ethereum, BNB Chain, Base, and Polygon supported' },
              { icon: '🤖', title: '6 AI Models', desc: 'Multiple AI models for comprehensive authenticity analysis' },
              { icon: '🔌', title: 'Developer API', desc: 'REST API for businesses to integrate verification' },
            ].map(item => (
              <div key={item.title} className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UHR Utility */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
          <h3 className="font-black text-gray-900 text-lg mb-4">UHR Token Utility</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '💸', title: '50% Fee Discount', desc: 'Pay $0.10 in UHR instead of $0.20 in ETH/BNB for every document deployment' },
              { icon: '🔥', title: 'Deflationary', desc: '10% of all UHR platform fees permanently burned on every transaction' },
              { icon: '📈', title: 'Buyback & Burn', desc: '20% of platform revenue used quarterly to buy UHR from market and burn it' },
              { icon: '🗳️', title: 'Governance', desc: 'UHR holders vote on platform proposals, features, and treasury spending' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-10">
          <h3 className="font-black text-gray-900 text-lg mb-4">Important Links</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Website', href: 'https://uhrate.online', icon: '🌐' },
              { label: 'Whitepaper', href: 'https://uhrate.online/whitepaper', icon: '📄' },
              { label: 'Tokenomics', href: 'https://uhrate.online/tokenomics', icon: '📊' },
              { label: 'Token Contract', href: 'https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447', icon: '🔗' },
              { label: 'Presale Contract', href: 'https://bscscan.com/address/0xaDE648982c4ABceB02A48BE71B71C45580f6Ca08', icon: '🔗' },
              { label: 'X / Twitter', href: 'https://x.com/uhrate_official', icon: '𝕏' },
              { label: 'Telegram', href: 'https://t.me/uhrateofficial', icon: '✈️' },
              { label: 'Instagram', href: 'https://www.instagram.com/uhrate', icon: '📸' },
            ].map(item => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm text-gray-700 no-underline">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 text-center">
          ⚠️ This page is for informational purposes only and does not constitute financial advice. Cryptocurrency investments carry risk. Always do your own research before investing.
        </div>
      </div>
    </main>
  );
}