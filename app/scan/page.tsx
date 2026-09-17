'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

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

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function DeepScan() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setProgress('Extracting Digital DNA...');
      await new Promise(r => setTimeout(r, 600));
      setProgress('Running AI deepfake analysis...');
      await new Promise(r => setTimeout(r, 600));
      setProgress('Computing trust score...');

      const formData = new FormData();
      formData.append('file', file);
      const stored = localStorage.getItem('uhrate_user');
      if (stored) formData.append('userEmail', JSON.parse(stored).email);

      const response = await fetch('/api/verify', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1, maxSize: 50 * 1024 * 1024,
  });

  const downloadReport = () => {
    if (!result) return;
    const report = {
      scan_id: result.data?.certificate_id,
      file_name: result.data?.file_name,
      file_type: result.data?.file_type,
      sha256_hash: result.data?.sha256_hash,
      originality_score: result.data?.originality_score,
      ai_score: result.data?.ai_score,
      deepfake_score: result.data?.deepfake_score,
      manipulation_score: result.data?.manipulation_score,
      trust_score: result.data?.trust_score,
      rating: result.data?.rating,
      analysis: result.analysis?.summary,
      detected_issues: result.analysis?.detected_issues,
      scanned_at: result.data?.created_at,
      platform: 'UHRATE Verify',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uhrate_scan_${report.scan_id}.json`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
            🧬 AI-Powered — Free — No Account Needed
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Verify</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Upload any file — our AI models analyse it for deepfakes, manipulation, AI generation, and authenticity. Get a detailed trust report instantly.
          </p>
        </div>

        {/* What it does */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🤖', label: 'AI Generation', desc: 'Probability score' },
            { icon: '👁️', label: 'Deepfake', desc: 'Detection analysis' },
            { icon: '✂️', label: 'Manipulation', desc: 'Edit detection' },
            { icon: '📊', label: 'Trust Score', desc: '0-100 rating' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Upload */}
        {!result && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-6">
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
                  <p className="text-gray-600 font-medium">{progress}</p>
                  <p className="text-xs text-gray-400">Analysing your file with 6 AI models...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-4xl">🧬</div>
                  <div>
                    <p className="font-bold text-gray-700 text-lg">Drop any file to verify</p>
                    <p className="text-sm text-gray-400 mt-1">Images, videos, audio, documents — max 50MB</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {['JPG', 'PNG', 'MP4', 'PDF', 'MP3', 'DOCX', 'Any file'].map(t => (
                      <span key={t} className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Results */}
        {result && result.data && (
          <div className="space-y-4">
            {/* Rating */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{result.data.file_name}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{result.data.file_type} · {(result.data.file_size / 1024).toFixed(1)} KB</p>
                </div>
                <span className={"px-4 py-2 rounded-full text-sm font-bold border " + getRatingStyle(result.data.rating)}>
                  {result.data.rating}
                </span>
              </div>

              {/* Trust Score */}
              <div className="p-4 bg-gray-50 rounded-xl mb-6 flex items-center justify-between">
                <span className="font-semibold text-gray-700">Overall Trust Score</span>
                <span className={"text-3xl font-black " + (
                  result.data.trust_score >= 70 ? 'text-green-600' :
                  result.data.trust_score >= 40 ? 'text-amber-600' : 'text-red-600'
                )}>{result.data.trust_score}/100</span>
              </div>

              {/* Score Bars */}
              <div className="space-y-4">
                <ScoreBar label="Originality Score" value={result.data.originality_score} color="bg-green-500" />
                <ScoreBar label="AI Generation Probability" value={result.data.ai_score} color="bg-amber-500" />
                <ScoreBar label="Deepfake Risk" value={result.data.deepfake_score} color="bg-red-500" />
                <ScoreBar label="Manipulation Score" value={result.data.manipulation_score} color="bg-blue-500" />
              </div>
            </div>

            {/* AI Analysis */}
            {result.analysis?.summary && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">🤖 AI Analysis Report</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{result.analysis.summary}</p>
                {result.analysis?.detected_issues?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {result.analysis.detected_issues.map((issue: string, i: number) => (
                      <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                        <span>⚠</span> {issue}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scan ID — minimal, no DNA shown */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">Scan Reference</span>
              <span className="font-mono text-xs text-gray-400">{result.data.certificate_id}</span>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-3 flex-wrap mb-4">
                <button onClick={downloadReport} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  ↓ Download Report
                </button>
                <button onClick={() => { setResult(null); setError(null); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Scan Another File
                </button>
              </div>
                            <div className="p-4 bg-black text-white rounded-xl text-center">
                <p className="text-sm font-semibold mb-1">Want a permanent Digital DNA + Blockchain Identity?</p>
                <p className="text-xs text-gray-400 mb-3">Seal your file on the blockchain — get SHA-256 fingerprint, certificate, and on-chain proof forever.</p>
                <button onClick={() => window.location.href = '/seal'} className="px-6 py-2 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors">
                  🔏 Seal This File for Permanent Identity →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}