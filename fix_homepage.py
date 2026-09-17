import os

path = 'app/page.tsx'
content = open(path, 'r', encoding='utf-8').read()

# Fix mobile menu - remove Identity Badge, add Seal/Verify/Lookup
old_mobile = """              { label: '📄 Document Identity', href: '/registry' },
              { label: '🎓 Education Credential', href: '/education' },
              { label: '⚖️ Legal Document', href: '/legal' },
              { label: '📰 Media & Content', href: '/media' },
              { label: '🪪 Identity Badge', href: '/identity' },"""

new_mobile = """              { label: '🔏 Seal', href: '/seal' },
              { label: '✅ Verify', href: '/scan' },
              { label: '🔍 Lookup', href: '/lookup' },
              { label: '📄 Document Registry', href: '/registry' },
              { label: '🎓 Education Registry', href: '/education' },
              { label: '⚖️ Legal Registry', href: '/legal' },
              { label: '📰 Media Registry', href: '/media' },"""

content = content.replace(old_mobile, new_mobile)

# Fix mobile menu header
content = content.replace(
    '<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Give Identity</p>',
    '<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Platform</p>'
)

# Fix desktop registry dropdown header
content = content.replace(
    '<p className="text-xs text-gray-400 px-3 py-1 font-semibold uppercase tracking-wider">Identity Registry</p>',
    '<p className="text-xs text-gray-400 px-3 py-1 font-semibold uppercase tracking-wider">Platform</p>'
)

# Fix desktop registry dropdown items
old_desktop = """                    { icon: '📄', label: 'Document Identity', href: '/registry' },
                    { icon: '🎓', label: 'Education Credential', href: '/education' },
                    { icon: '⚖️', label: 'Legal', href: '/legal' },
                    { icon: '📰', label: 'Media', href: '/media' },
                    { icon: '🪪', label: 'Identity Badge', href: '/identity' },"""

new_desktop = """                    { icon: '🔏', label: 'Seal', href: '/seal' },
                    { icon: '✅', label: 'Verify', href: '/scan' },
                    { icon: '🔍', label: 'Lookup', href: '/lookup' },
                    { icon: '📄', label: 'Document Registry', href: '/registry' },
                    { icon: '🎓', label: 'Education Registry', href: '/education' },
                    { icon: '⚖️', label: 'Legal Registry', href: '/legal' },
                    { icon: '📰', label: 'Media Registry', href: '/media' },"""

content = content.replace(old_desktop, new_desktop)

# Fix footer platform column
old_footer = """                  { label: 'Document Identity', href: '/registry' },
                  { label: 'Education Credential', href: '/education' },
                  { label: 'Legal Document', href: '/legal' },
                  { label: 'Media & Content', href: '/media' },
                  { label: 'Identity Badge', href: '/identity' },
                  { label: 'Bulk Verification', href: '/enterprise' },
                  { label: 'Developer API', href: '/api-marketplace' },"""

new_footer = """                  { label: '🔏 Seal', href: '/seal' },
                  { label: '✅ Verify', href: '/scan' },
                  { label: '🔍 Lookup', href: '/lookup' },
                  { label: 'Document Registry', href: '/registry' },
                  { label: 'Education Registry', href: '/education' },
                  { label: 'Legal Registry', href: '/legal' },
                  { label: 'Media Registry', href: '/media' },
                  { label: 'Bulk Verification', href: '/enterprise' },
                  { label: 'Developer API', href: '/api-marketplace' },"""

content = content.replace(old_footer, new_footer)

# Fix footer column header
content = content.replace(
    '<p className="font-semibold text-gray-900 text-sm mb-3">Identity</p>',
    '<p className="font-semibold text-gray-900 text-sm mb-3">Platform</p>'
)

open(path, 'w', encoding='utf-8').write(content)
print('Done!')