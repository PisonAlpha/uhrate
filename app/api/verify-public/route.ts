import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSHA256 } from '@/lib/hasher';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let verification = null;

    if (contentType.includes('multipart/form-data')) {
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
      const hash = generateSHA256(buffer);

      const { data, error } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('sha256_hash', hash)
        .single();

      if (error || !data) {
        return NextResponse.json({
          found: false,
          hash,
          message: 'This file has not been verified on UHRATE.',
        });
      }

      verification = data;
    } else {
      const body = await request.json();
      const { certificateId, hash } = body;

      if (certificateId) {
        const { data, error } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .eq('certificate_id', certificateId.trim())
          .single();

        if (error || !data) {
          return NextResponse.json({
            found: false,
            message: 'Certificate not found.',
          });
        }

        verification = data;
      } else if (hash) {
        const { data, error } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .eq('sha256_hash', hash.trim())
          .single();

        if (error || !data) {
          return NextResponse.json({
            found: false,
            hash,
            message: 'No record found for this hash.',
          });
        }

        verification = data;
      } else {
        return NextResponse.json(
          { error: 'Provide a certificate ID, hash, or file' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      found: true,
      verification: {
        certificate_id: verification.certificate_id,
        file_name: verification.file_name,
        file_type: verification.file_type,
        file_size: verification.file_size,
        sha256_hash: verification.sha256_hash,
        originality_score: verification.originality_score,
        ai_score: verification.ai_score,
        deepfake_score: verification.deepfake_score,
        manipulation_score: verification.manipulation_score,
        trust_score: verification.trust_score,
        rating: verification.rating,
        blockchain_tx: verification.blockchain_tx,
        blockchain_chain: verification.blockchain_chain,
        verified_at: verification.created_at,
        is_valid: true,
      },
    });
  } catch (error) {
    console.error('Public verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}