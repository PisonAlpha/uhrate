'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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

export default function Enterprise() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const combined = [...prev, ...acceptedFiles];
      return combined.slice(0, 20);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 20,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkVerify = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setProgress('Preparing files...');

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      setProgress('Running AI analysis on ' + files.length + ' files...');

      const response = await fetch('/api/enterprise/bulk-verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setResults(data);
      setFiles([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const downloadReport = () => {
    if (!results) return;
    const report = {
      platform: 'UHRATE Enterprise',
      generated_at: new Date().toISOString(),
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      results: results.results.map((r: any) => ({
        file_name: r.file_name,
        success: r.success,
        rating: r.data?.rating,
        trust_score: r.data?.trust_score,
        certificate_id: r.data?.certificate_id,
        sha256_hash: r.data?.sha256_hash,
        blockchain_tx: r.data?.blockchain_tx,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uhrate_bulk_report_' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Enterprise
            </span>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enterprise Bulk Verification
          </h1>
          <p className="text-gray-500">
            Verify up to 20 files at once with full AI analysis and blockchain registration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Max files per batch', value: '20' },
            { label: 'AI models used', value: '6' },
            { label: 'Blockchains', value: '8' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Files</h3>

          <div
            {...getRootProps()}
            className={"border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 " + (
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700">Drop up to 20 files here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          {file.type.split('/')[0].charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 max-w-48 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleBulkVerify}
            disabled={loading || files.length === 0}
            className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {progress}
              </span>
            ) : (
              'Verify ' + (files.length > 0 ? files.length + ' files' : 'files')
            )}
          </button>
        </div>

        {results && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Verification Results</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {results.successful} successful · {results.failed} failed · {results.total} total
                </p>
              </div>
              <button
                onClick={downloadReport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Download Report
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {results.results.map((result: any, i: number) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 " + (
                    result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  )}>
                    {result.success ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.file_name}</p>
                    {result.success && result.data && (
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                        {result.data.certificate_id}
                      </p>
                    )}
                    {!result.success && (
                      <p className="text-xs text-red-500 mt-0.5">{result.error}</p>
                    )}
                  </div>
                  {result.success && result.data && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(result.data.rating)}>
                        {result.data.rating}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {result.data.trust_score}/100
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}