content = open('lib/sealer.ts', 'r', encoding='utf-8').read()

old = """      IFD0: {
        ImageDescription: `UHRATE-SEAL:${options.certificateId}`,
        Make: 'UHRATE',
        Model: options.certificateId,
        Copyright: `UHRATE Decentralized Authenticity Network — ${options.certificateId}`,
        Software: `UHRATE Seal v1.0 | ${options.certificateId}`,
        Artist: sealComment,
        Make: `UHRATE`,
        Model: options.certificateId,
      },"""

new = """      IFD0: {
        ImageDescription: `UHRATE-SEAL:${options.certificateId}`,
        Make: 'UHRATE',
        Model: options.certificateId,
        Copyright: `UHRATE Decentralized Authenticity Network — ${options.certificateId}`,
        Software: `UHRATE Seal v1.0 | ${options.certificateId}`,
        Artist: sealComment,
      },"""

if old in content:
    content = content.replace(old, new)
    print('FIXED: duplicate EXIF fields')
else:
    print('NOT FOUND - searching...')
    import re
    # Find the IFD0 block
    match = re.search(r'IFD0: \{[^}]+\}', content)
    if match:
        print(match.group())

open('lib/sealer.ts', 'w', encoding='utf-8').write(content)
print('Done!')