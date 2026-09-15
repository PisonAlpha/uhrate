import os

pages = [
    'app/verify/page.tsx',
    'app/registry/page.tsx',
    'app/education/page.tsx',
    'app/legal/page.tsx',
    'app/media/page.tsx',
    'app/identity/page.tsx',
    'app/enterprise/page.tsx',
    'app/dashboard/page.tsx',
    'app/presale/page.tsx',
    'app/swap/page.tsx',
    'app/tokenomics/page.tsx',
    'app/contact/page.tsx',
]

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path} not found')
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    if 'import Nav from' in content or 'import Footer from' in content:
        print(f'SKIP: {path} already has Nav/Footer')
        continue
    
    if "'use client';" in content:
        content = content.replace(
            "'use client';",
            "'use client';\nimport Nav from '../components/Nav';\nimport Footer from '../components/Footer';"
        )
    elif '"use client";' in content:
        content = content.replace(
            '"use client";',
            '"use client";\nimport Nav from \'../components/Nav\';\nimport Footer from \'../components/Footer\';'
        )
    
    print(f'Updated imports: {path}')
    open(path, 'w', encoding='utf-8').write(content)

print('Done!')