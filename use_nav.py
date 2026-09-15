import os

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
    # Check if it has a header tag
    if '<header' in content:
        print(f'HAS HEADER: {path}')
    else:
        print(f'NO HEADER: {path}')