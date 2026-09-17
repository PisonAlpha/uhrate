'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Lookup() {
  const [activeTab, setActiveTab] = useState<'file' | 'id' | 'hash'>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [certId, setCertId] = useState('');
  const [hash, setHash] = useState('');

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const lookupByCertId = async () => {
    if (!certId.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch('/api/verify-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: certId }),
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            🔍 Free — No Account Needed
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">File Lookup</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Check if any file has been sealed on UHRATE. Upload the file, enter a certificate ID, or paste a SHA-256 hash to instantly verify its record.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {[
            { key: 'file', label: '📁 Upload File' },
            { key: 'id', label: '🏆 Certificate ID' },
            { key: 'hash', label: '#️⃣ SHA-256 Hash' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setResult(null); setError(null); }}
              className={"px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors " + (
                activeTab === tab.key ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          {activeTab === 'file' && (
            <div
              {...getRootProps()}
              className={"border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all " + (
                isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
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
                  <div className="text-4xl">🔍</div>
                  <p className="font-bold text-gray-700">Drop file to look it up</p>
                  <p className="text-sm text-gray-400">We'll check if this file has been sealed on UHRATE</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'id' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Certificate ID</label>
              <p className="text-xs text-gray-400 mb-3">Format: UHRATE-XXXXXXXX-XXXXXXXX</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupByCertId()}
                  placeholder="e.g. UHRATE-MQ6MDXRB-CC2C2DF2"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button onClick={lookupByCertId} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? '...' : 'Lookup →'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hash' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SHA-256 Hash</label>
              <p className="text-xs text-gray-400 mb-3">64-character hexadecimal string</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={hash}
                  onChange={e => setHash(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupByHash()}
                  placeholder="e.g. 009a66a4c8a8835a649676dda4b6b96b..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button onClick={lookupByHash} disabled={loading} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? '...' : 'Lookup →'}
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
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-black text-gray-900 text-xl mb-2">No Record Found</h3>
            <p className="text-gray-500 text-sm mb-6">This file has not been sealed on UHRATE yet.</p>
            {result.hash && (
              <div className="bg-gray-50 rounded-xl p-3 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1">SHA-256 of uploaded file:</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.hash}</p>
              </div>
            )}
            <button onClick={() => window.location.href = '/seal'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              🔏 Seal This File →
            </button>
          </div>
        )}

        {/* Found */}
        {result && result.found && result.verification && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🔏</div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl">File Found & Sealed</h3>
                  <p className="text-gray-500 text-sm">{result.verification.file_name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Certificate ID', value: result.verification.certificate_id, mono: true },
                { label: 'Rating', value: result.verification.rating },
                { label: 'Trust Score', value: result.verification.trust_score + '/100' },
                { label: 'Sealed At', value: new Date(result.verification.verified_at || result.verification.created_at).toLocaleString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className={"text-sm font-semibold " + (item.mono ? 'font-mono text-blue-600' : 'text-gray-900')}>{item.value}</span>
                </div>
              ))}

              {result.verification.blockchain_tx && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">⛓ Blockchain Record</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-600 truncate max-w-48">{result.verification.blockchain_tx.slice(0, 20)}...</span>
                    <a
                      href={`${SUPPORTED_CHAINS.find(c => c.id === result.verification.blockchain_chain)?.explorer}/tx/${result.verification.blockchain_tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      View on Explorer ↗
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button onClick={() => { setResult(null); setError(null); setCertId(''); setHash(''); }} className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Look Up Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        {!result && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: '📁', title: 'Upload File', desc: 'Upload the exact file — we generate its SHA-256 hash and check our registry' },
              { icon: '🏆', title: 'Certificate ID', desc: 'Every sealed file gets a unique UHRATE certificate ID you can share' },
              { icon: '#️⃣', title: 'SHA-256 Hash', desc: 'Paste the file hash directly if you have it — instant lookup' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
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