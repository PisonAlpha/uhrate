import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSHA256 } from '@/lib/hasher';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let registry = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hash = generateSHA256(buffer);

      const { data, error } = await supabaseAdmin
        .from('document_registry')
        .select('*')
        .eq('sha256_hash', hash)
        .single();

      if (error || !data) {
        return NextResponse.json({
          found: false,
          hash,
          message: 'This document is not registered on UHRATE.',
        });
      }

      registry = data;
    } else {
      const body = await request.json();
      const { registryId, hash } = body;

      if (registryId) {
        const { data, error } = await supabaseAdmin
          .from('document_registry')
          .select('*')
          .eq('registry_id', registryId.trim())
          .single();

        if (error || !data) {
          return NextResponse.json({
            found: false,
            message: 'Registry ID not found.',
          });
        }
        registry = data;
      } else if (hash) {
        const { data, error } = await supabaseAdmin
          .from('document_registry')
          .select('*')
          .eq('sha256_hash', hash.trim())
          .single();

        if (error || !data) {
          return NextResponse.json({
            found: false,
            message: 'No registered document found for this hash.',
          });
        }
        registry = data;
      } else {
        return NextResponse.json(
          { error: 'Provide a registry ID, hash, or file' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      found: true,
      registry: {
        registry_id: registry.registry_id,
        file_name: registry.file_name,
        file_type: registry.file_type,
        owner_name: registry.owner_name,
        document_type: registry.document_type,
        chain_name: registry.chain_name,
        tx_hash: registry.tx_hash,
        ipfs_hash: registry.ipfs_hash,
        sha256_hash: registry.sha256_hash,
        is_original: registry.is_original,
        registered_at: registry.created_at,
        metadata: registry.metadata ? JSON.parse(registry.metadata) : {},
      },
    });
  } catch (error) {
    console.error('Registry lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed. Please try again.' },
      { status: 500 }
    );
  }
}