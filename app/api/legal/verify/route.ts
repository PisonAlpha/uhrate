import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registryId, documentTitle, firmName, sha256Hash } = body;

    if (!registryId && !documentTitle && !sha256Hash) {
      return NextResponse.json(
        { error: 'Provide a registry ID, document title, or SHA-256 hash' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('legal_registry').select('*');

    if (registryId) {
      query = query.eq('registry_id', registryId.trim());
    } else if (sha256Hash) {
      query = query.eq('sha256_hash', sha256Hash.trim());
    } else if (documentTitle && firmName) {
      query = query
        .ilike('document_title', '%' + documentTitle + '%')
        .ilike('firm_name', '%' + firmName + '%');
    } else if (documentTitle) {
      query = query.ilike('document_title', '%' + documentTitle + '%');
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'No legal documents found.',
      });
    }

    return NextResponse.json({
      found: true,
      count: data.length,
      documents: data.map(d => ({
        registry_id: d.registry_id,
        firm_name: d.firm_name,
        document_title: d.document_title,
        document_type: d.document_type,
        parties: d.parties,
        execution_date: d.execution_date,
        jurisdiction: d.jurisdiction,
        reference_number: d.reference_number,
        chain_name: d.chain_name,
        tx_hash: d.tx_hash,
        ipfs_hash: d.ipfs_hash,
        sha256_hash: d.sha256_hash,
        is_valid: d.is_valid,
        registered_at: d.created_at,
      })),
    });
  } catch (error) {
    console.error('Legal verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}