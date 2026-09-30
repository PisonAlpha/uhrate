# Fix 1: Remove spreadsheet download section from tokenomics page
tok = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old = """      {/* Spreadsheet Download */}
      <section className="bg-gray-50 py-6 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">📊 Full Tokenomics Spreadsheet</p>
            <p className="text-sm text-gray-500">Complete vesting schedule, investment rounds, unlock milestones — Excel format</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
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
          </div>
        </div>
      </section>

"""

if old in tok:
    tok = tok.replace(old, '\n')
    print('REMOVED: spreadsheet download section')
else:
    print('NOT FOUND: spreadsheet section')

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(tok)

# Fix 2: Remove Analytics from Nav Token dropdown (Nav.tsx)
nav = open('app/components/Nav.tsx', 'r', encoding='utf-8').read()

old_nav = """                  { icon: '📉', label: 'Analytics', href: '/analytics' },"""

if old_nav in nav:
    nav = nav.replace(old_nav, '')
    print('REMOVED: Analytics from desktop nav')
else:
    print('NOT FOUND: Analytics in desktop nav')

old_nav_mobile = """            { label: '📉 Analytics', href: '/analytics' },"""
if old_nav_mobile in nav:
    nav = nav.replace(old_nav_mobile, '')
    print('REMOVED: Analytics from mobile nav')
else:
    print('NOT FOUND: Analytics mobile')

open('app/components/Nav.tsx', 'w', encoding='utf-8').write(nav)

# Fix 3: Remove Analytics from homepage nav
page = open('app/page.tsx', 'r', encoding='utf-8').read()

old_page1 = """                    { icon: '📉', label: 'Analytics', href: '/analytics' },"""
if old_page1 in page:
    page = page.replace(old_page1, '')
    print('REMOVED: Analytics from homepage desktop nav')
else:
    print('NOT FOUND: Analytics homepage desktop')

old_page2 = """              { label: '📉 Analytics', href: '/analytics' },"""
if old_page2 in page:
    page = page.replace(old_page2, '')
    print('REMOVED: Analytics from homepage mobile nav')
else:
    print('NOT FOUND: Analytics homepage mobile')

old_page3 = """                  { label: '📉 Analytics', href: '/analytics' },"""
if old_page3 in page:
    page = page.replace(old_page3, '')
    print('REMOVED: Analytics from homepage footer')
else:
    print('NOT FOUND: Analytics homepage footer')

open('app/page.tsx', 'w', encoding='utf-8').write(page)

print('All done!')