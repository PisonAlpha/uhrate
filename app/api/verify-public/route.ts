import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSHA256 } from '@/lib/hasher';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let verification = null;
    let source = 'verifications';

    async function searchByHash(hash: string) {
      // Search verifications table first
      const { data: v } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('sha256_hash', hash)
        .single();
      if (v) return { data: v, source: 'verifications' };

      // Search document_registry table
      const { data: r } = await supabaseAdmin
        .from('document_registry')
        .select('*')
        .eq('sha256_hash', hash)
        .single();
      if (r) return { data: r, source: 'registry' };

      return null;
    }

    async function searchByCertId(certId: string) {
      // Search verifications table
      const { data: v } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('certificate_id', certId.trim())
        .single();
      if (v) return { data: v, source: 'verifications' };

      // Search document_registry table
      const { data: r } = await supabaseAdmin
        .from('document_registry')
        .select('*')
        .eq('registry_id', certId.trim())
        .single();
      if (r) return { data: r, source: 'registry' };

      return null;
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hash = generateSHA256(buffer);

      const found = await searchByHash(hash);

      if (!found) {
        return NextResponse.json({
          found: false,
          hash,
          message: 'This file has not been sealed or verified on UHRATE. The file may have been modified or compressed — try looking up by Certificate ID instead.',
        });
      }

      verification = found.data;
      source = found.source;

    } else {
      const body = await request.json();
      const { certificateId, hash } = body;

      if (certificateId) {
        const found = await searchByCertId(certificateId);
        if (!found) {
          return NextResponse.json({ found: false, message: 'Certificate not found.' });
        }
        verification = found.data;
        source = found.source;

      } else if (hash) {
        const found = await searchByHash(hash.trim());
        if (!found) {
          return NextResponse.json({ found: false, hash, message: 'No record found for this hash.' });
        }
        verification = found.data;
        source = found.source;

      } else {
        return NextResponse.json({ error: 'Provide a certificate ID, hash, or file' }, { status: 400 });
      }
    }

    // Normalize response from either table
    const isRegistry = source === 'registry';

    return NextResponse.json({
      found: true,
      source,
      verification: {
        certificate_id: isRegistry ? verification.registry_id : verification.certificate_id,
        file_name: verification.file_name,
        file_type: isRegistry ? verification.document_type : verification.file_type,
        file_size: verification.file_size,
        sha256_hash: verification.sha256_hash,
        originality_score: verification.originality_score || null,
        ai_score: verification.ai_score || null,
        deepfake_score: verification.deepfake_score || null,
        manipulation_score: verification.manipulation_score || null,
        trust_score: verification.trust_score || null,
        rating: verification.rating || 'Registered',
        blockchain_tx: verification.blockchain_tx || verification.tx_hash || null,
        blockchain_chain: verification.blockchain_chain || verification.chain_name || null,
        verified_at: verification.created_at,
        owner_name: verification.owner_name || null,
        is_valid: true,
      },
    });

  } catch (error) {
    console.error('Public verify error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}