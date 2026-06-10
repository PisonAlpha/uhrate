import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateId } from '@/lib/hasher';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadCertificateToIPFS } from '@/lib/ipfs';
import { getChainById } from '@/lib/registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firmName,
      firmEmail,
      documentTitle,
      documentType,
      parties,
      executionDate,
      jurisdiction,
      referenceNumber,
      sha256Hash,
      chainId,
      txHash,
    } = body;

    if (!firmName || !firmEmail || !documentTitle || !documentType || !parties || !executionDate || !chainId || !txHash) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const registryId = generateCertificateId().replace('UHRATE', 'ULEG');
    const chain = getChainById(chainId);

    const certData = {
      platform: 'UHRATE Legal Registry',
      registry_id: registryId,
      firm_name: firmName,
      document_title: documentTitle,
      document_type: documentType,
      parties,
      execution_date: executionDate,
      jurisdiction: jurisdiction || null,
      reference_number: referenceNumber || null,
      sha256_hash: sha256Hash || null,
      chain: chain?.name,
      tx_hash: txHash,
      registered_at: new Date().toISOString(),
    };

    const ipfsResult = await uploadCertificateToIPFS(certData, registryId);

    const { data, error } = await supabaseAdmin
      .from('legal_registry')
      .insert({
        registry_id: registryId,
        firm_name: firmName,
        firm_email: firmEmail,
        document_title: documentTitle,
        document_type: documentType,
        parties,
        execution_date: executionDate,
        jurisdiction: jurisdiction || null,
        reference_number: referenceNumber || null,
        sha256_hash: sha256Hash || null,
        chain_id: chainId,
        chain_name: chain?.name,
        tx_hash: txHash,
        ipfs_hash: ipfsResult?.ipfsHash,
        is_valid: true,
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
    console.error('Legal register error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}