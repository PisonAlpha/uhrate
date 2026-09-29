content = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old = """          <button
            onClick={() => { const a = document.createElement('a'); a.href = '/uhrate-tokenomics.xlsx'; a.download = 'UHRATE_Tokenomics.xlsx'; a.click(); }}
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex-shrink-0 border-0 cursor-pointer"
          >
            Download Spreadsheet
          </button>"""

new = """          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => window.open('/uhrate-tokenomics.xlsx', '_blank')}
              className="px-5 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors border-0 cursor-pointer"
            >
              View Spreadsheet
            </button>
            <button
              onClick={() => { const a = document.createElement('a'); a.href = '/uhrate-tokenomics.xlsx'; a.download = 'UHRATE_Tokenomics.xlsx'; a.click(); }}
              className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors border cursor-pointer bg-white"
            >
              Download
            </button>
          </div>"""

if old in content:
    content = content.replace(old, new)
    print('FIXED')
else:
    print('NOT FOUND')

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')