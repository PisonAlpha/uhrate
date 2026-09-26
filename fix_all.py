import re

# ── Fix 1: lib/sealer.ts — improve EXIF reading ──
content = open('lib/sealer.ts', 'r', encoding='utf-8').read()

# Find and replace the readSealFromImage function entirely
old_fn = re.search(
    r'// Read UHRATE seal from image EXIF\nexport async function readSealFromImage.*?^}',
    content, re.DOTALL | re.MULTILINE
)

new_fn = '''// Read UHRATE seal from image EXIF
export async function readSealFromImage(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Search for certificate ID pattern in multiple encodings
    const searchForCert = (str: string): string | null => {
      // Direct UHRATE certificate ID pattern
      const direct = str.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
      if (direct) return direct[0];
      // UHRATE-SEAL: prefix
      const sealed = str.match(/UHRATE-SEAL:(UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8})/);
      if (sealed) return sealed[1];
      // JSON certificate_id field
      const json = str.match(/"certificate_id":"(UHRATE-[A-Z0-9-]+)"/);
      if (json) return json[1];
      return null;
    };

    // Try latin1 (most reliable for raw EXIF bytes)
    const latin1Result = searchForCert(exif.toString('latin1'));
    if (latin1Result) return latin1Result;

    // Try utf8
    const utf8Result = searchForCert(exif.toString('utf8'));
    if (utf8Result) return utf8Result;

    // Try hex — find ASCII bytes of "UHRATE-"
    const hexStr = exif.toString('hex');
    const uhrateHex = Buffer.from('UHRATE-', 'ascii').toString('hex');
    const hexIdx = hexStr.indexOf(uhrateHex);
    if (hexIdx >= 0) {
      const startByte = Math.floor(hexIdx / 2);
      const chunk = exif.slice(startByte, startByte + 30).toString('ascii');
      const certFromHex = chunk.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
      if (certFromHex) return certFromHex[0];
    }

    return null;
  } catch {
    return null;
  }
}'''

if old_fn:
    content = content[:old_fn.start()] + new_fn + content[old_fn.end():]
    print('FIXED: readSealFromImage')
else:
    print('NOT FOUND: readSealFromImage')

# Fix EXIF embedding — add more fields
old_exif = '''    let processedImage = image.withExif({
      IFD0: {
        ImageDescription: `UHRATE-SEAL:${options.certificateId}`,'''

new_exif = '''    let processedImage = image.withExif({
      IFD0: {
        ImageDescription: `UHRATE-SEAL:${options.certificateId}`,
        Make: 'UHRATE',
        Model: options.certificateId,'''

if old_exif in content:
    content = content.replace(old_exif, new_exif)
    print('FIXED: EXIF embedding')
else:
    print('NOT FOUND: EXIF embedding')

open('lib/sealer.ts', 'w', encoding='utf-8').write(content)
print('sealer.ts saved!')

# ── Fix 2: tokenomics — already updated, just verify ──
tok = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()
if 'Angel Round' in tok:
    print('Tokenomics: Angel Round already present')
else:
    print('Tokenomics: Angel Round NOT found — needs manual fix')

print('All done!')