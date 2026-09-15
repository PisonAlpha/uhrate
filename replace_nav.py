import os
import re

pages = [
    'app/verify/page.tsx',
    'app/registry/page.tsx',
    'app/education/page.tsx',
    'app/legal/page.tsx',
    'app/media/page.tsx',
    'app/identity/page.tsx',
    'app/enterprise/page.tsx',
    'app/contact/page.tsx',
]

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path} not found')
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    if '<Nav' in content:
        print(f'SKIP: {path} already uses Nav')
        continue

    # Replace header block with <Nav />
    # Find <header ... </header> and replace
    new_content = re.sub(
        r'<header[\s\S]*?</header>',
        '<Nav />',
        content,
        count=1
    )
    
    if new_content != content:
        open(path, 'w', encoding='utf-8').write(new_content)
        print(f'REPLACED header with Nav: {path}')
    else:
        print(f'NO CHANGE: {path}')

print('Done!')