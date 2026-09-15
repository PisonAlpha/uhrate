'use client';

import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import ScoreCard from './components/ScoreCard';
import CertificateCard from './components/CertificateCard';

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'verify' | 'lookup'>('verify');
  const [user, setUser] = useState<any>(null);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.totalVerifications) setTotalVerifications(data.totalVerifications);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('uhrate_user');
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">UHRATE</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => window.location.href = '/'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">Verify</button>

            {/* Registry Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setRegistryOpen(!registryOpen); setTokenOpen(false); }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                Registry <span className="text-xs">{registryOpen ? '▲' : '▼'}</span>
              </button>
              {registryOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-52 z-50">
                  {[
                    { icon: '📄', label: 'Document Registry', href: '/registry' },
                    { icon: '🎓', label: 'Education', href: '/education' },
                    { icon: '⚖️', label: 'Legal', href: '/legal' },
                    { icon: '📰', label: 'Media', href: '/media' },
                    { icon: '🪪', label: 'Identity Badge', href: '/identity' },
                  ].map(item => (
                    <button key={item.href} onClick={() => { window.location.href = item.href; setRegistryOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer text-left">
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setTokenOpen(!tokenOpen); setRegistryOpen(false); }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1"
              >
                Token <span className="text-xs">{tokenOpen ? '▲' : '▼'}</span>
              </button>
              {tokenOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-52 z-50">
                  {[
                    { icon: '🔥', label: 'Presale — $0.01/UHR', href: '/presale' },
                    { icon: '🔄', label: 'Buy UHR — $0.02/UHR', href: '/swap' },
                    { icon: '📊', label: 'Tokenomics', href: '/tokenomics' },
                    { icon: '📄', label: 'Whitepaper', href: '/whitepaper' },
                  ].map(item => (
                    <button key={item.href} onClick={() => { window.location.href = item.href; setTokenOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer text-left">
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => window.location.href = '/enterprise'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">Bulk Verify</button>
            <button onClick={() => window.location.href = '/api-marketplace'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">API</button>
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button onClick={() => window.location.href = '/presale'} className="px-4 py-2 text-sm text-white font-bold bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
              🔥 Presale
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-transparent border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Dashboard
                </button>
                <button onClick={handleLogout} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-sm text-gray-700 bg-transparent border-0 cursor-pointer hover:text-gray-900">Login</button>
                <button onClick={() => window.location.href = '/register'} className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Sign up free</button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 bg-transparent border-0 cursor-pointer">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Platform</p>
            {[
              { label: 'Verify File', href: '/' },
              { label: 'Document Registry', href: '/registry' },
              { label: 'Education Registry', href: '/education' },
              { label: 'Legal Registry', href: '/legal' },
              { label: 'Media Registry', href: '/media' },
              { label: 'Identity Badge', href: '/identity' },
              { label: 'Bulk Verification', href: '/enterprise' },
              { label: 'Developer API', href: '/api-marketplace' },
            ].map(item => (
              <button key={item.href} onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Token</p>
            {[
              { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
              { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
              { label: '📊 Tokenomics', href: '/tokenomics' },
              { label: '📄 Whitepaper', href: '/whitepaper' },
            ].map(item => (
              <button key={item.href} onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            {user ? (
              <>
                <button onClick={() => { window.location.href = '/dashboard'; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">Dashboard</button>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl bg-transparent border-0 cursor-pointer">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { window.location.href = '/login'; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">Login</button>
                <button onClick={() => { window.location.href = '/register'; setMobileMenuOpen(false); }} className="w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors text-center">Sign up free</button>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── PRESALE BANNER ── */}
      <div className="bg-black text-white py-2.5 px-4 text-center text-sm">
        <span className="text-yellow-400 font-bold">🔥 UHR Presale Live</span>
        <span className="text-gray-300 mx-2">·</span>
        <span className="text-gray-300">Buy UHR at $0.01 — 50% cheaper than swap price</span>
        <span className="text-gray-300 mx-2">·</span>
        <button onClick={() => window.location.href = '/presale'} className="text-yellow-400 font-bold hover:text-yellow-300 bg-transparent border-0 cursor-pointer underline">
          Join Presale →
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="bg-white py-16 sm:py-24 px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold mb-6 uppercase tracking-wide">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live · {totalVerifications > 0 ? totalVerifications.toLocaleString() : '...'} files verified
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Is this file<br />
            <span className="text-black underline decoration-yellow-400 decoration-4">real or fake?</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            UHRATE uses AI and blockchain to verify whether any digital file — image, video, audio, or document — is original, AI-generated, deepfaked, or manipulated.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-12">
            <button
              onClick={() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl text-sm hover:bg-gray-800 transition-colors"
            >
              Verify a File Free →
            </button>
            <button onClick={() => window.location.href = '/presale'} className="px-8 py-4 bg-red-500 text-white font-bold rounded-2xl text-sm hover:bg-red-600 transition-colors">
              🔥 Join Presale
            </button>
            <button onClick={() => window.location.href = '/whitepaper'} className="px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition-colors">
              Read Whitepaper
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: totalVerifications > 0 ? totalVerifications.toLocaleString() : '...', label: 'Files Verified' },
              { value: '6', label: 'AI Models' },
              { value: '4', label: 'Blockchains' },
              { value: '94%', label: 'Accuracy' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How UHRATE works</h2>
            <p className="text-gray-500">Every file gets a permanent cryptographic identity and authenticity record</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🧬', title: 'Digital DNA', desc: 'SHA-256, SHA-512, perceptual and semantic fingerprints create a permanent content identity.' },
              { icon: '🤖', title: 'AI Analysis', desc: 'Claude AI visually analyzes images and documents for deepfakes, manipulation, and AI generation.' },
              { icon: '⛓️', title: 'Blockchain Proof', desc: 'Deploy to ETH, BNB, Base, or Polygon for permanent on-chain identity — you pay only gas + $0.20.' },
              { icon: '📜', title: 'Proof Certificates', desc: 'Download JSON certificates with unique IDs anyone can verify at uhrate.online/verify.' },
              { icon: '🌐', title: 'IPFS Storage', desc: 'Certificate data stored on IPFS via Pinata — decentralized and permanent.' },
              { icon: '🔌', title: 'Developer API', desc: 'Integrate UHRATE into your own apps with our simple REST API and developer keys.' },
            ].map(item => (
              <div key={item.title} className="p-6 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-16 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Who uses UHRATE</h2>
            <p className="text-gray-500">Trusted by professionals who need verified digital content</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '📰', title: 'Journalists', desc: 'Verify images and sources before publishing' },
              { icon: '🏛️', title: 'Governments', desc: 'Authenticate official documents' },
              { icon: '🎓', title: 'Universities', desc: 'Issue verified credentials on-chain' },
              { icon: '⚖️', title: 'Law Firms', desc: 'Verify contracts and legal documents' },
              { icon: '🏦', title: 'Banks', desc: 'Detect forged financial documents' },
              { icon: '🎨', title: 'Creators', desc: 'Protect original work with blockchain proof' },
              { icon: '💻', title: 'Developers', desc: 'Build with the UHRATE API' },
              { icon: '🏢', title: 'Enterprise', desc: 'Bulk verify thousands of files' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTOR SECTION ── */}
      <section className="py-16 px-4 bg-black text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-bold mb-6 uppercase tracking-wider">
                🔥 Presale Live — $0.01/UHR
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Invest in the future of document authenticity</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                UHR is the native token of UHRATE — the decentralized authenticity network. Early investors get UHR at presale price before public listing.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { label: 'Presale Price', value: '$0.01 per UHR' },
                  { label: 'Swap Price', value: '$0.02 per UHR' },
                  { label: 'Total Supply', value: '1,000,000,000 UHR' },
                  { label: 'Network', value: 'BNB Smart Chain (BEP20)' },
                  { label: 'Contract', value: '0xFD87...E447' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => window.location.href = '/presale'} className="px-6 py-3 bg-yellow-400 text-black font-black rounded-xl text-sm hover:bg-yellow-300 transition-colors">
                  Join Presale →
                </button>
                <button onClick={() => window.location.href = '/tokenomics'} className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">
                  View Tokenomics
                </button>
                <button onClick={() => window.location.href = '/whitepaper'} className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">
                  Whitepaper
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '💸', title: '50% Cheaper', desc: 'Pay $0.10 in UHR for deployments vs $0.20 in ETH/BNB' },
                { icon: '🔥', title: 'Deflationary', desc: '10% of UHR fees burned permanently every transaction' },
                { icon: '📈', title: 'Buyback', desc: '20% of platform revenue used quarterly to buy and burn UHR' },
                { icon: '🗳️', title: 'Governance', desc: 'Vote on platform decisions as a UHR token holder' },
              ].map(item => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTRIES ── */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Document Registries</h2>
            <p className="text-gray-500">Register any document type permanently on the blockchain</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📄', title: 'Document Registry', desc: 'Register any document with permanent on-chain identity', href: '/registry' },
              { icon: '🎓', title: 'Education Registry', desc: 'Degrees, diplomas and academic credentials', href: '/education' },
              { icon: '⚖️', title: 'Legal Registry', desc: 'Contracts, NDAs and legal documents', href: '/legal' },
              { icon: '📰', title: 'Media Registry', desc: 'Photos, videos and media content', href: '/media' },
            ].map(item => (
              <button key={item.href} onClick={() => window.location.href = item.href} className="p-6 border border-gray-200 rounded-2xl text-left hover:border-black hover:shadow-md transition-all bg-transparent cursor-pointer">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                <span className="text-xs font-semibold text-black">Register now →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERIFY SECTION ── */}
      <section id="verify-section" className="py-16 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Verify a file now</h2>
            <p className="text-gray-500">Free for everyone. No account required.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            {[
              { key: 'verify', label: '🔍 Verify File' },
              { key: 'lookup', label: '🏆 Lookup Certificate' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setResult(null); }}
                className={"px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors " + (
                  activeTab === tab.key ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {activeTab === 'verify' ? (
              <>
                {!result ? (
                  <FileUploader onResult={setResult} onLoading={setLoading} />
                ) : (
                  <div>
                    <button onClick={() => setResult(null)} className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer">
                      ← Verify another file
                    </button>
                    <ScoreCard result={result} />
                  </div>
                )}
              </>
            ) : (
              <CertificateCard />
            )}
          </div>
        </div>
      </section>

      {/* ── STEP BY STEP ── */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Simple 5-step process</h2>
            <p className="text-gray-500">From upload to blockchain-verified certificate in under 30 seconds</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { num: '01', title: 'Upload file', desc: 'Any file type up to 50MB' },
              { num: '02', title: 'Digital DNA', desc: 'Unique fingerprint generated' },
              { num: '03', title: 'AI analysis', desc: 'Deepfake & manipulation check' },
              { num: '04', title: 'Deploy on-chain', desc: 'Pay gas + $0.20 platform fee' },
              { num: '05', title: 'Get certificate', desc: 'Download proof with unique ID' },
            ].map((step, i) => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
                {i < 4 && <div className="hidden sm:block absolute" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Ready to fight misinformation?</h2>
          <p className="text-gray-400 mb-8">Join thousands of journalists, businesses, and creators using UHRATE to verify digital content.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl text-sm hover:bg-gray-100 transition-colors"
            >
              Get started free →
            </button>
            <button onClick={() => window.location.href = '/presale'} className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-2xl text-sm hover:bg-yellow-300 transition-colors">
              🔥 Join Presale
            </button>
            <button onClick={() => window.location.href = '/register'} className="px-8 py-4 border border-white/20 text-white font-semibold rounded-2xl text-sm hover:bg-white/10 transition-colors">
              Create account
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">UH</span>
                </div>
                <span className="font-bold text-gray-900">UHRATE</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Decentralized Authenticity Network — AI + Blockchain document verification.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => window.open('https://x.com/uhrate_official', '_blank')} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onClick={() => window.open('https://t.me/uhrateofficial', '_blank')} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.86l-2.95-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.718.726z"/></svg>
                </button>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Platform</p>
              <div className="space-y-2">
                {[
                  { label: 'Verify File', href: '/' },
                  { label: 'Document Registry', href: '/registry' },
                  { label: 'Education Registry', href: '/education' },
                  { label: 'Legal Registry', href: '/legal' },
                  { label: 'Media Registry', href: '/media' },
                  { label: 'Identity Badge', href: '/identity' },
                  { label: 'Bulk Verification', href: '/enterprise' },
                  { label: 'Developer API', href: '/api-marketplace' },
                ].map(item => (
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Token</p>
              <div className="space-y-2">
                {[
                  { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
                  { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
                  { label: 'Tokenomics', href: '/tokenomics' },
                  { label: 'Whitepaper', href: '/whitepaper' },
                ].map(item => (
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Company</p>
              <div className="space-y-2">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                ].map(item => (
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">
                    {item.label}
                  </button>
                ))}
                <p className="text-xs text-gray-400 pt-2">hello@uhrate.xyz</p>
                <p className="text-xs text-gray-400">uhrate.online</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 UHRATE. All rights reserved.</p>
            <p className="text-xs text-gray-400">Decentralized Authenticity Network · BNB Smart Chain</p>
          </div>
        </div>
      </footer>

    </main>
  );
}