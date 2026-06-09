'use client';

import { useEffect, useState } from 'react';

function getRatingStyle(rating: string) {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return 'bg-green-100 text-green-800';
    case 'Mixed Content':
    case 'AI Assisted':
      return 'bg-amber-100 text-amber-800';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getTrustColor(score: number) {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export default function Dashboard() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    aiGenerated: 0,
    highRisk: 0,
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVerifications(data.verifications);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">UH</span>
              </div>
              <span className="font-semibold text-gray-900">UHRATE</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Dashboard</span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Verify File
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Verification Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">All files verified through UHRATE</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Verified', value: stats.total, color: 'text-gray-900' },
            { label: 'Verified Original', value: stats.verified, color: 'text-green-600' },
            { label: 'AI Generated', value: stats.aiGenerated, color: 'text-amber-600' },
            { label: 'High Risk', value: stats.highRisk, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading verifications...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && verifications.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-4">No verifications yet.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Verify your first file
            </button>
          </div>
        )}

        {!loading && verifications.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">File</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Rating</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Trust</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Certificate</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Blockchain</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v, i) => (
                    <tr
                      key={v.id}
                      className={"border-b border-gray-50 hover:bg-gray-50 transition-colors " + (i === verifications.length - 1 ? 'border-0' : '')}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 max-w-48 truncate">{v.file_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{v.file_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(v.rating)}>
                          {v.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"text-sm font-bold " + getTrustColor(v.trust_score)}>
                          {v.trust_score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-600">{v.certificate_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        {v.blockchain_tx ? (
                          <p
                            onClick={() => window.open("https://testnet.bscscan.com/tx/" + v.blockchain_tx, '_blank')}
                            className="font-mono text-xs text-blue-600 hover:underline cursor-pointer max-w-32 truncate"
                          >
                            {v.blockchain_tx}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(v.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}