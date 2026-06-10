import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registryId, journalistName, contentTitle, sha256Hash } = body;

    if (!registryId && !journalistName && !contentTitle && !sha256Hash) {
      return NextResponse.json(
        { error: 'Provide a registry ID, journalist name, content title, or hash' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('media_registry').select('*');

    if (registryId) {
      query = query.eq('registry_id', registryId.trim());
    } else if (sha256Hash) {
      query = query.eq('sha256_hash', sha256Hash.trim());
    } else if (contentTitle) {
      query = query.ilike('content_title', '%' + contentTitle + '%');
    } else if (journalistName) {
      query = query.ilike('journalist_name', '%' + journalistName + '%');
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'No media content found in registry.',
      });
    }

    return NextResponse.json({
      found: true,
      count: data.length,
      media: data.map(d => ({
        registry_id: d.registry_id,
        journalist_name: d.journalist_name,
        media_organization: d.media_organization,
        content_title: d.content_title,
        content_type: d.content_type,
        capture_date: d.capture_date,
        location: d.location,
        description: d.description,
        chain_name: d.chain_name,
        tx_hash: d.tx_hash,
        ipfs_hash: d.ipfs_hash,
        sha256_hash: d.sha256_hash,
        is_verified: d.is_verified,
        registered_at: d.created_at,
      })),
    });
  } catch (error) {
    console.error('Media verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}