# Fix 1: lookup page - add blockchain tx display, better not-found message, parse data correctly
lookup = '''\'use client\';

import { useState, useCallback } from \'react\';
import { useDropzone } from \'react-dropzone\';
import { SUPPORTED_CHAINS } from \'@/lib/registry\';
import Nav from \'../components/Nav\';
import Footer from \'../components/Footer\';

export default function Lookup() {
  const [activeTab, setActiveTab] = useState<\'file\' | \'id\' | \'hash\'>(\'file\');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [certId, setCertId] = useState(\'\');
  const [hash, setHash] = useState(\'\');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append(\'file\', file);
      const response = await fetch(\'/api/verify-public\', { method: \'POST\', body: formData });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const lookupByCertId = async () => {
    if (!certId.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch(\'/api/verify-public\', {
        method: \'POST\',
        headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ certificateId: certId }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lookupByHash = async () => {
    if (!hash.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch(\'/api/verify-public\', {
        method: \'POST\',
        headers: { \'Content-Type\': \'application/json\' },
        body: JSON.stringify({ hash }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const v = result?.verification;
  const chain = v?.blockchain_chain
    ? SUPPORTED_CHAINS.find(c => c.id === v.blockchain_chain || c.name?.toLowerCase() === v.blockchain_chain?.toLowerCase())
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            Free — No Account Needed
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">File Lookup</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Check if any file has been sealed on UHRATE. Upload the file, enter a Certificate ID, or paste a SHA-256 hash.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {[
            { key: \'file\', label: \'Upload File\' },
            { key: \'id\', label: \'Certificate ID\' },
            { key: \'hash\', label: \'SHA-256 Hash\' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setResult(null); setError(null); }}
              className={"px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors " + (
                activeTab === tab.key ? \'bg-black text-white\' : \'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50\'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          {activeTab === \'file\' && (
            <div>
              <div
                {...getRootProps()}
                className={"border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all " + (
                  isDragActive ? \'border-black bg-gray-50\' : \'border-gray-200 hover:border-gray-400\'
                )}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Checking UHRATE registry...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">search</div>
                    <p className="font-bold text-gray-700">Drop file to look it up</p>
                    <p className="text-sm text-gray-400">We check if this exact file has been sealed on UHRATE</p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-semibold mb-1">Important — File Upload Lookup</p>
                <p className="text-xs text-amber-600">Upload the <strong>exact sealed file</strong> you downloaded from UHRATE. If the file was compressed by WhatsApp, Telegram, or email, the hash will change and lookup may fail. In that case, use the <strong>Certificate ID tab</strong> instead — it always works.</p>
              </div>
            </div>
          )}

          {activeTab === \'id\' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Certificate ID</label>
              <p className="text-xs text-gray-400 mb-3">Format: UHRATE-XXXXXXXX-XXXXXXXX — found on your seal certificate</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  onKeyDown={e => e.key === \'Enter\' && lookupByCertId()}
                  placeholder="e.g. UHRATE-MQ6MDXRB-CC2C2DF2"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button onClick={lookupByCertId} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? \'...\' : \'Lookup\'}
                </button>
              </div>
            </div>
          )}

          {activeTab === \'hash\' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SHA-256 Hash</label>
              <p className="text-xs text-gray-400 mb-3">64-character hexadecimal string of the original file</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={hash}
                  onChange={e => setHash(e.target.value)}
                  onKeyDown={e => e.key === \'Enter\' && lookupByHash()}
                  placeholder="e.g. 009a66a4c8a8835a..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button onClick={lookupByHash} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? \'...\' : \'Lookup\'}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
        )}

        {/* Not Found */}
        {result && !result.found && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-4xl mb-4">search</div>
            <h3 className="font-black text-gray-900 text-xl mb-2">No Record Found</h3>
            <p className="text-gray-500 text-sm mb-4">This file has not been sealed on UHRATE or its hash has changed.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-blue-700 font-bold mb-2">Try these instead:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>1. Use the <strong>Certificate ID tab</strong> — paste the ID from your seal certificate</li>
                <li>2. Use the <strong>SHA-256 Hash tab</strong> — paste the hash from your certificate JSON</li>
                <li>3. Make sure you are uploading the exact sealed file, not a compressed version</li>
              </ul>
            </div>
            {result.hash && (
              <div className="bg-gray-50 rounded-xl p-3 text-left mb-4">
                <p className="text-xs text-gray-500 mb-1">SHA-256 of uploaded file:</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.hash}</p>
              </div>
            )}
            <button onClick={() => window.location.href = \'/seal\'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              Seal This File
            </button>
          </div>
        )}

        {/* Found */}
        {result && result.found && v && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">seal</div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl">File Sealed on UHRATE</h3>
                  <p className="text-gray-500 text-sm">{v.file_name}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Certificate ID — prominent */}
              <div className="p-4 bg-black text-white rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Certificate ID</p>
                <p className="font-mono text-sm font-bold text-yellow-400 break-all">{v.certificate_id}</p>
              </div>

              {/* File details */}
              <div className="space-y-2">
                {[
                  { label: \'File Name\', value: v.file_name },
                  { label: \'Rating\', value: v.rating || \'Registered\' },
                  { label: \'Trust Score\', value: v.trust_score ? v.trust_score + \'/100\' : \'N/A\' },
                  { label: \'Sealed At\', value: new Date(v.verified_at || v.created_at).toLocaleString() },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* SHA-256 Hash */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Original File SHA-256 Hash</p>
                <p className="font-mono text-xs text-gray-700 break-all">{v.sha256_hash}</p>
              </div>

              {/* Blockchain record */}
              {v.blockchain_tx ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-900">Blockchain Record</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {v.blockchain_chain?.toUpperCase() || \'ON-CHAIN\'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs text-blue-600 break-all mb-3">{v.blockchain_tx}</p>
                  
                    href={chain ? `${chain.explorer}/tx/${v.blockchain_tx}` : `https://bscscan.com/tx/${v.blockchain_tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    View on Blockchain Explorer
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">No Blockchain Record</p>
                    <p className="text-xs text-gray-500">This file has digital identity but no on-chain record yet</p>
                  </div>
                  <button
                    onClick={() => window.location.href = \'/seal\'}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    Seal On-Chain
                  </button>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setError(null); setCertId(\'\'); setHash(\'\'); }}
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Look Up Another File
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        {!result && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: \'upload\', title: \'Upload File\', desc: \'Upload the exact sealed file — we check its hash against our registry\' },
              { icon: \'cert\', title: \'Certificate ID\', desc: \'Every sealed file gets a unique UHRATE certificate ID — most reliable method\' },
              { icon: \'hash\', title: \'SHA-256 Hash\', desc: \'Paste the file hash directly from your certificate JSON\' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
'''

