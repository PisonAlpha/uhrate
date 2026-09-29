content = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old = """          
            href="/uhrate-tokenomics.xlsx"
            download="UHRATE_Tokenomics.xlsx"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors no-underline flex-shrink-0"
          >
            Download Spreadsheet
          </a>"""

new = """          <button
            onClick={() => { const a = document.createElement('a'); a.href = '/uhrate-tokenomics.xlsx'; a.download = 'UHRATE_Tokenomics.xlsx'; a.click(); }}
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex-shrink-0 border-0 cursor-pointer"
          >
            Download Spreadsheet
          </button>"""

if old in content:
    content = content.replace(old, new)
    print('FIXED')
else:
    print('NOT FOUND')

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')