'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

export default function RegistryLookup() {
  const [activeTab, setActiveTab] = useState<'file' | 'id' | 'hash'>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [registryId, setRegistryId] = useState('');
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

      const response = await fetch('/api/registry/lookup', {
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

  const lookupById = async () => {
    if (!registryId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/registry/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registryId }),
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
      const response = await fetch('/api/registry/lookup', {
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

  const chain = result?.registry
    ? SUPPORTED_CHAINS.find(c => c.name === result.registry.chain_name)
    : null;

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/registry'}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Register Document
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Document Registry Lookup
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Check if a document is registered on UHRATE and verify its authenticity.
            Upload the file, enter a registry ID, or paste the SHA-256 hash.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <div className="flex gap-2 mb-8">
            {[
              { key: 'file', label: 'Upload Document' },
              { key: 'id', label: 'Registry ID' },
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
                  <p className="text-gray-600">Checking document registry...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Drop document to check registry</p>
                    <p className="text-sm text-gray-400 mt-1">We'll compute the hash and check our records</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'id' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={registryId}
                onChange={e => setRegistryId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupById()}
                placeholder="e.g. UREG-MQ6MDXRB-CC2C2DF2"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={lookupById}
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Lookup'}
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
                placeholder="SHA-256 hash of the document"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
              />
              <button
                onClick={lookupByHash}
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Lookup'}
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✗</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Not Registered</h3>
            <p className="text-gray-500 text-sm mb-6">{result.message}</p>
            <button
              onClick={() => window.location.href = '/registry'}
              className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Register this document
            </button>
          </div>
        )}

        {result && result.found && result.registry && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">Document Registered</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    This document has a verified blockchain identity on {result.registry.chain_name}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ✓ Original
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Document</p>
                  <p className="font-medium text-gray-900">{result.registry.file_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{result.registry.file_type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Owner</p>
                  <p className="font-medium text-gray-900">{result.registry.owner_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Document Type</p>
                  <p className="font-medium text-gray-900 capitalize">{result.registry.document_type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Registered</p>
                  <p className="font-medium text-gray-900">
                    {new Date(result.registry.registered_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Registry ID</p>
                <p className="font-mono text-sm text-blue-600">{result.registry.registry_id}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">SHA-256 Hash</p>
                <p className="font-mono text-xs text-gray-700 break-all">{result.registry.sha256_hash}</p>
              </div>

              {result.registry.tx_hash && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Blockchain Transaction</p>
                  <p
                    onClick={() => window.open((chain?.explorer || 'https://bscscan.com') + '/tx/' + result.registry.tx_hash, '_blank')}
                    className="font-mono text-xs text-blue-600 break-all cursor-pointer hover:underline"
                  >
                    {result.registry.tx_hash}
                  </p>
                </div>
              )}

              {result.registry.ipfs_hash && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">IPFS</p>
                  <p
                    onClick={() => window.open('https://gateway.pinata.cloud/ipfs/' + result.registry.ipfs_hash, '_blank')}
                    className="font-mono text-xs text-blue-600 break-all cursor-pointer hover:underline"
                  >
                    {result.registry.ipfs_hash}
                  </p>
                </div>
              )}

              {result.registry.metadata && Object.keys(result.registry.metadata).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-3">Additional Metadata</p>
                  <div className="space-y-2">
                    {Object.entries(result.registry.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-900">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}