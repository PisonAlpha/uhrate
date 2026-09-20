import os
import re

pages = ['app/page.tsx', 'app/components/Nav.tsx']

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path}')
        continue
    content = open(path, 'r', encoding='utf-8').read()
    
    # Remove ALL floating partner sections - clean slate
    content = re.sub(
        r'\s*\{/\* Floating Partner[s]? \*/\}[\s\S]*?</div>',
        '',
        content
    )
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f'CLEANED: {path}')

print('Done!')