content = open('app/analytics/page.tsx', 'r', encoding='utf-8').read()

old = 'src="https://datastudio.google.com/embed/reporting/6fab452f-0a7e-4b0f-85bb-ba0eec278fad/page/p_xyz"'
new = 'src="https://datastudio.google.com/embed/reporting/6fab452f-0a7e-4b0f-85bb-ba0eec278fad/page/lOt9F"'

if old in content:
    content = content.replace(old, new)
    print('FIXED: embed URL')
else:
    print('NOT FOUND')

open('app/analytics/page.tsx', 'w', encoding='utf-8').write(content)
print('Done!')