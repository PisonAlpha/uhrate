import { NextRequest, NextResponse } from 'next/server';
import { generateDigitalDNA, generateCertificateId } from '@/lib/hasher';
import { analyzeWithClaude } from '@/lib/analyzer';
import { saveVerification, getVerificationByHash } from '@/lib/supabase';
import { registerOnBlockchain } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dna = generateDigitalDNA(buffer, file.name, file.type);

    const existing = await getVerificationByHash(dna.sha256);
    if (existing) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: existing,
        dna,
      });
    }

    const analysis = await analyzeWithClaude(
      file.name,
      file.type,
      file.size,
      dna.sha256
    );

    const certificateId = generateCertificateId();

    const blockchain = await registerOnBlockchain(
      certificateId,
      dna.sha256,
      file.name,
      analysis.rating
    );

    const verification = await saveVerification({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      sha256_hash: dna.sha256,
      originality_score: analysis.originality_score,
      ai_score: analysis.ai_score,
      deepfake_score: analysis.deepfake_score,
      manipulation_score: analysis.manipulation_score,
      trust_score: analysis.trust_score,
      rating: analysis.rating,
      certificate_id: certificateId,
      blockchain_tx: blockchain.txHash ?? undefined,
      blockchain_chain: 'BNB Testnet',
      ipfs_hash: undefined,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: verification,
      dna,
      analysis,
      blockchain,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}