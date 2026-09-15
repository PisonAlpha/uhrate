'use client';

export default function Footer() {
  return (
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
            <p className="text-xs text-gray-500 leading-relaxed mb-4">Decentralized Authenticity Network — AI + Blockchain document verification.</p>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Follow us</p>
              <div className="flex gap-2">
                <button onClick={() => window.open('https://x.com/uhrate_official', '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span className="text-xs text-gray-600 font-medium">X</span>
                </button>
                <button onClick={() => window.open('https://t.me/uhrateofficial', '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.86l-2.95-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.718.726z"/></svg>
                  <span className="text-xs text-gray-600 font-medium">Telegram</span>
                </button>
                <button onClick={() => window.open('https://www.instagram.com/uhrate', '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span className="text-xs text-gray-600 font-medium">Instagram</span>
                </button>
              </div>
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
              <p className="text-xs text-gray-400 pt-2">hello@uhrate.online</p>
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
  );
}