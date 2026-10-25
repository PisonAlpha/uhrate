content = open('app/page.tsx', 'r', encoding='utf-8').read()

# Fix Token dropdown in homepage nav
old_token = """                    { icon: '🔥', label: 'Presale $0.01', href: '/presale' },
                    { icon: '💱', label: 'Buy UHR $0.02', href: '/swap' },
                    { icon: '📊', label: 'Tokenomics', href: '/tokenomics' },
                    { icon: '📄', label: 'Whitepaper', href: '/whitepaper' },"""

new_token = """                    { icon: '🔥', label: 'Presale — $0.01', href: '/presale' },
                    { icon: '💱', label: 'Buy UHR — $0.02', href: '/swap' },
                    { icon: '📊', label: 'Tokenomics', href: '/tokenomics' },
                    { icon: '🗺️', label: 'Roadmap', href: '/roadmap' },
                    { icon: '📄', label: 'Whitepaper', href: '/whitepaper' },
                    { icon: '📈', label: 'Investors', href: '/investors' },
                    { icon: '📉', label: 'Analytics', href: '/analytics' },"""

if old_token in content:
    content = content.replace(old_token, new_token)
    print('FIXED: desktop token dropdown')
else:
    print('NOT FOUND: desktop token dropdown')

# Fix mobile menu token section
old_mobile_token = """            { label: '🔥 Presale $0.01', href: '/presale' },
            { label: '💱 Buy UHR $0.02', href: '/swap' },
            { label: '📊 Tokenomics', href: '/tokenomics' },
            { label: '📄 Whitepaper', href: '/whitepaper' },"""

new_mobile_token = """            { label: '🔥 Presale — $0.01', href: '/presale' },
            { label: '💱 Buy UHR — $0.02', href: '/swap' },
            { label: '📊 Tokenomics', href: '/tokenomics' },
            { label: '🗺️ Roadmap', href: '/roadmap' },
            { label: '📄 Whitepaper', href: '/whitepaper' },
            { label: '📈 Investors', href: '/investors' },
            { label: '📉 Analytics', href: '/analytics' },"""

if old_mobile_token in content:
    content = content.replace(old_mobile_token, new_mobile_token)
    print('FIXED: mobile token menu')
else:
    print('NOT FOUND: mobile token menu')

# Fix footer Token column
old_footer_token = """                  { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
                  { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
                  { label: 'Tokenomics', href: '/tokenomics' },
                  { label: 'Whitepaper', href: '/whitepaper' },"""

new_footer_token = """                  { label: '🔥 Presale — $0.01/UHR', href: '/presale' },
                  { label: '🔄 Buy UHR — $0.02/UHR', href: '/swap' },
                  { label: 'Tokenomics', href: '/tokenomics' },
                  { label: '🗺️ Roadmap', href: '/roadmap' },
                  { label: 'Whitepaper', href: '/whitepaper' },
                  { label: 'Investors', href: '/investors' },
                  { label: 'Analytics', href: '/analytics' },"""

if old_footer_token in content:
    content = content.replace(old_footer_token, new_footer_token)
    print('FIXED: footer token column')
else:
    print('NOT FOUND: footer token column - trying alternate')
    # Try to find it differently
    import re
    matches = re.findall(r"label: '.*?Tokenomics.*?'", content)
    print(f'Found tokenomics refs: {matches}')

open('app/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')