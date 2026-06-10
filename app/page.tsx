'use client';


import FileUploader from './components/FileUploader';
import ScoreCard from './components/ScoreCard';
import CertificateCard from './components/CertificateCard';
import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'verify' | 'lookup'>('verify');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uhrate_user');
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
            <span className="text-gray-400 text-sm hidden sm:block">
              Decentralized Authenticity Network
            </span>
          </div>
         <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/verify'}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Public Verify
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI-Powered Authenticity Verification
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Verify Any Digital Content
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Upload any file — image, video, audio, or document — and get an instant
            AI-powered authenticity analysis with blockchain proof.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { label: 'Files Verified', value: '0' },
              { label: 'AI Models', value: '6' },
              { label: 'Blockchains', value: '8' },
              { label: 'Accuracy', value: '94%' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setActiveTab('verify'); setResult(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'verify'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Verify File
          </button>
          <button
            onClick={() => { setActiveTab('lookup'); setResult(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'lookup'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Lookup Certificate
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {activeTab === 'verify' ? (
              <>
                {!result ? (
                  <FileUploader
                    onResult={setResult}
                    onLoading={setLoading}
                  />
                ) : (
                  <ScoreCard result={result} />
                )}
              </>
            ) : (
              <CertificateCard />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">How it works</h3>
            {[
              {
                step: '01',
                title: 'Upload your file',
                desc: 'Drag and drop any image, video, audio, or document up to 50MB',
              },
              {
                step: '02',
                title: 'Digital DNA extraction',
                desc: 'We generate SHA-256, SHA-512, perceptual and semantic fingerprints',
              },
              {
                step: '03',
                title: 'AI analysis',
                desc: 'Claude AI analyzes for deepfakes, manipulation, and AI generation',
              },
              {
                step: '04',
                title: 'Blockchain registration',
                desc: 'Results are permanently recorded on Polygon blockchain',
              },
              {
                step: '05',
                title: 'Get your certificate',
                desc: 'Download a proof certificate with a unique ID for verification',
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                <span className="text-xs font-mono text-gray-400 mt-0.5 shrink-0">{item.step}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="text-sm text-gray-600">UHRATE © 2024</span>
          </div>
          <p className="text-xs text-gray-400">
            Decentralized Authenticity Network
          </p>
        </div>
      </footer>
    </main>
  );
}