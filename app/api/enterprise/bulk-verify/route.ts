import { NextRequest, NextResponse } from 'next/server';
import { generateDigitalDNA, generateCertificateId } from '@/lib/hasher';
import { analyzeFile } from '@/lib/deepfake';
import { saveVerification, getVerificationByHash } from '@/lib/supabase';
import { registerOnBlockchain } from '@/lib/blockchain';
import { uploadCertificateToIPFS } from '@/lib/ipfs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 files per bulk verification' },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const dna = generateDigitalDNA(buffer, file.name, file.type);

        const existing = await getVerificationByHash(dna.sha256);
        if (existing) {
          results.push({
            file_name: file.name,
            success: true,
            cached: true,
            data: existing,
          });
          continue;
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
          sha256_hash: dna.sha256,
          rating: analysis.rating,
          trust_score: analysis.trust_score,
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

        results.push({
          file_name: file.name,
          success: true,
          cached: false,
          data: verification,
          analysis,
        });
      } catch (fileError) {
        results.push({
          file_name: file.name,
          success: false,
          error: 'Failed to verify this file',
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: files.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error('Bulk verify error:', error);
    return NextResponse.json(
      { error: 'Bulk verification failed.' },
      { status: 500 }
    );
  }
}