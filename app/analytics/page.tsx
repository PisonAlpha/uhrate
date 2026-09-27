'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [presale, setPresale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/presale/stats').then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setPresale(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const metrics = [
    { label: 'Files Sealed', value: loading ? '...' : (stats?.totalVerifications || 0).toLocaleString() + '+', icon: '🔏', desc: 'Total files given blockchain identity' },
    { label: 'UHR Tokens Sold', value: loading ? '...' : ((presale?.data?.tokensSold || 0) / 1000000).toFixed(2) + 'M', icon: '🪙', desc: 'Presale tokens distributed' },
    { label: 'USDT Raised', value: loading ? '...' : '$' + (presale?.data?.totalRaised || 0).toLocaleString(), icon: '💰', desc: 'Total presale funds raised' },
    { label: 'Presale Progress', value: loading ? '...' : Math.round(((presale?.data?.tokensSold || 0) / 80000000) * 100) + '%', icon: '📈', desc: 'Of 80M token presale allocation' },
    { label: 'Blockchains', value: '4', icon: '⛓️', desc: 'ETH, BNB, Base, Polygon' },
    { label: 'AI Models', value: '6', icon: '🤖', desc: 'Used for authenticity analysis' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-bold mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Data — Updated in Real Time
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">UHRATE Platform Analytics</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Live platform metrics for UHRATE — uhrate.online. All on-chain data is publicly verifiable on BSCScan.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {metrics.map(m => (
            <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{m.icon}</div>
              <p className="text-3xl font-black text-gray-900 mb-1">{m.value}</p>
              <p className="text-sm font-semibold text-gray-700">{m.label}</p>
              <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Presale Progress */}
        <div className="bg-black text-white rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">UHR Presale Progress</h2>
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">LIVE</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: (Math.min(Math.round(((presale?.data?.tokensSold || 0) / 80000000) * 100), 100)) + '%' }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-6">
            <span>{loading ? '...' : ((presale?.data?.tokensSold || 0) / 1000000).toFixed(2) + 'M'} UHR sold</span>
            <span>80M UHR total</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Presale Price', value: '$0.01/UHR' },
              { label: 'Listing Price', value: '$0.02/UHR' },
              { label: 'Potential ROI', value: '2x from presale' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-yellow-400 font-black">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Google Analytics Embed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-900">Web Traffic Analytics</h2>
            <a
              href="https://datastudio.google.com/reporting/6fab452f-0a7e-4b0f-85bb-ba0eec278fad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Open in Looker Studio ↗
            </a>
          </div>
          <p className="text-gray-500 text-sm mb-4">Live Google Analytics data for uhrate.online — powered by Looker Studio</p>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '600px' }}>
            <iframe
              src="https://datastudio.google.com/embed/reporting/6fab452f-0a7e-4b0f-85bb-ba0eec278fad/page/p_xyz"
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              title="UHRATE Google Analytics Dashboard"
            />
          </div>
        </div>

        {/* On-Chain Verification */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-6">On-Chain Verification</h2>
          <p className="text-gray-500 text-sm mb-4">All blockchain data is publicly verifiable. Anyone can verify these numbers directly on BSCScan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'UHR Token Contract',
                value: '0xFD8723F83F5A441EdB231F2ef1f89113B481E447',
                link: 'https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447',
                linkText: 'View on BSCScan',
              },
              {
                label: 'Presale Contract',
                value: '0xaDE648982c4ABceB02A48BE71B71C45580f6Ca08',
                link: 'https://bscscan.com/address/0xaDE648982c4ABceB02A48BE71B71C45580f6Ca08',
                linkText: 'View Transactions',
              },
            ].map(item => (
              <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="font-mono text-xs text-gray-700 break-all mb-2">{item.value}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  {item.linkText} ↗
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Important Links */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-4">Important Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Platform', href: 'https://uhrate.online' },
              { label: 'Presale', href: 'https://uhrate.online/presale' },
              { label: 'Tokenomics', href: 'https://uhrate.online/tokenomics' },
              { label: 'Whitepaper', href: 'https://uhrate.online/whitepaper' },
              { label: 'Investor Dashboard', href: 'https://uhrate.online/investors' },
              { label: 'IQ.wiki', href: 'https://iq.wiki/wiki/uhrate' },
              { label: 'Twitter/X', href: 'https://x.com/uhrate_official' },
              { label: 'Telegram', href: 'https://t.me/uhrateofficial' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm text-gray-700 font-medium no-underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 text-center">
          This page is for informational purposes only. Live metrics are pulled directly from UHRATE platform APIs and blockchain data. Google Analytics data is sourced from Looker Studio.
        </div>
      </div>

      <Footer />
    </main>
  );
}