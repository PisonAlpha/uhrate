content = open('app/seal/page.tsx', 'r', encoding='utf-8').read()

old = """              
                href={`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                View on Blockchain Explorer
              </a>"""

new = """              <button
                onClick={() => window.open(`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`, '_blank')}
                className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors border-0 cursor-pointer"
              >
                View on Blockchain Explorer
              </button>"""

content = content.replace(old, new)
open('app/seal/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')