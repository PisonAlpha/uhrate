import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateId } from '@/lib/hasher';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadCertificateToIPFS } from '@/lib/ipfs';
import { getChainById } from '@/lib/registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      institutionName,
      institutionEmail,
      studentName,
      studentEmail,
      degreeType,
      fieldOfStudy,
      graduationYear,
      certificateNumber,
      chainId,
      txHash,
    } = body;

    if (!institutionName || !institutionEmail || !studentName || !studentEmail || !degreeType || !fieldOfStudy || !graduationYear || !chainId || !txHash) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const registryId = generateCertificateId().replace('UHRATE', 'UEDU');
    const chain = getChainById(chainId);

    const certData = {
      platform: 'UHRATE Education Registry',
      registry_id: registryId,
      institution_name: institutionName,
      student_name: studentName,
      degree_type: degreeType,
      field_of_study: fieldOfStudy,
      graduation_year: graduationYear,
      certificate_number: certificateNumber || null,
      chain: chain?.name,
      tx_hash: txHash,
      issued_at: new Date().toISOString(),
    };

    const ipfsResult = await uploadCertificateToIPFS(certData, registryId);

    const { data, error } = await supabaseAdmin
      .from('education_registry')
      .insert({
        registry_id: registryId,
        institution_name: institutionName,
        institution_email: institutionEmail,
        student_name: studentName,
        student_email: studentEmail,
        degree_type: degreeType,
        field_of_study: fieldOfStudy,
        graduation_year: graduationYear,
        certificate_number: certificateNumber || null,
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
    console.error('Education register error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}