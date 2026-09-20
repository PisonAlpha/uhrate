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
  const [activeSection, setActiveSection] = useState<'identity' | 'verify'>('identity');

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
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">UHRATE</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {/* Identity dropdown */}
            <div className="relative">
              <button onClick={() => { setRegistryOpen(!registryOpen); setTokenOpen(false); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1 font-medium">
                🔐 Give Identity <span className="text-xs">{registryOpen ? '▲' : '▼'}</span>
              </button>
              {registryOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-56 z-50">
                  <p className="text-xs text-gray-400 px-3 py-1 font-semibold uppercase tracking-wider">Platform</p>
                                    {[
                    { icon: '🔏', label: 'Seal', href: '/seal' },
                    { icon: '📄', label: 'Document Registry', href: '/registry' },
                    { icon: '🎓', label: 'Education Registry', href: '/education' },
                    { icon: '⚖️', label: 'Legal Registry', href: '/legal' },
                    { icon: '📰', label: 'Media Registry', href: '/media' },
                  ].map(item => (
                    <button key={item.href} onClick={() => { window.location.href = item.href; setRegistryOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer text-left">
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => window.location.href = '/verify'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">
              🔍 Verify File
            </button>
            <button onClick={() => window.location.href = '/enterprise'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">Bulk</button>
            <button onClick={() => window.location.href = '/api-marketplace'} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer">API</button>

            {/* Token dropdown */}
            <div className="relative">
              <button onClick={() => { setTokenOpen(!tokenOpen); setRegistryOpen(false); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1">
                Token <span className="text-xs">{tokenOpen ? '▲' : '▼'}</span>
              </button>
              {tokenOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-56 z-50">
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
          </nav>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button onClick={() => window.location.href = '/presale'} className="px-4 py-2 text-sm text-white font-bold bg-red-500 hover:bg-red-600 rounded-xl transition-colors">🔥 Presale</button>
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-transparent cursor-pointer">Dashboard</button>
                <button onClick={handleLogout} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-sm text-gray-700 bg-transparent border-0 cursor-pointer hover:text-gray-900">Login</button>
                <button onClick={() => window.location.href = '/register'} className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Sign up free</button>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 bg-transparent border-0 cursor-pointer">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 max-h-screen overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Platform</p>
            {[
              { label: '🔏 Seal', href: '/seal' },
              { label: '✅ Verify', href: '/scan' },
              { label: '🔍 Lookup', href: '/lookup' },
              { label: '📄 Document Registry', href: '/registry' },
              { label: '🎓 Education Registry', href: '/education' },
              { label: '⚖️ Legal Registry', href: '/legal' },
              { label: '📰 Media Registry', href: '/media' },
            ].map(item => (
              <button key={item.href} onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">{item.label}</button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Tools</p>
            {[
              { label: '🔍 Verify File', href: '/verify' },
              { label: '📁 Bulk Verification', href: '/enterprise' },
              { label: '🔌 Developer API', href: '/api-marketplace' },
            ].map(item => (
              <button key={item.href} onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">{item.label}</button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Token</p>
            {[
              { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
              { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
              { label: '📊 Tokenomics', href: '/tokenomics' },
              { label: '📄 Whitepaper', href: '/whitepaper' },
            ].map(item => (
              <button key={item.href} onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">{item.label}</button>
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
        <span className="text-gray-400 mx-2">·</span>
        <span className="text-gray-300">Buy UHR at $0.01 — 50% cheaper than swap price</span>
        <span className="text-gray-400 mx-2">·</span>
        <button onClick={() => window.location.href = '/presale'} className="text-yellow-400 font-bold hover:text-yellow-300 bg-transparent border-0 cursor-pointer underline">Join Presale →</button>
      </div>

      {/* ── HERO ── */}
      <section className="bg-white py-20 sm:py-28 px-4 text-center border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-semibold mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {totalVerifications > 0 ? totalVerifications.toLocaleString() : '...'} documents given blockchain identity
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            Every document<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">deserves a</span><br />
            <span className="relative inline-block">
              permanent identity.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
                <path d="M0 10 Q200 0 400 10" stroke="#000" strokeWidth="3" fill="none"/>
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            UHRATE is the decentralized notary for the digital world. Give any file — document, image, video, audio — a permanent, immutable blockchain identity that proves its existence, ownership, and authenticity forever.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-16">
            <button
              onClick={() => window.location.href = '/seal'}
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl text-base hover:bg-gray-800 transition-colors shadow-lg"
            >
              🔏 Seal →
            </button>
            <button
              onClick={() => window.location.href = '/scan'}
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl text-base hover:border-gray-400 transition-colors"
            >
              ✅ Verify — Free
            </button>
            <button
              onClick={() => window.location.href = '/lookup'}
              className="px-8 py-4 border-2 border-gray-100 text-gray-600 font-semibold rounded-2xl text-base hover:border-gray-300 transition-colors"
            >
              🔍 File Lookup
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
              { value: totalVerifications > 0 ? totalVerifications.toLocaleString() + '+' : '...', label: 'Files Identified' },
              { value: '4', label: 'Blockchains' },
              { value: '6', label: 'AI Models' },
              { value: '∞', label: 'Years of Proof' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO PRODUCTS ── */}
      <section className="py-16 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Two powerful tools. One platform.</h2>
            <p className="text-gray-500">UHRATE gives you both — permanent digital identity and instant authenticity verification</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Identity */}
            <div className="bg-black text-white rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-6">🔐</div>
              <h3 className="text-2xl font-black mb-3">Digital Identity</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Give any file a permanent, immutable identity on the blockchain. Timestamped proof of existence, ownership, and authenticity — forever. No central authority. No expiry. No middleman.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Permanent on-chain record',
                  'Proof of existence & ownership',
                  'NFT certificate issued',
                  'Verifiable by anyone, anywhere',
                  'ETH, BNB, Base, Polygon',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-white">$0.20 <span className="text-sm font-normal text-gray-400">or $0.10 in UHR</span></p>
                  <p className="text-xs text-gray-500">+ network gas fee</p>
                </div>
                <button
                  onClick={() => document.getElementById('identity-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors"
                >
                  Get Identity →
                </button>
              </div>
            </div>

            {/* Verify */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Authenticity Check</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Instantly check whether any file is original, AI-generated, deepfaked, or manipulated. Our AI models analyze the file and give you a trust score and detailed report.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'AI deepfake detection',
                  'AI generation probability',
                  'Manipulation analysis',
                  'Trust score 0-100',
                  'Free, no account needed',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">Free</p>
                  <p className="text-xs text-gray-400">No account required</p>
                </div>
                <button
                  onClick={() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 py-3 bg-black text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition-colors"
                >
                  Check Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IDENTITY MATTERS ── */}
      <section className="py-20 px-4 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Why every file needs a permanent identity</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">In a world of deepfakes, AI generation, and digital fraud — provenance is everything. UHRATE makes it impossible to fake the origin of a file.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📰', title: 'Journalists & Media', problem: 'Fake images and videos spread as real news', solution: 'Timestamp original footage on-chain before publishing. Prove it was captured when and where you say.' },
              { icon: '🎓', title: 'Universities', problem: 'Fake degrees sold online for $200', solution: 'Issue tamper-proof blockchain certificates. Any employer verifies in 3 seconds — impossible to forge.' },
              { icon: '🎨', title: 'Creators & Artists', problem: 'Work stolen and claimed by others', solution: 'Timestamp your work before publishing. Own permanent, irrefutable proof of creation forever.' },
              { icon: '⚖️', title: 'Law Firms', problem: 'Contracts altered after signing', solution: 'Hash contracts on-chain. Any alteration creates a detectable mismatch — dispute-proof forever.' },
              { icon: '🏦', title: 'Banks & Finance', problem: 'Forged documents cost billions annually', solution: 'Require blockchain identity on all submitted documents. Fraud becomes cryptographically impossible.' },
              { icon: '🏢', title: 'Enterprise', problem: 'No reliable way to verify supplier documents', solution: 'Build document verification into your workflow via UHRATE API. Scale to thousands of files instantly.' },
            ].map(item => (
              <div key={item.title} className="p-6 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-red-500 font-semibold mb-2">❌ Problem: {item.problem}</p>
                <p className="text-xs text-green-600 font-semibold">✓ UHRATE: {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IDENTITY WORKS ── */}
      <section className="py-20 px-4 bg-black text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">How digital identity works</h2>
            <p className="text-gray-400">From file to permanent blockchain record in under 60 seconds</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { num: '01', icon: '📤', title: 'Upload File', desc: 'Any file type. Any size up to 50MB.' },
              { num: '02', icon: '🧬', title: 'DNA Fingerprint', desc: 'Unique SHA-256 hash generated — your file\'s permanent fingerprint.' },
              { num: '03', icon: '🤖', title: 'AI Analysis', desc: 'Deepfake, manipulation and AI detection scores generated.' },
              { num: '04', icon: '⛓️', title: 'On-Chain Record', desc: 'Hash deployed to your chosen blockchain. Permanent. Immutable.' },
              { num: '05', icon: '📜', title: 'Identity Issued', desc: 'Download certificate. Share proof. Verifiable forever.' },
            ].map((step, i) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">{step.icon}</div>
                <p className="text-xs text-gray-500 font-mono mb-1">{step.num}</p>
                <p className="font-bold text-white text-sm mb-1">{step.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                {i < 4 && <div className="hidden sm:block text-gray-700 text-xl mt-4">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IDENTITY SECTION ── */}
      <section id="identity-section" className="py-16 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold mb-4">🔐 Give Your File a Permanent Identity</div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Identity Registry</h2>
            <p className="text-gray-500">Choose the type of document to register on the blockchain</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: '📄', title: 'Document Identity', desc: 'Any document, contract, or file', href: '/registry', color: 'border-gray-200 hover:border-black' },
              { icon: '🎓', title: 'Education Credential', desc: 'Degrees, diplomas, certificates', href: '/education', color: 'border-gray-200 hover:border-blue-400' },
              { icon: '⚖️', title: 'Legal Document', desc: 'Contracts, NDAs, agreements', href: '/legal', color: 'border-gray-200 hover:border-purple-400' },
              { icon: '📰', title: 'Media & Content', desc: 'Photos, videos, audio, articles', href: '/media', color: 'border-gray-200 hover:border-green-400' },
            ].map(item => (
              <button key={item.href} onClick={() => window.location.href = item.href} className={"bg-white border-2 rounded-2xl p-6 text-left transition-all cursor-pointer shadow-sm hover:shadow-md " + item.color}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">$0.20 · or $0.10 with UHR</span>
                  <span className="text-xs font-bold text-black">Register →</span>
                </div>
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Pay with <strong>ETH, BNB, Base, or Polygon</strong> — or save 50% by paying with <strong>UHR token</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.href = '/presale'} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors">🔥 Get UHR at Presale Price →</button>
              <button onClick={() => window.location.href = '/register'} className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">Create Free Account</button>
            </div>
          </div>
        </div>
      </section>

            {/* ── THREE PRODUCTS ── */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Three powerful tools. One platform.</h2>
            <p className="text-gray-500">Everything you need to protect, analyse, and verify digital files</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button onClick={() => window.location.href = '/seal'} className="bg-black text-white rounded-3xl p-8 text-left cursor-pointer border-0 hover:bg-gray-900 transition-colors">
              <div className="text-4xl mb-4">🔏</div>
              <h3 className="text-xl font-black mb-2">Seal</h3>
              <p className="text-gray-300 text-sm mb-4">Give any file a permanent, immutable identity on the blockchain. Proof of existence, ownership, and authenticity — forever.</p>
              <p className="text-yellow-400 font-bold text-sm">$0.20 · or $0.10 in UHR →</p>
            </button>
            <button onClick={() => window.location.href = '/scan'} className="bg-white border-2 border-gray-200 rounded-3xl p-8 text-left cursor-pointer hover:border-gray-400 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Verify</h3>
              <p className="text-gray-500 text-sm mb-4">AI-powered analysis for deepfakes, manipulation, AI generation. Get a detailed trust report with scores across 6 AI models.</p>
              <p className="text-green-600 font-bold text-sm">Free — No account needed →</p>
            </button>
            <button onClick={() => window.location.href = '/lookup'} className="bg-white border-2 border-gray-200 rounded-3xl p-8 text-left cursor-pointer hover:border-gray-400 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Lookup</h3>
              <p className="text-gray-500 text-sm mb-4">Check if any file has been sealed on UHRATE. Upload the file, enter a certificate ID, or paste a SHA-256 hash.</p>
              <p className="text-blue-600 font-bold text-sm">Free — Instant results →</p>
            </button>
          </div>
        </div>
      </section>

      {/* ── INVESTOR SECTION ── */}
      <section className="py-20 px-4 bg-black text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-bold mb-6 uppercase tracking-wider">
                🔥 Presale Live — $0.01/UHR
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Invest in the trust infrastructure of the internet</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                UHRATE is building the decentralized notary layer for the digital world. Every document, credential, and piece of content that needs permanent proof of existence will need UHRATE. UHR powers the entire network.
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
                <button onClick={() => window.location.href = '/presale'} className="px-6 py-3 bg-yellow-400 text-black font-black rounded-xl text-sm hover:bg-yellow-300 transition-colors">Join Presale →</button>
                <button onClick={() => window.location.href = '/tokenomics'} className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">Tokenomics</button>
                <button onClick={() => window.location.href = '/whitepaper'} className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">Whitepaper</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '💸', title: '50% Cheaper', desc: 'Pay $0.10 in UHR vs $0.20 in ETH for every identity deployment' },
                { icon: '🔥', title: 'Deflationary', desc: '10% of all UHR fees burned permanently on every transaction' },
                { icon: '📈', title: 'Buyback', desc: '20% of platform revenue used quarterly to buy and burn UHR' },
                { icon: '🌍', title: 'Global Market', desc: '$50B+ document verification market with zero dominant Web3 player' },
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

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Start protecting your files today.</h2>
          <p className="text-gray-500 mb-8">Give your documents a permanent identity. Check any file for authenticity. Free to start — forever.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => document.getElementById('identity-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-black text-white font-bold rounded-2xl text-sm hover:bg-gray-800 transition-colors">
              🔐 Give a File Permanent Identity
            </button>
            <button onClick={() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm hover:border-gray-400 transition-colors">
              🔍 Check File Authenticity
            </button>
            <button onClick={() => window.location.href = '/presale'} className="px-8 py-4 bg-red-500 text-white font-bold rounded-2xl text-sm hover:bg-red-600 transition-colors">
              🔥 Join Presale
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
              <p className="text-xs text-gray-500 leading-relaxed mb-3">The decentralized notary for the digital world. Permanent identity for every file.</p>
              <p className="text-xs text-gray-400 mb-3">hello@uhrate.online</p>
              <div>
                <p className="text-xs text-gray-400 mb-2">Follow us</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => window.open('https://x.com/uhrate_official', '_blank')} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span className="text-xs text-gray-600">X</span>
                  </button>
                  <button onClick={() => window.open('https://t.me/uhrateofficial', '_blank')} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.86l-2.95-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.718.726z"/></svg>
                    <span className="text-xs text-gray-600">Telegram</span>
                  </button>
                  <button onClick={() => window.open('https://www.instagram.com/uhrate', '_blank')} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    <span className="text-xs text-gray-600">Instagram</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Platform</p>
              <div className="space-y-2">
                {[
                  { label: '🔏 Seal', href: '/seal' },
                  { label: '✅ Verify', href: '/scan' },
                  { label: '🔍 Lookup', href: '/lookup' },
                  { label: 'Document Registry', href: '/registry' },
                  { label: 'Education Registry', href: '/education' },
                  { label: 'Legal Registry', href: '/legal' },
                  { label: 'Media Registry', href: '/media' },
                  { label: 'Bulk Verification', href: '/enterprise' },
                  { label: 'Developer API', href: '/api-marketplace' },
                ].map(item => (
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">{item.label}</button>
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
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">{item.label}</button>
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
                  <button key={item.href} onClick={() => window.location.href = item.href} className="block text-xs text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer text-left">{item.label}</button>
                ))}
                <p className="text-xs text-gray-400 pt-2">uhrate.online</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 UHRATE. All rights reserved.</p>
            <p className="text-xs text-gray-400">The decentralized notary for the digital world · BNB Smart Chain</p>
          </div>
        </div>
      </footer>
            
    </main>
  );
}
