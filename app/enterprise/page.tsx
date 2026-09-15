'use client';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface BulkResult {
  fileName: string;
  rating: string;
  trustScore: number;
  certificateId: string;
  status: 'success' | 'error';
  error?: string;
}

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

export default function BulkVerify() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<string>('');

    useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setResults([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (!files.length) return;
    setProcessing(true);
    setResults([]);
    setProgress(0);

    const newResults: BulkResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      setProgress(Math.round(((i) / files.length) * 100));

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (user?.email) formData.append('userEmail', user.email);

        const response = await fetch('/api/verify', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        newResults.push({
          fileName: file.name,
          rating: data.rating,
          trustScore: data.trustScore,
          certificateId: data.certificateId,
          status: 'success',
        });
      } catch (err: any) {
        newResults.push({
          fileName: file.name,
          rating: '—',
          trustScore: 0,
          certificateId: '—',
          status: 'error',
          error: err.message || 'Verification failed',
        });
      }

      setResults([...newResults]);
    }

    setProgress(100);
    setCurrentFile('');
    setProcessing(false);
  };

  const downloadCSV = () => {
    const headers = ['File Name', 'Rating', 'Trust Score', 'Certificate ID', 'Status'];
    const rows = results.map(r => [
      r.fileName,
      r.rating,
      r.trustScore.toString(),
      r.certificateId,
      r.status,
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uhrate-bulk-verification.csv';
    a.click();
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const originalCount = results.filter(r => r.rating === 'Verified Original' || r.rating === 'Likely Original').length;
  const riskCount = results.filter(r => r.rating === 'High Risk' || r.rating === 'Deepfake Suspected' || r.rating === 'AI Generated').length;

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Verification</h1>
          <p className="text-gray-500">Upload multiple files and verify them all at once. Free for all users — no limits.</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div
            {...getRootProps()}
            className={"border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all " + (
              isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-3">📁</div>
            <p className="font-semibold text-gray-700 text-lg mb-1">Drop files here to verify</p>
            <p className="text-sm text-gray-400">or click to browse — supports all file types, max 50MB each</p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer">
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer text-lg flex-shrink-0">×</button>
                  </div>
                ))}
              </div>

              <button
                onClick={processFiles}
                disabled={processing}
                className="w-full mt-4 py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {processing ? `Verifying ${currentFile}...` : `Verify ${files.length} File${files.length > 1 ? 's' : ''} →`}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {processing && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Processing files...</p>
              <p className="text-sm font-bold text-gray-900">{progress}%</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
            </div>
            {currentFile && (
              <p className="text-xs text-gray-400 truncate">Verifying: {currentFile}</p>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Verification Results</h3>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>✓ {successCount} verified</span>
                  <span className="text-green-600">● {originalCount} original</span>
                  <span className="text-red-600">● {riskCount} high risk</span>
                </div>
              </div>
              {!processing && results.length > 0 && (
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  ↓ Download CSV
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">File</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Rating</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Trust Score</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Certificate</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">{r.fileName}</p>
                      </td>
                      <td className="px-6 py-4">
                        {r.status === 'success' ? (
                          <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(r.rating)}>
                            {r.rating}
                          </span>
                        ) : (
                          <span className="text-red-500 text-xs">{r.error}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {r.status === 'success' ? r.trustScore + '/100' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-600">{r.certificateId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + (
                          r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}>
                          {r.status === 'success' ? '✓ Done' : '✗ Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info */}
        {!processing && results.length === 0 && files.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              { icon: '📁', title: 'Upload Multiple Files', desc: 'Drag and drop or browse to select as many files as you need. All file types supported.' },
              { icon: '🤖', title: 'AI Verifies Each File', desc: 'Each file is individually analyzed for originality, deepfakes, AI generation, and manipulation.' },
              { icon: '📊', title: 'Download CSV Report', desc: 'Get a full CSV report of all results including ratings, trust scores, and certificate IDs.' },
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