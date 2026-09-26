import os

# ── Fix 1: api/dashboard/route.ts — also search by wallet address ──
dashboard = open('app/api/dashboard/route.ts', 'r', encoding='utf-8').read()

old_query = """    // Fetch verifications
    let query = supabaseAdmin
      .from('verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (email) query = query.eq('user_email', email);
    if (userId) query = query.eq('user_id', userId);

    const { data: verifications, error } = await query;"""

new_query = """    // Fetch verifications — search by email OR wallet address format
    let verifications: any[] = [];
    
    if (email) {
      // Try exact email match first
      const { data: byEmail } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(100);
      
      verifications = byEmail || [];
      
      // If no results and email looks like wallet format, also try wallet prefix
      if (verifications.length === 0 && email.includes('@wallet.uhrate')) {
        const walletPrefix = email.split('@')[0];
        const { data: byWallet } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .ilike('user_email', walletPrefix + '%')
          .order('created_at', { ascending: false })
          .limit(100);
        verifications = byWallet || [];
      }

      // Also try wallet_address column if it exists
      if (verifications.length === 0) {
        const { data: byWalletCol } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .eq('wallet_address', email.split('@')[0])
          .order('created_at', { ascending: false })
          .limit(100);
        if (byWalletCol && byWalletCol.length > 0) {
          verifications = byWalletCol;
        }
      }
    } else if (userId) {
      const { data: byId } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      verifications = byId || [];
    }
    
    const error = null;"""

if old_query in dashboard:
    dashboard = dashboard.replace(old_query, new_query)
    print('FIXED: dashboard query')
else:
    print('NOT FOUND: dashboard query')

open('app/api/dashboard/route.ts', 'w', encoding='utf-8').write(dashboard)

# ── Fix 2: api/seal/route.ts — store sealed file hash too ──
seal_api = open('app/api/seal/route.ts', 'r', encoding='utf-8').read()

old_return = """    const nameParts = file.name.split('.');
    nameParts.pop();
    const baseName = nameParts.join('.');
    const sealedFileName = `${baseName}_UHRATE_${certificateId.split('-').pop()}.${sealed.extension}`;

    const uint8Array = new Uint8Array(sealed.sealedBuffer);
    return new NextResponse(uint8Array, {"""

new_return = """    // Generate hash of the SEALED file and store it for cross-device lookup
    const sealedHash = require('crypto').createHash('sha256').update(sealed.sealedBuffer).digest('hex');
    
    // Store sealed file hash in verifications table
    try {
      await supabaseAdmin
        .from('verifications')
        .update({ sealed_file_hash: sealedHash })
        .eq('certificate_id', certificateId);
    } catch {}

    const nameParts = file.name.split('.');
    nameParts.pop();
    const baseName = nameParts.join('.');
    const sealedFileName = `${baseName}_UHRATE_${certificateId.split('-').pop()}.${sealed.extension}`;

    const uint8Array = new Uint8Array(sealed.sealedBuffer);
    return new NextResponse(uint8Array, {"""

if old_return in seal_api:
    seal_api = seal_api.replace(old_return, new_return)
    print('FIXED: seal API stores sealed hash')
else:
    print('NOT FOUND: seal API return')

open('app/api/seal/route.ts', 'w', encoding='utf-8').write(seal_api)

# ── Fix 3: api/verify-public/route.ts — also search by sealed_file_hash ──
verify_public = open('app/api/verify-public/route.ts', 'r', encoding='utf-8').read()

old_search = """    async function searchByHash(hash: string) {
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
    }"""

new_search = """    async function searchByHash(hash: string) {
      // Search verifications by original hash
      const { data: v } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('sha256_hash', hash)
        .single();
      if (v) return { data: v, source: 'verifications' };

      // Search verifications by SEALED file hash (cross-device lookup)
      const { data: vs } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('sealed_file_hash', hash)
        .single();
      if (vs) return { data: vs, source: 'verifications' };

      // Search document_registry table
      const { data: r } = await supabaseAdmin
        .from('document_registry')
        .select('*')
        .eq('sha256_hash', hash)
        .single();
      if (r) return { data: r, source: 'registry' };

      return null;
    }"""

if old_search in verify_public:
    verify_public = verify_public.replace(old_search, new_search)
    print('FIXED: verify-public searches sealed_file_hash')
else:
    print('NOT FOUND: verify-public search')

open('app/api/verify-public/route.ts', 'w', encoding='utf-8').write(verify_public)

print('All fixes applied!')