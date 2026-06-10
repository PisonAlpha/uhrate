import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registryId, studentName, institutionName } = body;

    if (!registryId && !studentName) {
      return NextResponse.json(
        { error: 'Provide a registry ID or student name' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('education_registry')
      .select('*');

    if (registryId) {
      query = query.eq('registry_id', registryId.trim());
    } else if (studentName && institutionName) {
      query = query
        .ilike('student_name', '%' + studentName + '%')
        .ilike('institution_name', '%' + institutionName + '%');
    } else if (studentName) {
      query = query.ilike('student_name', '%' + studentName + '%');
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'No educational credentials found.',
      });
    }

    return NextResponse.json({
      found: true,
      count: data.length,
      credentials: data.map(d => ({
        registry_id: d.registry_id,
        institution_name: d.institution_name,
        student_name: d.student_name,
        degree_type: d.degree_type,
        field_of_study: d.field_of_study,
        graduation_year: d.graduation_year,
        certificate_number: d.certificate_number,
        chain_name: d.chain_name,
        tx_hash: d.tx_hash,
        ipfs_hash: d.ipfs_hash,
        is_valid: d.is_valid,
        issued_at: d.created_at,
      })),
    });
  } catch (error) {
    console.error('Education verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}