open('app/lookup/page.tsx', 'w', encoding='utf-8').write(lookup)
print('FIXED: lookup page')

# Fix 2: seal page — show Certificate ID prominently after sealing
# Read current seal page
seal = open('app/seal/page.tsx', 'r', encoding='utf-8').read()

# Update the sealed success section to show cert ID prominently and blockchain tx
old_sealed = '''            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Download Your Sealed File</h3>'''

new_sealed = '''            {/* Certificate ID — show prominently */}
            <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Your Certificate ID — save this for lookup</p>
              <p className="font-mono text-lg font-black text-yellow-400 break-all mb-3">{result?.data?.certificate_id}</p>
              <p className="text-xs text-gray-400">Use this ID to verify this file from any device at uhrate.online/lookup</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Download Your Sealed File</h3>'''

if old_sealed in seal:
    seal = seal.replace(old_sealed, new_sealed)
    print('FIXED: seal page shows cert ID prominently')
else:
    print('NOT FOUND: seal sealed section')

# Also fix the blockchain tx display in sealed step
old_blockchain = '''            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Download Your Sealed File</h3>'''

# Add blockchain tx display
old_explorer = '''              <button
                onClick={() => window.open(`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`, \'_blank\')}
                className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors border-0 cursor-pointer"
              >
                View on Blockchain Explorer
              </button>'''

new_explorer = '''              <button
                onClick={() => window.open(`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`, \'_blank\')}
                className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors border-0 cursor-pointer"
              >
                View on Blockchain Explorer
              </button>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-left">
                <p className="text-xs text-gray-500 mb-1">Blockchain Transaction Hash</p>
                <p className="font-mono text-xs text-blue-600 break-all">{deployResult.txHash}</p>
              </div>'''

if old_explorer in seal:
    seal = seal.replace(old_explorer, new_explorer)
    print('FIXED: seal page shows blockchain tx hash')
else:
    print('NOT FOUND: blockchain explorer button')

open('app/seal/page.tsx', 'w', encoding='utf-8').write(seal)
print('All done!')