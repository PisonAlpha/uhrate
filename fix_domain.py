import os
import glob

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('app/**/*.ts', recursive=True)

count = 0
for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    if 'uhrate.xyz' in content:
        new_content = content.replace('uhrate.xyz', 'uhrate.online')
        open(path, 'w', encoding='utf-8').write(new_content)
        print(f'FIXED: {path}')
        count += 1

print(f'Done! Fixed {count} files.')