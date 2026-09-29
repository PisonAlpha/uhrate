content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Fix desktop Token dropdown (lines 89-92)
old_desktop = """                    { icon: '🔥', label: 'Presale — $0.01/UHR', href: '/presale' },
                    { icon: '🔄', label: 'Buy UHR — $0.02/UHR', href: '/swap' },
                    { icon: '📊', label: 'Tokenomics', href: '/tokenomics' },
                    { icon: '📄', label: 'Whitepaper', href: '/whitepaper' },"""

new_desktop = """                    { icon: '🔥', label: 'Presale — $0.01/UHR', href: '/presale' },
                    { icon: '🔄', label: 'Buy UHR — $0.02/UHR', href: '/swap' },
                    { icon: '📊', label: 'Tokenomics', href: '/tokenomics' },
                    { icon: '🗺️', label: 'Roadmap', href: '/roadmap' },
                    { icon: '📄', label: 'Whitepaper', href: '/whitepaper' },
                    { icon: '📈', label: 'Investors', href: '/investors' },
                    { icon: '📉', label: 'Analytics', href: '/analytics' },"""

if old_desktop in content:
    content = content.replace(old_desktop, new_desktop)
    print('FIXED: desktop token dropdown')
else:
    print('NOT FOUND: desktop token dropdown')

# Fix mobile Token menu (lines 149-152)
old_mobile = """              { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
              { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
              { label: '📊 Tokenomics', href: '/tokenomics' },
              { label: '📄 Whitepaper', href: '/whitepaper' },"""

new_mobile = """              { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
              { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
              { label: '📊 Tokenomics', href: '/tokenomics' },
              { label: '🗺️ Roadmap', href: '/roadmap' },
              { label: '📄 Whitepaper', href: '/whitepaper' },
              { label: '📈 Investors', href: '/investors' },
              { label: '📉 Analytics', href: '/analytics' },"""

if old_mobile in content:
    content = content.replace(old_mobile, new_mobile)
    print('FIXED: mobile token menu')
else:
    print('NOT FOUND: mobile token menu')

# Also fix investor section buttons (lines 468-469) to add roadmap
old_btns = """                <button onClick={() => window.location.href = '/tokenomics'} className="px-6 py-3 bo
                <button onClick={() => window.location.href = '/whitepaper'} className="px-6 py-3 bo"""

# These are truncated - use what we know from line numbers
# Fix investor CTA buttons
old_inv = """                <button onClick={() => window.location.href = '/tokenomics'} className="px-6 py-3 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
                  Tokenomics
                </button>
                <button onClick={() => window.location.href = '/whitepaper'} className="px-6 py-3 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
                  Whitepaper
                </button>"""

new_inv = """                <button onClick={() => window.location.href = '/tokenomics'} className="px-6 py-3 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
                  Tokenomics
                </button>
                <button onClick={() => window.location.href = '/roadmap'} className="px-6 py-3 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
                  Roadmap
                </button>
                <button onClick={() => window.location.href = '/whitepaper'} className="px-6 py-3 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
                  Whitepaper
                </button>"""

if old_inv in content:
    content = content.replace(old_inv, new_inv)
    print('FIXED: investor CTA buttons')
else:
    print('NOT FOUND: investor CTA buttons')

open('app/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')