import { NextRequest, NextResponse } from 'next/server';
import { generateDigitalDNA, generateCertificateId } from '@/lib/hasher';
import { analyzeFile } from '@/lib/deepfake';
import { saveVerification, getVerificationByHash } from '@/lib/supabase';
import { registerOnBlockchain } from '@/lib/blockchain';
import { uploadCertificateToIPFS } from '@/lib/ipfs';
import { supabaseAdmin } from '@/lib/supabase';

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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const userEmail = formData.get('userEmail') as string;

    if (userEmail) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('credits, role')
        .eq('email', userEmail)
        .single();

      if (user && user.role === 'individual' && user.credits <= 0) {
        return NextResponse.json(
          { error: 'You have used all your free verifications. Please upgrade to Pro.' },
          { status: 403 }
        );
      }

      if (user && user.role === 'individual') {
        await supabaseAdmin
          .from('users')
          .update({ credits: user.credits - 1 })
          .eq('email', userEmail);
      }
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

    const analysis = await analyzeFile(
      buffer,
      file.name,
      file.type,
      dna.sha256
    );

    const certificateId = generateCertificateId();

    const blockchain = await registerOnBlockchain(
      certificateId,
      dna.sha256,
      file.name,
      analysis.rating
    );

    const certificateData = {
      platform: 'UHRATE',
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
      summary: analysis.summary,
      blockchain_tx: blockchain.txHash,
      blockchain_chain: 'BNB Testnet',
      verified_at: new Date().toISOString(),
    };

    const ipfsResult = await uploadCertificateToIPFS(
      certificateData,
      certificateId
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
      ipfs_hash: ipfsResult?.ipfsHash ?? undefined,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: verification,
      dna,
      analysis,
      blockchain,
      ipfs: ipfsResult,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}