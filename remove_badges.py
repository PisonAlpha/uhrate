import re

files = ['app/page.tsx', 'app/components/Nav.tsx']

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    # Remove floating partners div
    content = re.sub(
        r'\n\s*\{/\* Floating Partners \*/\}[\s\S]*?</div>',
        '',
        content
    )
    open(path, 'w', encoding='utf-8').write(content)
    print(f'CLEANED: {path}')

print('Done!')