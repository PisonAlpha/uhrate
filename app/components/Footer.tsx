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
            <div className="flex gap-3">
              <button onClick={() => window.open('https://x.com/uhrate_official', '_blank')} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button onClick={() => window.open('https://t.me/uhrateofficial', '_blank')} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors bg-transparent border-0 cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.86l-2.95-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.718.726z"/></svg>
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
  );
}