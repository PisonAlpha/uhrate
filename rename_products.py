import os
import glob

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('app/**/*.ts', recursive=True)

replacements = [
    ('🧬 Deep Scan', '✅ Verify'),
    ('Deep Scan', 'Verify'),
    ('deep scan', 'verify'),
    ('deep-scan', 'verify'),
    ('🔏 Seal Your File', '🔏 Seal'),
    ('Seal Your File', 'Seal'),
    ('seal your file', 'seal'),
]

for path in files:
    try:
        content = open(path, 'r', encoding='utf-8').read()
        new_content = content
        for old, new in replacements:
            new_content = new_content.replace(old, new)
        if new_content != content:
            open(path, 'w', encoding='utf-8').write(new_content)
            print(f'UPDATED: {path}')
    except Exception as e:
        print(f'ERROR: {path} — {e}')

print('Done!')