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

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.verifications) setTotalVerifications(data.verifications.length);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('uhrate_user');
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">UH</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">UHRATE</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => window.location.href = '/verify'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Verify</button>
              <div className="relative group">
                <button className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer flex items-center gap-1">
                  Registry
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {[
                    { label: '📄 Document Registry', href: '/registry' },
                    { label: '🎓 Education', href: '/education' },
                    { label: '⚖️ Legal', href: '/legal' },
                    { label: '📰 Media', href: '/media' },
                    { label: '🪪 Identity', href: '/identity' },
                  ].map(item => (
                    <button key={item.href} onClick={() => window.location.href = item.href}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 bg-transparent border-0 cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => window.location.href = '/enterprise'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Enterprise</button>
              <button onClick={() => window.location.href = '/api-marketplace'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">API</button>
              <button onClick={() => window.location.href = '/pricing'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Pricing</button>
              <button onClick={() => window.location.href = '/dashboard'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Dashboard</button>
            </nav>
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                if (menu) menu.classList.toggle('hidden');
              }}
              className="md:hidden p-2 text-gray-600 bg-transparent border-0 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
           {user ? (
              <>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="text-sm text-gray-600 hidden sm:block hover:text-gray-900 bg-transparent border-0 cursor-pointer"
                >
                  {user.full_name}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 bg-transparent border-0 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div id="mobile-menu" className="hidden md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3">
        {[
          { label: 'Verify', href: '/verify' },
          { label: 'Registry', href: '/registry' },
          { label: 'Education', href: '/education' },
          { label: 'Legal', href: '/legal' },
          { label: 'Media', href: '/media' },
          { label: 'Identity', href: '/identity' },
          { label: 'Enterprise', href: '/enterprise' },
          { label: 'API', href: '/api-marketplace' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Dashboard', href: '/dashboard' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => window.location.href = item.href}
            className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 bg-transparent border-0 cursor-pointer py-2 border-b border-gray-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live · {totalVerifications} files verified
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Is this file
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              real or fake?
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            UHRATE uses AI and blockchain to verify whether any digital file —
            image, video, audio, or document — is original, AI-generated, or manipulated.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => document.getElementById('verify-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-black text-white rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Verify a file free
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
            >
              View pricing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {[
            { label: 'Files Verified', value: totalVerifications.toString() },
            { label: 'AI Models', value: '6' },
            { label: 'Blockchains', value: '8' },
            { label: 'Accuracy', value: '94%' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How UHRATE works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every file gets a permanent cryptographic identity and authenticity record.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🧬',
                title: 'Digital DNA',
                desc: 'SHA-256, SHA-512, perceptual and semantic fingerprints create a permanent content identity.',
              },
              {
                icon: '🤖',
                title: 'AI Analysis',
                desc: 'Claude AI visually analyzes images and documents for deepfakes, manipulation, and AI generation.',
              },
              {
                icon: '⛓️',
                title: 'Blockchain Proof',
                desc: 'Every verification is permanently registered on BNB Chain — tamper-proof forever.',
              },
              {
                icon: '📜',
                title: 'Proof Certificates',
                desc: 'Download PDF, JSON, or NFT certificates with unique IDs anyone can verify.',
              },
              {
                icon: '🌐',
                title: 'IPFS Storage',
                desc: 'Certificate data is stored on IPFS via Pinata — decentralized and permanent.',
              },
              {
                icon: '🔌',
                title: 'Developer API',
                desc: 'Integrate UHRATE into your own apps with our simple REST API.',
              },
            ].map(feature => (
              <div key={feature.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who uses UHRATE</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '📰', label: 'Journalists', desc: 'Verify images and sources' },
              { icon: '🏛️', label: 'Governments', desc: 'Authenticate documents' },
              { icon: '🎓', label: 'Universities', desc: 'Issue verified credentials' },
              { icon: '⚖️', label: 'Law firms', desc: 'Verify contracts' },
              { icon: '🏦', label: 'Banks', desc: 'Detect forged documents' },
              { icon: '🎨', label: 'Creators', desc: 'Protect their work' },
              { icon: '💻', label: 'Developers', desc: 'Build with our API' },
              { icon: '🏢', label: 'Enterprise', desc: 'Bulk verification' },
            ].map(item => (
              <div key={item.label} className="p-4 border border-gray-100 rounded-xl text-center hover:border-gray-300 transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verify section */}
      <section id="verify-section" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify a file now</h2>
            <p className="text-gray-500">Free for up to 10 files. No account required.</p>
          </div>

          <div className="flex gap-2 mb-8 justify-center">
            <button
              onClick={() => { setActiveTab('verify'); setResult(null); }}
              className={"px-6 py-2.5 rounded-xl text-sm font-medium transition-colors " + (
                activeTab === 'verify' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Verify File
            </button>
            <button
              onClick={() => { setActiveTab('lookup'); setResult(null); }}
              className={"px-6 py-2.5 rounded-xl text-sm font-medium transition-colors " + (
                activeTab === 'lookup' ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Lookup Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {activeTab === 'verify' ? (
                <>
                  {!result ? (
                    <FileUploader onResult={setResult} onLoading={setLoading} />
                  ) : (
                    <ScoreCard result={result} />
                  )}
                </>
              ) : (
                <CertificateCard />
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Step by step</h3>
              {[
                { step: '01', title: 'Upload your file', desc: 'Drag and drop any image, video, audio, or document up to 50MB' },
                { step: '02', title: 'Digital DNA extraction', desc: 'SHA-256, SHA-512, perceptual and semantic fingerprints generated' },
                { step: '03', title: 'AI analysis', desc: 'Claude AI visually analyzes for deepfakes and manipulation' },
                { step: '04', title: 'Blockchain registration', desc: 'Results permanently recorded on BNB Chain' },
                { step: '05', title: 'Get your certificate', desc: 'Download proof certificate with unique ID' },
              ].map(item => (
                <div key={item.step} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                  <span className="text-xs font-mono text-gray-400 mt-0.5 shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to fight misinformation?
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of journalists, businesses, and creators using UHRATE to verify digital content.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => window.location.href = '/register'}
              className="px-8 py-4 bg-black text-white rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Get started free
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
            >
              View pricing
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">UH</span>
                </div>
                <span className="font-bold text-gray-900">UHRATE</span>
              </div>
              <p className="text-xs text-gray-500">Decentralized Authenticity Network</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-3">Product</p>
              {['Verify', 'Enterprise', 'API', 'Pricing'].map(item => (
                <button
                  key={item}
                  onClick={() => window.location.href = '/' + item.toLowerCase()}
                  className="block text-sm text-gray-500 hover:text-gray-900 mb-2 bg-transparent border-0 cursor-pointer p-0"
                >
                  {item}
                </button>
              ))}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-3">Account</p>
              {[
                { label: 'Login', href: '/login' },
                { label: 'Sign up', href: '/register' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => window.location.href = item.href}
                  className="block text-sm text-gray-500 hover:text-gray-900 mb-2 bg-transparent border-0 cursor-pointer p-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-3">Contact</p>
              <p className="text-sm text-gray-500 mb-2">hello@uhrate.xyz</p>
              <p className="text-sm text-gray-500">uhrate.xyz</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">© 2026 UHRATE. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('https://x.com/Uhrate', '_blank')}
                className="text-gray-400 hover:text-gray-900 transition-colors bg-transparent border-0 cursor-pointer p-0"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                onClick={() => window.open('https://t.me/uhrate', '_blank')}
                className="text-gray-400 hover:text-gray-900 transition-colors bg-transparent border-0 cursor-pointer p-0"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
              <button
                onClick={() => window.open('https://www.linkedin.com/company/uhrate', '_blank')}
                className="text-gray-400 hover:text-gray-900 transition-colors bg-transparent border-0 cursor-pointer p-0"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => window.location.href = '/terms'} className="text-xs text-gray-400 hover:text-gray-900 bg-transparent border-0 cursor-pointer p-0">Terms</button>
              <button onClick={() => window.location.href = '/privacy'} className="text-xs text-gray-400 hover:text-gray-900 bg-transparent border-0 cursor-pointer p-0">Privacy</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}