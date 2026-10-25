import re

content = open('lib/sealer.ts', 'r', encoding='utf-8').read()

old = '''    let processedImage = image.withExif({
      IFD0: {
        ImageDescription: `UHRATE Sealed — Certificate: ${options.certificateId}`,
        Copyright: `UHRATE Decentralized Authenticity Network — ${options.certificateId}`,
        Software: 'UHRATE Seal v1.0',
        Artist: sealComment,
      },
    });'''

new = '''    // Embed certificate ID in multiple EXIF fields for maximum compatibility
    let processedImage = image.withExif({
      IFD0: {
        ImageDescription: `UHRATE-SEAL:${options.certificateId}`,
        Copyright: `UHRATE Decentralized Authenticity Network — ${options.certificateId}`,
        Software: `UHRATE Seal v1.0 | ${options.certificateId}`,
        Artist: sealComment,
        Make: `UHRATE`,
        Model: options.certificateId,
      },
    });'''

if old in content:
    content = content.replace(old, new)
    print('REPLACED: EXIF embedding')
else:
    print('NOT FOUND - checking...')
    idx = content.find('withExif')
    print(f'withExif found at: {idx}')
    print(content[idx:idx+300])

open('lib/sealer.ts', 'w', encoding='utf-8').write(content)
print('Done!')