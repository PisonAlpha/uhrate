content = '''import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateDigitalDNA, generateCertificateId } from '@/lib/hasher';
import { analyzeFile } from '@/lib/deepfake';
import { sealFile } from '@/lib/sealer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const watermark = formData.get('watermark') === 'true';
    const userEmail = formData.get('userEmail') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dna = generateDigitalDNA(buffer, file.name, file.type);

    const { data: existing } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('sha256_hash', dna.sha256)
      .single();

    let certificateId: string;
    let trustScore: number;
    let rating: string;

    if (existing) {
      certificateId = existing.certificate_id;
      trustScore = existing.trust_score;
      rating = existing.rating;
    } else {
      const analysis = await analyzeFile(buffer, file.name, file.type, dna.sha256);
      certificateId = generateCertificateId();
      trustScore = analysis.trust_score;
      rating = analysis.rating;

      await supabaseAdmin.from('verifications').insert({
        certificate_id: certificateId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        sha256_hash: dna.sha256,
        perceptual_hash: dna.perceptual,
        originality_score: analysis.originality_score,
        ai_score: analysis.ai_score,
        deepfake_score: analysis.deepfake_score,
        manipulation_score: analysis.manipulation_score,
        trust_score: analysis.trust_score,
        rating: analysis.rating,
        user_email: userEmail || null,
      });
    }

    const sealed = await sealFile(buffer, file.type, file.name, {
      certificateId,
      sha256Hash: dna.sha256,
      rating,
      trustScore,
      watermark,
    });

    const nameParts = file.name.split('.');
    nameParts.pop();
    const baseName = nameParts.join('.');
    const sealedFileName = `${baseName}_UHRATE_${certificateId.split('-').pop()}.${sealed.extension}`;

    return new NextResponse(sealed.sealedBuffer, {
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
    });

  } catch (error) {
    console.error('Seal API error:', error);
    return NextResponse.json({ error: 'Sealing failed. Please try again.' }, { status: 500 });
  }
}
'''

open('app/api/seal/route.ts', 'w', encoding='utf-8').write(content)
print('Done!')