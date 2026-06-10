import { NextRequest, NextResponse } from 'next/server';
import { generateDigitalDNA, generateCertificateId } from '@/lib/hasher';
import { supabaseAdmin } from '@/lib/supabase';
import { generateDocumentData, getChainById } from '@/lib/registry';
import { uploadCertificateToIPFS } from '@/lib/ipfs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ownerName = formData.get('ownerName') as string;
    const ownerEmail = formData.get('ownerEmail') as string;
    const documentType = formData.get('documentType') as string;
    const chainId = formData.get('chainId') as string;
    const txHash = formData.get('txHash') as string;
    const metadataStr = formData.get('metadata') as string;

    if (!file || !ownerName || !ownerEmail || !documentType || !chainId || !txHash) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dna = generateDigitalDNA(buffer, file.name, file.type);

    const { data: existing } = await supabaseAdmin
      .from('document_registry')
      .select('*')
      .eq('sha256_hash', dna.sha256)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'This document is already registered.',
        existing,
      }, { status: 409 });
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    const chain = getChainById(chainId);
    const registryId = generateCertificateId().replace('UHRATE', 'UREG');

    const documentData = generateDocumentData(
      dna.sha256,
      file.name,
      file.type,
      documentType,
      ownerName,
      metadata
    );

    const ipfsData = {
      platform: 'UHRATE Document Registry',
      registry_id: registryId,
      document_type: documentType,
      file_name: file.name,
      file_type: file.type,
      sha256_hash: dna.sha256,
      perceptual_hash: dna.perceptual,
      owner_name: ownerName,
      owner_email: ownerEmail,
      chain: chain?.name,
      tx_hash: txHash,
      metadata,
      registered_at: new Date().toISOString(),
    };

    const ipfsResult = await uploadCertificateToIPFS(ipfsData, registryId);

    const { data: registry, error } = await supabaseAdmin
      .from('document_registry')
      .insert({
        registry_id: registryId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        sha256_hash: dna.sha256,
        perceptual_hash: dna.perceptual,
        owner_name: ownerName,
        owner_email: ownerEmail,
        document_type: documentType,
        chain_id: chainId,
        chain_name: chain?.name,
        tx_hash: txHash,
        ipfs_hash: ipfsResult?.ipfsHash,
        metadata: JSON.stringify(metadata),
        is_original: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      registry_id: registryId,
      sha256_hash: dna.sha256,
      chain: chain?.name,
      tx_hash: txHash,
      ipfs_hash: ipfsResult?.ipfsHash,
      ipfs_url: ipfsResult?.ipfsUrl,
      registered_at: registry.created_at,
    });
  } catch (error) {
    console.error('Registry error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}