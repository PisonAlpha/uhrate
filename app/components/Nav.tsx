'use client';

import { useState, useEffect } from 'react';

interface NavProps {
  active?: string;
}

export default function Nav({ active }: NavProps) {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('uhrate_user');
    window.location.href = '/';
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* Presale Banner */}
      <div className="bg-black text-white py-2 px-4 text-center text-xs">
        <span className="text-yellow-400 font-bold">🔥 UHR Presale Live</span>
        <span className="text-gray-400 mx-2">·</span>
        <span className="text-gray-300">Buy UHR at $0.01 before listing</span>
        <span className="text-gray-400 mx-2">·</span>
        <button onClick={() => window.location.href = '/presale'} className="text-yellow-400 font-bold hover:text-yellow-300 bg-transparent border-0 cursor-pointer underline">
          Join →
        </button>
      </div>

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
                        <button onClick={() => window.location.href = '/scan'} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer " + (active === 'scan' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
              ✅ Verify
            </button>
            <button onClick={() => window.location.href = '/lookup'} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer " + (active === 'lookup' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
              🔍 Lookup
            </button>

          {/* Registry Dropdown */}
          <div className="relative">
            <button onClick={() => { setRegistryOpen(!registryOpen); setTokenOpen(false); }} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1 " + (active === 'registry' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
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
            <button onClick={() => { setTokenOpen(!tokenOpen); setRegistryOpen(false); }} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer flex items-center gap-1 " + (active === 'token' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
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

          <button onClick={() => window.location.href = '/enterprise'} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer " + (active === 'enterprise' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
            Bulk Verify
          </button>
          <button onClick={() => window.location.href = '/api-marketplace'} className={"px-3 py-2 text-sm rounded-lg bg-transparent border-0 cursor-pointer " + (active === 'api' ? 'text-gray-900 bg-gray-100 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
            API
          </button>
        </nav>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <button onClick={() => window.location.href = '/presale'} className="px-4 py-2 text-sm text-white font-bold bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
            🔥 Presale
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-transparent border-0 cursor-pointer">
                Dashboard
              </button>
              <button onClick={logout} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer">
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
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-600 bg-transparent border-0 cursor-pointer text-xl">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 max-h-screen overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Platform</p>
          {[
            { label: '🔏 Seal', href: '/seal' },
            { label: '✅ Verify', href: '/scan' },
            { label: '🔍 File Lookup', href: '/lookup' },
            { label: '📄 Document Registry', href: '/registry' },
            { label: '🎓 Education Registry', href: '/education' },
            { label: '⚖️ Legal Registry', href: '/legal' },
            { label: '📰 Media Registry', href: '/media' },
            { label: '📁 Bulk Verification', href: '/enterprise' },
            { label: '🔌 Developer API', href: '/api-marketplace' },
          ].map(item => (
            <button key={item.href} onClick={() => { window.location.href = item.href; setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">
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
            <button key={item.href} onClick={() => { window.location.href = item.href; setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-100 my-2" />
          {user ? (
            <>
              <button onClick={() => { window.location.href = '/dashboard'; setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">Dashboard</button>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl bg-transparent border-0 cursor-pointer">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { window.location.href = '/login'; setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent border-0 cursor-pointer">Login</button>
              <button onClick={() => { window.location.href = '/register'; setMobileOpen(false); }} className="w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors text-center">Sign up free</button>
            </>
          )}
        </div>
      )}
            {/* Floating Partner Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://iq.wiki/wiki/uhrate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all no-underline group"
        >
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">IQ</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Listed on IQ.wiki</p>
            <p className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">View our profile →</p>
          </div>
        </a>
      </div>
    </header>
  );
}