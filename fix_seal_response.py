content = open('app/api/seal/route.ts', 'r', encoding='utf-8').read()

old = """    return new NextResponse(sealed.sealedBuffer, {
      status: 200,
      headers: {
        'Content-Type': sealed.mimeType,
        'Content-Disposition': `attachment; filename="${sealedFileName}"`,
        'X-Certificate-ID': certificateId,
        'X-SHA256-Hash': dna.sha256,
        'X-Trust-Score': trustScore.toString(),
        'X-Rating': rating,
        'X-Seal-Method': sealed.method,
      },
    });"""

new = """    const uint8Array = new Uint8Array(sealed.sealedBuffer);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': sealed.mimeType,
        'Content-Disposition': `attachment; filename="${sealedFileName}"`,
        'X-Certificate-ID': certificateId,
        'X-SHA256-Hash': dna.sha256,
        'X-Trust-Score': trustScore.toString(),
        'X-Rating': rating,
        'X-Seal-Method': sealed.method,
      },
    });"""

content = content.replace(old, new)
open('app/api/seal/route.ts', 'w', encoding='utf-8').write(content)
print('Done!')