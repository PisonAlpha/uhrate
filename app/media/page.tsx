'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

declare global {
  interface Window { ethereum?: any; }
}

const CONTENT_TYPES = [
  'Photograph',
  'Video Recording',
  'Audio Recording',
  'Written Article',
  'Document/Report',
  'Screenshot/Screen Recording',
  'Satellite/Aerial Image',
  'Social Media Post',
  'Interview Recording',
  'Other Media',
];

export default function Media() {
  const [activeTab, setActiveTab] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedChain, setSelectedChain] = useState('bnb');
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sha256Hash, setSha256Hash] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [mismatches, setMismatches] = useState<any[]>([]);

  const [form, setForm] = useState({
    journalistName: '',
    journalistEmail: '',
    mediaOrganization: '',
    contentTitle: '',
    contentType: '',
    captureDate: '',
    location: '',
    description: '',
  });

  const [verifyForm, setVerifyForm] = useState({
    registryId: '',
    journalistName: '',
    contentTitle: '',
    sha256Hash: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    setCheckedAuth(true);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setMismatches([]);

    const bytes = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setSha256Hash(hash);

    if (f.type.startsWith('image/')) {
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/media/extract', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.extracted) {
          setForm(p => ({
            journalistName: p.journalistName,
            journalistEmail: p.journalistEmail,
            mediaOrganization: data.extracted.mediaOrganization || p.mediaOrganization,
            contentTitle: data.extracted.contentTitle || p.contentTitle,
            contentType: data.extracted.contentType || p.contentType,
            captureDate: data.extracted.captureDate || p.captureDate,
            location: data.extracted.location || p.location,
            description: data.extracted.description || p.description,
          }));
        }
      } catch {
      } finally {
        setExtracting(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const handleRegister = async () => {
    if (!form.journalistName || !form.journalistEmail || !form.contentTitle ||
      !form.contentType || !form.captureDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setMismatches([]);

    try {
      if (file && file.type.startsWith('image/')) {
        const matchFd = new FormData();
        matchFd.append('file', file);
        matchFd.append('contentTitle', form.contentTitle);
        matchFd.append('contentType', form.contentType);
        matchFd.append('captureDate', form.captureDate);
        matchFd.append('location', form.location);
        matchFd.append('description', form.description);
        matchFd.append('mediaOrganization', form.mediaOrganization);

        const matchRes = await fetch('/api/media/verify-match', { method: 'POST', body: matchFd });
        const matchData = await matchRes.json();

        if (matchData.mismatches && matchData.mismatches.length > 0) {
          setMismatches(matchData.mismatches);
          setError('The submitted details do not match the uploaded media. Please review the highlighted fields below.');
          setLoading(false);
          return;
        }
      }

      if (!window.ethereum) {
        setError('Please install MetaMask to register on blockchain');
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain);

      if (chain) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + chain.chainId.toString(16) }],
        }).catch(async (err: any) => {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x' + chain.chainId.toString(16),
                chainName: chain.name,
                nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
                rpcUrls: [chain.rpc],
                blockExplorerUrls: [chain.explorer],
              }],
            });
          }
        });
      }

      const mediaData = JSON.stringify({
        platform: 'UHRATE Media',
        journalist: form.journalistName,
        org: form.mediaOrganization,
        title: form.contentTitle,
        type: form.contentType,
        date: form.captureDate,
        location: form.location,
        sha256: sha256Hash || null,
        timestamp: Date.now(),
      });

      const dataHex = '0x' + Buffer.from(mediaData).toString('hex');

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: '0x000000000000000000000000000000000000dEaD',
          value: '0x0',
          data: dataHex,
          gas: '0x186A0',
        }],
      });

      const response = await fetch('/api/media/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sha256Hash, chainId: selectedChain, txHash }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult({ type: 'register', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyForm.registryId && !verifyForm.journalistName &&
      !verifyForm.contentTitle && !verifyForm.sha256Hash) {
      setError('Enter a registry ID, journalist name, content title, or hash');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/media/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult({ type: 'verify', data });
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
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm font-medium text-gray-500">📰 Media Registry</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create a free account to register media content on the blockchain and manage your registry history.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.href = '/login'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Login</button>
              <button onClick={() => window.location.href = '/register'} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Sign up free</button>
            </div>
          </div>
        )}
        {user && (
        <>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Media Verification Registry</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Journalists and media organizations register original photos, videos, and reports.
            Anyone can verify the authenticity and provenance of media content.
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'register', label: '📰 Register Content' },
            { key: 'verify', label: '✓ Verify Content' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setResult(null); setError(null); }}
              className={"px-6 py-3 rounded-xl text-sm font-medium transition-colors " + (
                activeTab === tab.key ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'register' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Register Media Content</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            {mismatches.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <p className="font-medium text-amber-900 mb-3">⚠️ Mismatches found between form and media:</p>
                <div className="space-y-2">
                  {mismatches.map((m: any, i: number) => (
                    <div key={i} className="bg-white border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-900 capitalize mb-1">{m.field.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-gray-600">You entered: <span className="font-medium text-red-600">{m.submitted || '(empty)'}</span></p>
                      <p className="text-gray-600">Media shows: <span className="font-medium text-green-700">{m.found || '(not found)'}</span></p>
                      <p className="text-gray-500 text-xs mt-1">{m.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extracting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm mb-6 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Reading media with AI and auto-filling form...
              </div>
            )}

            {result?.type === 'register' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <p className="font-medium text-green-900 mb-2">✓ Media Content Registered!</p>
                <p className="text-sm text-green-700">Registry ID: <span className="font-mono">{result.data.registry_id}</span></p>
                <p className="text-sm text-green-700 mt-1">Chain: {result.data.chain}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Media File <span className="text-gray-400 font-normal">(optional — AI reads and auto-fills form)</span>
              </label>
              <div
                {...getRootProps()}
                className={"border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all " + (
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all">{sha256Hash}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-medium">Drop media file here</p>
                    <p className="text-sm text-gray-400 mt-1">Images, videos, audio, documents — max 100MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Journalist Name *</label>
                <input type="text" value={form.journalistName} onChange={e => setForm(p => ({ ...p, journalistName: e.target.value }))}
                  placeholder="Full name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" value={form.journalistEmail} onChange={e => setForm(p => ({ ...p, journalistEmail: e.target.value }))}
                  placeholder="journalist@media.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media Organization</label>
                <input type="text" value={form.mediaOrganization} onChange={e => setForm(p => ({ ...p, mediaOrganization: e.target.value }))}
                  placeholder="CNN, Reuters, etc." className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Title *</label>
                <input type="text" value={form.contentTitle} onChange={e => setForm(p => ({ ...p, contentTitle: e.target.value }))}
                  placeholder="Descriptive title" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                <select value={form.contentType} onChange={e => setForm(p => ({ ...p, contentType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">Select type</option>
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capture/Creation Date *</label>
                <input type="date" value={form.captureDate} onChange={e => setForm(p => ({ ...p, captureDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Where was this captured?" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Blockchain *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUPPORTED_CHAINS.map(chain => (
                  <button key={chain.id} onClick={() => setSelectedChain(chain.id)}
                    className={"p-3 border rounded-xl text-center transition-all " + (selectedChain === chain.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 text-gray-700')}>
                    <p className="text-xs font-medium">{chain.name}</p>
                    <p className={"text-xs mt-0.5 " + (selectedChain === chain.id ? 'text-gray-300' : 'text-gray-400')}>{chain.symbol}</p>
                    {chain.testnet && <span className={"text-xs " + (selectedChain === chain.id ? 'text-yellow-300' : 'text-yellow-600')}>testnet</span>}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleRegister} disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering on blockchain...
                </span>
              ) : 'Register Media Content on Blockchain'}
            </button>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Verify Media Content</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registry ID</label>
                <input type="text" value={verifyForm.registryId} onChange={e => setVerifyForm(p => ({ ...p, registryId: e.target.value }))}
                  placeholder="UMED-XXXXXXXX-XXXXXXXX" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
              </div>
              <div className="text-center text-gray-400 text-sm">— or search by details —</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journalist Name</label>
                  <input type="text" value={verifyForm.journalistName} onChange={e => setVerifyForm(p => ({ ...p, journalistName: e.target.value }))}
                    placeholder="Journalist name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                  <input type="text" value={verifyForm.contentTitle} onChange={e => setVerifyForm(p => ({ ...p, contentTitle: e.target.value }))}
                    placeholder="Content title" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">SHA-256 Hash</label>
                  <input type="text" value={verifyForm.sha256Hash} onChange={e => setVerifyForm(p => ({ ...p, sha256Hash: e.target.value }))}
                    placeholder="File hash" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
                </div>
              </div>
            </div>

            <button onClick={handleVerify} disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mb-6">
              {loading ? 'Verifying...' : 'Verify Media Content'}
            </button>

            {result?.type === 'verify' && !result.data.found && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-red-700 font-medium">No content found</p>
                <p className="text-red-600 text-sm mt-1">{result.data.message}</p>
              </div>
            )}

            {result?.type === 'verify' && result.data.found && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">{result.data.count} item{result.data.count > 1 ? 's' : ''} found</p>
                {result.data.media.map((item: any) => (
                  <div key={item.registry_id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📰</span>
                        <div>
                          <p className="font-semibold text-gray-900">{item.content_title}</p>
                          <p className="text-sm text-gray-500">{item.journalist_name}{item.media_organization ? ' · ' + item.media_organization : ''}</p>
                        </div>
                      </div>
                      <span className={"px-3 py-1 rounded-full text-xs font-medium " + (item.is_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {item.is_verified ? '✓ Verified' : '✗ Unverified'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div><p className="text-gray-500">Type</p><p className="font-medium">{item.content_type}</p></div>
                      <div><p className="text-gray-500">Date</p><p className="font-medium">{item.capture_date}</p></div>
                      {item.location && <div><p className="text-gray-500">Location</p><p className="font-medium">{item.location}</p></div>}
                      <div><p className="text-gray-500">Blockchain</p><p className="font-medium">{item.chain_name}</p></div>
                    </div>
                    {item.description && <p className="text-sm text-gray-600 mb-3">{item.description}</p>}
                    <p className="font-mono text-xs text-blue-600 mb-1">{item.registry_id}</p>
                    {item.tx_hash && (
                      <p onClick={() => window.open('https://bscscan.com/tx/' + item.tx_hash, '_blank')}
                        className="font-mono text-xs text-blue-600 cursor-pointer hover:underline truncate">{item.tx_hash}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </main>
  );
}