'use client';

import { useState } from 'react';

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

export default function CertificateCard() {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    if (!certificateId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/certificate?id=${certificateId.trim()}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Certificate not found');
      setResult(data.certificate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Verify by Certificate ID</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={certificateId}
            onChange={e => setCertificateId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="Enter certificate ID e.g. UHRATE-ABC123-DEF4"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Verify'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{result.file_name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {result.file_type} · {(result.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingStyle(result.rating)}`}>
              {result.rating}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Originality', value: result.originality_score },
              { label: 'AI Probability', value: result.ai_score },
              { label: 'Deepfake Risk', value: result.deepfake_score },
              { label: 'Trust Score', value: result.trust_score },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Certificate ID</span>
              <span className="font-mono text-blue-600">{result.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Blockchain</span>
              <span className="font-medium">{result.blockchain_chain}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Issued</span>
              <span className="font-medium">
                {new Date(result.issued_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-medium">
                {result.is_valid ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-1">SHA-256 Hash</p>
            <p className="font-mono text-xs text-gray-700 break-all">{result.sha256_hash}</p>
          </div>
        </div>
      )}
    </div>
  );
}