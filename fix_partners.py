import os

new_floating = """      {/* Floating Partners */}
      <div className="fixed bottom-8 right-4 z-50 flex flex-col gap-2">
        {[
          { name: 'IQ.wiki', url: 'https://iq.wiki/wiki/uhrate', logo: 'https://iq.wiki/favicon.ico', bg: 'bg-blue-600', text: 'IQ' },
          { name: 'CryptoPulse', url: 'https://www.cryptopulse.top/', logo: 'https://www.cryptopulse.top/favicon.ico', bg: 'bg-purple-600', text: 'CP' },
          { name: 'ATT Global', url: 'https://www.attglobal.io/', logo: null, bg: 'bg-orange-500', text: 'ATT' },
          { name: 'CoinGecko', url: 'https://www.coingecko.com/', logo: 'https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d2fad96ade625037661d474b912.png', bg: 'bg-green-500', text: '🦎' },
          { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/', logo: null, bg: 'bg-blue-500', text: 'CMC' },
        ].map((partner, i) => (
          
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-badge flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all no-underline"
          >
            <div className={`w-7 h-7 ${partner.bg} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}>
              {partner.logo ? (
                <img src={partner.logo} alt={partner.name} className="w-5 h-5 object-contain" onError={(e: any) => { e.target.style.display='none'; }} />
              ) : (
                <span className="text-white text-xs font-black">{partner.text}</span>
              )}
            </div>
            <p className="text-xs font-bold text-gray-900">{partner.name}</p>
          </a>
        ))}
      </div>"""

pages = ['app/page.tsx', 'app/components/Nav.tsx']

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue
    content = open(path, 'r', encoding='utf-8').read()
    
    # Remove old floating badge
    import re
    content = re.sub(
        r'\s*\{/\* Floating Partner[s]? \*/\}[\s\S]*?</div>\n',
        '\n',
        content,
        count=1
    )
    
    # Add new floating badges before closing tag
    if path == 'app/page.tsx':
        content = content.replace('    </main>', new_floating + '\n    </main>')
    else:
        content = content.replace('    </header>', new_floating + '\n    </header>')
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f'UPDATED: {path}')

print('Done!')