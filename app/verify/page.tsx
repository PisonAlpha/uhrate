'use client';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

function getRatingStyle(rating: string) {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Mixed Content':
    case 'AI Assisted':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getRatingIcon(rating: string) {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return '✓';
    case 'Mixed Content':
    case 'AI Assisted':
      return '⚠';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return '✗';
    default:
      return '?';
  }
}

function getRatingBg(rating: string) {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return 'bg-green-50 border-green-100';
    case 'Mixed Content':
    case 'AI Assisted':
      return 'bg-amber-50 border-amber-100';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return 'bg-red-50 border-red-100';
    default:
      return 'bg-gray-50 border-gray-100';
  }
}

function getExplorerUrl(chain: string, txHash: string) {
  const chainData = SUPPORTED_CHAINS.find(c =>
    c.id === chain || c.name.toLowerCase() === chain?.toLowerCase()
  );
  if (!chainData || !txHash) return null;
  return `${chainData.explorer}/tx/${txHash}`;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-bold text-gray-700">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function PublicVerify() {
  const [activeTab, setActiveTab] = useState<'file' | 'certificate' | 'hash'>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState('');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/verify-public', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1, maxSize: 50 * 1024 * 1024,
  });

  const lookupByCertificate = async () => {
    if (!certificateId.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch('/api/verify-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
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
      const response = await fetch('/api/verify-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async () => {
    if (batchFiles.length === 0) return;
    setBatchLoading(true);
    setBatchResults([]);
    const results = [];
    for (const file of batchFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/verify-public', { method: 'POST', body: formData });
        const data = await response.json();
        results.push({ file: file.name, ...data });
      } catch {
        results.push({ file: file.name, found: false, error: 'Failed to verify' });
      }
    }
    setBatchResults(results);
    setBatchLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVerification = (v: any) => {
    const text = `I verified "${v.file_name}" on UHRATE.\n\nRating: ${v.rating}\nTrust Score: ${v.trust_score}/100\nCertificate: ${v.certificate_id}\n\nVerify at: https://uhrate.xyz/verify`;
    if (navigator.share) {
      navigator.share({ title: 'UHRATE Verification', text });
    } else {
      copyToClipboard(text);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-4">
            ✓ Free public verification — no account required
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Verify Any Document
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Check authenticity against UHRATE's blockchain registry. Upload a file, enter a certificate ID, or paste a SHA-256 hash.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <span className="text-xs text-gray-400">Verified on:</span>
          {SUPPORTED_CHAINS.map(chain => (
            <span key={chain.id} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
              {chain.icon} {chain.name}
            </span>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { key: 'file', label: '📄 Upload File' },
              { key: 'certificate', label: '🏆 Certificate ID' },
              { key: 'hash', label: '#️⃣ SHA-256 Hash' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setResult(null); setError(null); }}
                className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (
                  activeTab === tab.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'file' && (
            <div>
              <div
                {...getRootProps()}
                className={"border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all " + (
                  isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                )}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Checking against UHRATE registry...</p>
                    <p className="text-xs text-gray-400">Generating digital DNA fingerprint</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                    <div>
                      <p className="font-bold text-gray-700 text-lg">Drop any file to verify</p>
                      <p className="text-sm text-gray-400 mt-1">or click to browse — supports all file types, max 50MB</p>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                      {['PDF', 'DOCX', 'JPG', 'PNG', 'MP4', 'ZIP', 'Any file'].map(t => (
                        <span key={t} className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">📦 Batch Verification — Verify multiple files at once</p>
                <input
                  type="file"
                  multiple
                  onChange={e => setBatchFiles(Array.from(e.target.files || []))}
                  className="text-sm text-gray-500 mb-3 w-full"
                />
                {batchFiles.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{batchFiles.length} file{batchFiles.length > 1 ? 's' : ''} selected</p>
                    <button
                      onClick={handleBatchVerify}
                      disabled={batchLoading}
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {batchLoading ? 'Verifying...' : 'Verify All'}
                    </button>
                  </div>
                )}
                {batchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {batchResults.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <p className="text-sm text-gray-700 truncate max-w-48">{r.file}</p>
                        {r.found ? (
                          <span className={"px-2 py-1 rounded-full text-xs font-medium border " + getRatingStyle(r.verification?.rating)}>
                            {r.verification?.rating}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Not found</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'certificate' && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Enter the certificate ID from your UHRATE verification certificate</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={certificateId}
                  onChange={e => setCertificateId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupByCertificate()}
                  placeholder="e.g. UHRATE-MQ6MDXRB-CC2C2DF2"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
                <button onClick={lookupByCertificate} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                  {loading ? 'Checking...' : 'Verify →'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Certificate IDs follow the format: UHRATE-XXXXXXXX-XXXXXXXX</p>
            </div>
          )}

          {activeTab === 'hash' && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Enter the SHA-256 hash of the file you want to verify</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={hash}
                  onChange={e => setHash(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupByHash()}
                  placeholder="e.g. 009a66a4c8a8835a649676dda4b6b96b7cdaa66d..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
                <button onClick={lookupByHash} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                  {loading ? 'Checking...' : 'Verify →'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">SHA-256 is a 64-character hexadecimal string</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6 flex items-center gap-3">
            <span className="text-xl">✗</span>
            {error}
          </div>
        )}

        {result && !result.found && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">No Record Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-2">{result.message}</p>
            <p className="text-xs text-gray-400 mb-6">This file has not been verified on UHRATE, or the hash/certificate ID may be incorrect.</p>
            {result.hash && (
              <div className="bg-gray-50 rounded-xl p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">SHA-256 of uploaded file:</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.hash}</p>
              </div>
            )}
            <button onClick={() => window.location.href = '/register'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Verify & Register this file →
            </button>
          </div>
        )}

        {result && result.found && result.verification && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className={"p-6 border-b " + getRatingBg(result.verification.rating)}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={"w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black border-2 " + getRatingStyle(result.verification.rating)}>
                  {getRatingIcon(result.verification.rating)}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-2xl">{result.verification.rating}</h3>
                  <p className="text-gray-500 text-sm mt-0.5 truncate max-w-xs">{result.verification.file_name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareVerification(result.verification)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    {copied ? '✓ Copied!' : '↗ Share'}
                  </button>
                  <div className={"px-4 py-2 rounded-xl text-sm font-bold border " + getRatingStyle(result.verification.rating)}>
                    Trust: {result.verification.trust_score}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Confidence Scores</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ScoreBar label="Originality Score" value={result.verification.originality_score} color="bg-green-500" />
                <ScoreBar label="AI Probability" value={result.verification.ai_score} color="bg-amber-500" />
                <ScoreBar label="Deepfake Risk" value={result.verification.deepfake_score} color="bg-red-500" />
                <ScoreBar label="Manipulation Score" value={result.verification.manipulation_score} color="bg-blue-500" />
              </div>
            </div>

            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Verification Details</p>
              <div className="space-y-3">
                {[
                  { label: 'Certificate ID', value: result.verification.certificate_id, mono: true, copyable: true },
                  { label: 'File Type', value: result.verification.file_type },
                  { label: 'File Size', value: result.verification.file_size ? (result.verification.file_size / 1024).toFixed(1) + ' KB' : '—' },
                  { label: 'Verified At', value: new Date(result.verification.verified_at || result.verification.created_at).toLocaleString() },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={"text-sm font-medium " + (item.mono ? 'font-mono text-blue-600' : 'text-gray-900')}>
                        {item.value}
                      </span>
                      {item.copyable && (
                        <button onClick={() => copyToClipboard(item.value)} className="text-gray-400 hover:text-gray-600 text-xs bg-transparent border-0 cursor-pointer">
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(result.verification.blockchain_tx || result.verification.blockchain_chain) && (
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">⛓ Blockchain Record</p>
                <div className="space-y-3">
                  {result.verification.blockchain_chain && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Network</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {SUPPORTED_CHAINS.find(c => c.id === result.verification.blockchain_chain)?.name || result.verification.blockchain_chain}
                      </span>
                    </div>
                  )}
                  {result.verification.blockchain_tx && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500">Transaction</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-600 truncate max-w-32">
                          {result.verification.blockchain_tx.slice(0, 16)}...
                        </span>
                        {getExplorerUrl(result.verification.blockchain_chain, result.verification.blockchain_tx) && (<a
                          href={getExplorerUrl(result.verification.blockchain_chain, result.verification.blockchain_tx)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          View on Explorer ↗
                        </a>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SHA-256 Digital Fingerprint</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <p className="font-mono text-xs text-gray-600 break-all flex-1">{result.verification.sha256_hash}</p>
                <button onClick={() => copyToClipboard(result.verification.sha256_hash)} className="text-gray-400 hover:text-gray-600 text-xs bg-transparent border-0 cursor-pointer flex-shrink-0">
                  📋
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-sm text-gray-500">Want to verify and register your own documents?</p>
              <div className="flex gap-3">
                <button onClick={() => { setResult(null); setError(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-white transition-colors">
                  Verify Another
                </button>
                <button onClick={() => window.location.href = '/register'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                  Create Free Account →
                </button>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📄', title: 'Upload or Enter', desc: 'Drop a file, paste a certificate ID, or enter a SHA-256 hash to start verification.' },
              { icon: '🔍', title: 'Instant Check', desc: 'UHRATE generates a digital fingerprint and checks it against our blockchain registry in seconds.' },
              { icon: '✓', title: 'Get the Truth', desc: 'See the authenticity rating, confidence scores, and full blockchain proof of the document.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-gray-900 mb-2">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}