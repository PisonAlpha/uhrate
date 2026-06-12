'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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

export default function PublicVerify() {
  const [activeTab, setActiveTab] = useState<'file' | 'certificate' | 'hash'>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState('');
  const [hash, setHash] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/verify-public', {
        method: 'POST',
        body: formData,
      });

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
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const lookupByCertificate = async () => {
    if (!certificateId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

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
    setLoading(true);
    setError(null);
    setResult(null);

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm text-gray-500">Public Verification Portal</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Verify Digital Content
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Anyone can verify the authenticity of a digital file for free.
            Upload a file, enter a certificate ID, or paste a SHA-256 hash.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <div className="flex gap-2 mb-8">
            {[
              { key: 'file', label: 'Upload File' },
              { key: 'certificate', label: 'Certificate ID' },
              { key: 'hash', label: 'SHA-256 Hash' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setResult(null);
                  setError(null);
                }}
                className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (
                  activeTab === tab.key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'file' && (
            <div
              {...getRootProps()}
              className={"border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all " + (
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Checking file against UHRATE records...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Drop any file to verify</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse — max 50MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={certificateId}
                onChange={e => setCertificateId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupByCertificate()}
                placeholder="e.g. UHRATE-MQ6MDXRB-CC2C2DF2"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={lookupByCertificate}
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Verify'}
              </button>
            </div>
          )}

          {activeTab === 'hash' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={hash}
                onChange={e => setHash(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupByHash()}
                placeholder="e.g. 009a66a4c8a8835a649676dda4b6b96b7cdaa66d..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
              />
              <button
                onClick={lookupByHash}
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Verify'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-8">
            {error}
          </div>
        )}

        {result && !result.found && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">?</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Not Found</h3>
            <p className="text-gray-500 text-sm">{result.message}</p>
            {result.hash && (
              <p className="font-mono text-xs text-gray-400 mt-3 break-all">{result.hash}</p>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Verify this file on UHRATE
            </button>
          </div>
        )}

        {result && result.found && result.verification && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className={"p-6 " + (
              result.verification.rating === 'Verified Original' || result.verification.rating === 'Likely Original'
                ? 'bg-green-50 border-b border-green-100'
                : result.verification.rating === 'High Risk' || result.verification.rating === 'Deepfake Suspected'
                ? 'bg-red-50 border-b border-red-100'
                : 'bg-amber-50 border-b border-amber-100'
            )}>
              <div className="flex items-center gap-4">
                <div className={"w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold border-2 " + getRatingStyle(result.verification.rating)}>
                  {getRatingIcon(result.verification.rating)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">{result.verification.rating}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{result.verification.file_name}</p>
                </div>
                <span className={"ml-auto px-3 py-1 rounded-full text-sm font-medium border " + getRatingStyle(result.verification.rating)}>
                  Trust: {result.verification.trust_score}/100
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100">
              {[
                { label: 'Originality', value: result.verification.originality_score },
                { label: 'AI Probability', value: result.verification.ai_score },
                { label: 'Deepfake Risk', value: result.verification.deepfake_score },
                { label: 'Manipulation', value: result.verification.manipulation_score },
              ].map(item => (
                <div key={item.label} className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Certificate ID</span>
                <span className="font-mono text-blue-600">{result.verification.certificate_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">File Type</span>
                <span className="font-medium">{result.verification.file_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Blockchain</span>
                <span className="font-medium">{result.verification.blockchain_chain}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                <span className="text-gray-500">Verified At</span>
                <span className="font-medium">{new Date(result.verification.verified_at).toLocaleString()}</span>
              </div>
              {result.verification.blockchain_tx && (
                <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">Transaction</span>
                  <p
                    onClick={() => window.open("https://bscscan.com/tx/" + result.verification.blockchain_tx, '_blank')}
                    className="font-mono text-xs text-blue-600 hover:underline cursor-pointer truncate max-w-48"
                  >
                    {result.verification.blockchain_tx}
                  </p>
                </div>
              )}
              <div className="pt-2">
                <p className="text-xs text-gray-500 font-medium mb-1">SHA-256 Hash</p>
                <p className="font-mono text-xs text-gray-600 break-all">{result.verification.sha256_hash}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}