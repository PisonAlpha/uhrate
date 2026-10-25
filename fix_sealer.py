content = open('lib/sealer.ts', 'r', encoding='utf-8').read()

old = '''// Read UHRATE seal from image EXIF
export async function readSealFromImage(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Try to read Artist field which contains our JSON
    const exifStr = exif.toString('utf8');
    const match = exifStr.match(/\\{"platform":"UHRATE".*?\\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      return data.certificate_id || null;
    }
    return null;
  } catch {
    return null;
  }
}'''

new = '''// Read UHRATE seal from image EXIF
export async function readSealFromImage(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Convert EXIF buffer to string and search broadly
    const exifStr = exif.toString('latin1');
    
    // Try to find certificate ID directly (UHRATE-XXXXXXXX-XXXXXXXX pattern)
    const certMatch = exifStr.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
    if (certMatch) {
      return certMatch[0];
    }

    // Try JSON parse approach
    const jsonMatch = exifStr.match(/\{"platform":"UHRATE"[\s\S]*?"certificate_id":"(UHRATE-[^"]+)"/);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    // Try UTF-8 as fallback
    const exifUtf8 = exif.toString('utf8');
    const certMatchUtf8 = exifUtf8.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
    if (certMatchUtf8) {
      return certMatchUtf8[0];
    }

    return null;
  } catch {
    return null;
  }
}'''

if old.replace('\\n', '\n') in content or old in content:
    content = content.replace(old, new)
    print('REPLACED: readSealFromImage')
else:
    # Try to find and replace just the function
    import re
    content = re.sub(
        r'// Read UHRATE seal from image EXIF\nexport async function readSealFromImage[\s\S]*?^}',
        new,
        content,
        flags=re.MULTILINE
    )
    print('REGEX REPLACED: readSealFromImage')

open('lib/sealer.ts', 'w', encoding='utf-8').write(content)
print('Done!')