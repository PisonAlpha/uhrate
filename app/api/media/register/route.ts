import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateId } from '@/lib/hasher';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadCertificateToIPFS } from '@/lib/ipfs';
import { getChainById } from '@/lib/registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      journalistName,
      journalistEmail,
      mediaOrganization,
      contentTitle,
      contentType,
      captureDate,
      location,
      description,
      sha256Hash,
      chainId,
      txHash,
    } = body;

    if (!journalistName || !journalistEmail || !contentTitle || !contentType || !captureDate || !chainId || !txHash) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const registryId = generateCertificateId().replace('UHRATE', 'UMED');
    const chain = getChainById(chainId);

    const certData = {
      platform: 'UHRATE Media Registry',
      registry_id: registryId,
      journalist_name: journalistName,
      media_organization: mediaOrganization || null,
      content_title: contentTitle,
      content_type: contentType,
      capture_date: captureDate,
      location: location || null,
      description: description || null,
      sha256_hash: sha256Hash || null,
      chain: chain?.name,
      tx_hash: txHash,
      registered_at: new Date().toISOString(),
    };

    const ipfsResult = await uploadCertificateToIPFS(certData, registryId);

    const { data, error } = await supabaseAdmin
      .from('media_registry')
      .insert({
        registry_id: registryId,
        journalist_name: journalistName,
        journalist_email: journalistEmail,
        media_organization: mediaOrganization || null,
        content_title: contentTitle,
        content_type: contentType,
        capture_date: captureDate,
        location: location || null,
        description: description || null,
        sha256_hash: sha256Hash || null,
        chain_id: chainId,
        chain_name: chain?.name,
        tx_hash: txHash,
        ipfs_hash: ipfsResult?.ipfsHash,
        is_verified: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      registry_id: registryId,
      chain: chain?.name,
      tx_hash: txHash,
      ipfs_hash: ipfsResult?.ipfsHash,
      ipfs_url: ipfsResult?.ipfsUrl,
    });
  } catch (error) {
    console.error('Media register error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}