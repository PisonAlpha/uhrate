content = open('lib/sealer.ts', 'r', encoding='utf-8').read()

old = '''    // Convert EXIF buffer to string and search broadly
    const exifStr = exif.toString('latin1');
    
    // Try to find certificate ID directly (UHRATE-XXXXXXXX-XXXXXXXX pattern)
    const certMatch = exifStr.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
    if (certMatch) {
      return certMatch[0];
    }

    // Try JSON parse approach
    const jsonMatch = exifStr.match(/\\{"platform":"UHRATE"[\\s\\S]*?"certificate_id":"(UHRATE-[^"]+)"/);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    // Try UTF-8 as fallback
    const exifUtf8 = exif.toString('utf8');
    const certMatchUtf8 = exifUtf8.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
    if (certMatchUtf8) {
      return certMatchUtf8[0];
    }

    return null;'''

new = '''    // Search EXIF buffer in multiple encodings for the certificate ID
    const searchForCert = (str: string): string | null => {
      // Direct certificate ID pattern
      const direct = str.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
      if (direct) return direct[0];
      // UHRATE-SEAL: prefix pattern
      const sealed = str.match(/UHRATE-SEAL:(UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8})/);
      if (sealed) return sealed[1];
      // JSON certificate_id field
      const json = str.match(/"certificate_id":"(UHRATE-[^"]+)"/);
      if (json) return json[1];
      return null;
    };

    // Try latin1 (most reliable for binary EXIF)
    const latin1Result = searchForCert(exif.toString('latin1'));
    if (latin1Result) return latin1Result;

    // Try utf8
    const utf8Result = searchForCert(exif.toString('utf8'));
    if (utf8Result) return utf8Result;

    // Try hex search for ASCII certificate ID bytes
    const hexStr = exif.toString('hex');
    const asciiCert = Buffer.from('UHRATE-', 'ascii').toString('hex');
    const hexIdx = hexStr.indexOf(asciiCert);
    if (hexIdx >= 0) {
      const startByte = hexIdx / 2;
      const chunk = exif.slice(startByte, startByte + 30).toString('ascii');
      const certFromHex = chunk.match(/UHRATE-[A-Z0-9]{8}-[A-Z0-9]{8}/);
      if (certFromHex) return certFromHex[0];
    }

    return null;'''

if old in content:
    content = content.replace(old, new)
    print('REPLACED: readSealFromImage search')
else:
    print('NOT FOUND')

open('lib/sealer.ts', 'w', encoding='utf-8').write(content)
print('Done!')