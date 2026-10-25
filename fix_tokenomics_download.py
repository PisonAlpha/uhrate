content = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old = """      {/* Contract Address */}
      <section className="bg-gray-50 py-8 px-4 border-b border-gray-200">"""

new = """      {/* Spreadsheet Download */}
      <section className="bg-gray-50 py-6 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">📊 Full Tokenomics Spreadsheet</p>
            <p className="text-sm text-gray-500">Complete vesting schedule, investment rounds, unlock milestones — Excel format</p>
          </div>
          
            href="/uhrate-tokenomics.xlsx"
            download="UHRATE_Tokenomics.xlsx"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors no-underline flex-shrink-0"
          >
            Download Spreadsheet
          </a>
        </div>
      </section>

      {/* Contract Address */}
      <section className="bg-gray-50 py-8 px-4 border-b border-gray-200">"""

if old in content:
    content = content.replace(old, new)
    print('FIXED: added spreadsheet download button')
else:
    print('NOT FOUND')

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')