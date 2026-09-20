files = ['app/components/Nav.tsx', 'app/page.tsx']

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    content = content.replace(
        '          \n            key={i}\n            href={partner.url}',
        '          <a\n            key={i}\n            href={partner.url}'
    )
    open(path, 'w', encoding='utf-8').write(content)
    print(f'FIXED: {path}')

print('Done!')