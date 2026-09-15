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
    'app/presale/page.tsx',
    'app/swap/page.tsx',
    'app/tokenomics/page.tsx',
    'app/dashboard/page.tsx',
]

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP: {path} not found')
        continue

    content = open(path, 'r', encoding='utf-8').read()

    if '<Footer' in content:
        print(f'SKIP: {path} already has Footer')
        continue

    # Find existing footer tag and replace, or add before </main>
    if '<footer' in content:
        new_content = re.sub(
            r'<footer[\s\S]*?</footer>',
            '<Footer />',
            content,
            count=1
        )
        if new_content != content:
            open(path, 'w', encoding='utf-8').write(new_content)
            print(f'REPLACED footer: {path}')
            continue

    # Add Footer before closing </main>
    if '</main>' in content:
        new_content = content.replace('</main>', '      <Footer />\n    </main>', 1)
        open(path, 'w', encoding='utf-8').write(new_content)
        print(f'ADDED Footer before </main>: {path}')
    else:
        print(f'NO </main> found: {path}')

print('Done!')