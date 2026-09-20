import os

floating_badge = """
      {/* Floating Partners */}
      <div className="fixed bottom-8 right-4 z-50 flex flex-col gap-2 animate-bounce-slow">
        {[
          { name: 'IQ.wiki', url: 'https://iq.wiki/wiki/uhrate', bg: 'bg-blue-600', text: 'IQ' },
          { name: 'CoinGecko', url: 'https://www.coingecko.com/', bg: 'bg-green-500', text: '🦎' },
          { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/', bg: 'bg-blue-500', text: 'CMC' },
        ].map(partner => (
          
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all no-underline"
          >
            <div className={`w-6 h-6 ${partner.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-black">{partner.text}</span>
            </div>
            <p className="text-xs font-bold text-gray-900">{partner.name}</p>
          </a>
        ))}
      </div>
"""

pages = ['app/page.tsx', 'app/components/Nav.tsx']

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue
    content = open(path, 'r', encoding='utf-8').read()
    if 'Floating Partners' in content:
        print(f'SKIP already has badges: {path}')
        continue
    # Add before closing </main> or </header>
    if path == 'app/page.tsx':
        content = content.replace('    </main>', floating_badge + '\n    </main>')
    else:
        content = content.replace('    </header>', floating_badge + '\n    </header>')
    open(path, 'w', encoding='utf-8').write(content)
    print(f'ADDED: {path}')

print('Done!')