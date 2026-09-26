content = open('app/lookup/page.tsx', 'r', encoding='utf-8').read()

old = """                  
                    href={chain ? `${chain.explorer}/tx/${v.blockchain_tx}` : `https://bscscan.com/tx/${v.blockchain_tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    View on Blockchain Explorer
                  </a>"""

new = """                  <button
                    onClick={() => window.open(chain ? `${chain.explorer}/tx/${v.blockchain_tx}` : `https://bscscan.com/tx/${v.blockchain_tx}`, '_blank')}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors border-0 cursor-pointer"
                  >
                    View on Blockchain Explorer
                  </button>"""

if old in content:
    content = content.replace(old, new)
    print('FIXED')
else:
    print('NOT FOUND')

open('app/lookup/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')