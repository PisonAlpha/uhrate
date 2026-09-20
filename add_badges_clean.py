floating = '''
      {/* Floating Partners */}
      <div className="fixed bottom-8 right-4 z-50 flex flex-col gap-2">
        {[
          { name: "IQ.wiki", url: "https://iq.wiki/wiki/uhrate", bg: "bg-blue-600", text: "IQ" },
          { name: "CryptoPulse", url: "https://www.cryptopulse.top/", bg: "bg-purple-600", text: "CP" },
          { name: "ATT Global", url: "https://www.attglobal.io/", bg: "bg-orange-500", text: "ATT" },
          { name: "CoinGecko", url: "https://www.coingecko.com/", bg: "bg-green-500", text: "🦎" },
          { name: "CoinMarketCap", url: "https://coinmarketcap.com/", bg: "bg-blue-500", text: "CMC" },
        ].map((partner, i) => (
          
            key={i}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-badge flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all no-underline"
          >
            <div className={`w-7 h-7 ${partner.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-black">{partner.text}</span>
            </div>
            <p className="text-xs font-bold text-gray-900">{partner.name}</p>
          </a>
        ))}
      </div>'''

# Fix page.tsx
content = open('app/page.tsx', 'r', encoding='utf-8').read()
if 'Floating Partners' not in content:
    content = content.replace('    </main>\n  );\n}', floating + '\n    </main>\n  );\n}')
    open('app/page.tsx', 'w', encoding='utf-8').write(content)
    print('ADDED to page.tsx')
else:
    print('SKIP page.tsx - already has badges')

# Fix Nav.tsx
content = open('app/components/Nav.tsx', 'r', encoding='utf-8').read()
if 'Floating Partners' not in content:
    content = content.replace('    </header>\n  );\n}', floating + '\n    </header>\n  );\n}')
    open('app/components/Nav.tsx', 'w', encoding='utf-8').write(content)
    print('ADDED to Nav.tsx')
else:
    print('SKIP Nav.tsx - already has badges')

print('Done!')