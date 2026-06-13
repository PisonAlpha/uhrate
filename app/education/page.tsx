'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

declare global {
  interface Window { ethereum?: any; }
}

const DEGREE_TYPES = [
  'Bachelor of Science (B.Sc)',
  'Bachelor of Arts (B.A)',
  'Bachelor of Engineering (B.Eng)',
  'Master of Science (M.Sc)',
  'Master of Arts (M.A)',
  'Master of Business Administration (MBA)',
  'Doctor of Philosophy (PhD)',
  'Associate Degree',
  'Higher National Diploma (HND)',
  'Professional Certificate',
  'Diploma',
  'Other',
];

export default function Education() {
  const [activeTab, setActiveTab] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedChain, setSelectedChain] = useState('bnb');
 const [file, setFile] = useState<File | null>(null);
  const [sha256Hash, setSha256Hash] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [mismatches, setMismatches] = useState<any[]>([]);

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
        const res = await fetch('/api/education/extract', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data.extracted) {
          setForm(p => ({
            institutionName: data.extracted.institutionName || p.institutionName,
            institutionEmail: p.institutionEmail,
            studentName: data.extracted.studentName || p.studentName,
            studentEmail: p.studentEmail,
            degreeType: data.extracted.degreeType || p.degreeType,
            fieldOfStudy: data.extracted.fieldOfStudy || p.fieldOfStudy,
            graduationYear: data.extracted.graduationYear || p.graduationYear,
            certificateNumber: data.extracted.certificateNumber || p.certificateNumber,
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
    maxSize: 20 * 1024 * 1024,
  });
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    setCheckedAuth(true);
  }, []);

  const [form, setForm] = useState({
    institutionName: '',
    institutionEmail: '',
    studentName: '',
    studentEmail: '',
    degreeType: '',
    fieldOfStudy: '',
    graduationYear: '',
    certificateNumber: '',
  });

  const [verifyForm, setVerifyForm] = useState({
    registryId: '',
    studentName: '',
    institutionName: '',
  });

  const handleRegister = async () => {
    if (!form.institutionName || !form.institutionEmail || !form.studentName ||
      !form.studentEmail || !form.degreeType || !form.fieldOfStudy || !form.graduationYear) {
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
        matchFd.append('institutionName', form.institutionName);
        matchFd.append('studentName', form.studentName);
        matchFd.append('degreeType', form.degreeType);
        matchFd.append('fieldOfStudy', form.fieldOfStudy);
        matchFd.append('graduationYear', form.graduationYear);
        matchFd.append('certificateNumber', form.certificateNumber);

        const matchRes = await fetch('/api/education/verify-match', { method: 'POST', body: matchFd });
        const matchData = await matchRes.json();

        if (matchData.mismatches && matchData.mismatches.length > 0) {
          setMismatches(matchData.mismatches);
          setError('The submitted details do not match the uploaded certificate. Please review the highlighted fields below.');
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

      if (selectedChain === 'bnb-testnet') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }],
        }).catch(async (err: any) => {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x61',
                chainName: 'BSC Testnet',
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                blockExplorerUrls: ['https://testnet.bscscan.com'],
              }],
            });
          }
        });
      } else if (chain) {
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

      const credentialData = JSON.stringify({
        platform: 'UHRATE Education',
        institution: form.institutionName,
        student: form.studentName,
        degree: form.degreeType,
        field: form.fieldOfStudy,
        year: form.graduationYear,
        timestamp: Date.now(),
      });

      const dataHex = '0x' + Buffer.from(credentialData).toString('hex');

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

      const response = await fetch('/api/education/register', {
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
    if (!verifyForm.registryId && !verifyForm.studentName) {
      setError('Enter a registry ID or student name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/education/verify', {
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
          <span className="text-sm font-medium text-gray-500">🎓 Education Registry</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create a free account to register credentials on the blockchain and manage your registry history.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Educational Credential Registry</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Universities and institutions register degrees and certificates on blockchain.
            Employers can verify credentials instantly — no more fake degrees.
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'register', label: '🎓 Register Credential' },
            { key: 'verify', label: '✓ Verify Credential' },
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
            <h3 className="font-semibold text-gray-900 mb-6">Register Educational Credential</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            {mismatches.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <p className="font-medium text-amber-900 mb-3">⚠️ Mismatches found between form and certificate:</p>
                <div className="space-y-2">
                  {mismatches.map((m: any, i: number) => (
                    <div key={i} className="bg-white border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-900 capitalize mb-1">{m.field.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-gray-600">You entered: <span className="font-medium text-red-600">{m.submitted || '(empty)'}</span></p>
                      <p className="text-gray-600">Certificate shows: <span className="font-medium text-green-700">{m.found || '(not found)'}</span></p>
                      <p className="text-gray-500 text-xs mt-1">{m.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extracting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm mb-6 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Reading certificate with AI and auto-filling form...
              </div>
            )}

            {result?.type === 'register' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <p className="font-medium text-green-900 mb-2">✓ Credential Registered Successfully!</p>
                <p className="text-sm text-green-700">Registry ID: <span className="font-mono">{result.data.registry_id}</span></p>
                <p className="text-sm text-green-700 mt-1">Chain: {result.data.chain}</p>
                {result.data.ipfs_hash && (
                  <p className="text-sm text-green-700 mt-1">IPFS: <span className="font-mono text-xs">{result.data.ipfs_hash}</span></p>
                )}
              </div>
            )}
<div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Certificate/Document <span className="text-gray-400 font-normal">(optional — generates SHA-256 fingerprint)</span>
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
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all">{sha256Hash}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-medium">Drop certificate image/PDF here</p>
                    <p className="text-sm text-gray-400 mt-1">Images, PDF — max 20MB</p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name *</label>
                <input
                  type="text"
                  value={form.institutionName}
                  onChange={e => setForm(p => ({ ...p, institutionName: e.target.value }))}
                  placeholder="Harvard University"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution Email *</label>
                <input
                  type="email"
                  value={form.institutionEmail}
                  onChange={e => setForm(p => ({ ...p, institutionEmail: e.target.value }))}
                  placeholder="registrar@harvard.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))}
                  placeholder="Full name as on certificate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Email *</label>
                <input
                  type="email"
                  value={form.studentEmail}
                  onChange={e => setForm(p => ({ ...p, studentEmail: e.target.value }))}
                  placeholder="student@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type *</label>
                <select
                  value={form.degreeType}
                  onChange={e => setForm(p => ({ ...p, degreeType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="">Select degree type</option>
                  {DEGREE_TYPES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study *</label>
                <input
                  type="text"
                  value={form.fieldOfStudy}
                  onChange={e => setForm(p => ({ ...p, fieldOfStudy: e.target.value }))}
                  placeholder="Computer Science"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year *</label>
                <input
                  type="text"
                  value={form.graduationYear}
                  onChange={e => setForm(p => ({ ...p, graduationYear: e.target.value }))}
                  placeholder="2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                <input
                  type="text"
                  value={form.certificateNumber}
                  onChange={e => setForm(p => ({ ...p, certificateNumber: e.target.value }))}
                  placeholder="e.g. UL/2024/001234"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Blockchain *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUPPORTED_CHAINS.map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={"p-3 border rounded-xl text-center transition-all " + (
                      selectedChain === chain.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                    )}
                  >
                    <p className="text-xs font-medium">{chain.name}</p>
                    <p className={"text-xs mt-0.5 " + (selectedChain === chain.id ? 'text-gray-300' : 'text-gray-400')}>{chain.symbol}</p>
                    {chain.testnet && <span className={"text-xs " + (selectedChain === chain.id ? 'text-yellow-300' : 'text-yellow-600')}>testnet</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering on blockchain...
                </span>
              ) : 'Register Credential on Blockchain'}
            </button>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Verify Educational Credential</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registry ID</label>
                <input
                  type="text"
                  value={verifyForm.registryId}
                  onChange={e => setVerifyForm(p => ({ ...p, registryId: e.target.value }))}
                  placeholder="UEDU-XXXXXXXX-XXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
              </div>
              <div className="text-center text-gray-400 text-sm">— or search by name —</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    value={verifyForm.studentName}
                    onChange={e => setVerifyForm(p => ({ ...p, studentName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={verifyForm.institutionName}
                    onChange={e => setVerifyForm(p => ({ ...p, institutionName: e.target.value }))}
                    placeholder="University name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mb-6"
            >
              {loading ? 'Verifying...' : 'Verify Credential'}
            </button>

            {result?.type === 'verify' && !result.data.found && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-red-700 font-medium">No credentials found</p>
                <p className="text-red-600 text-sm mt-1">{result.data.message}</p>
              </div>
            )}

            {result?.type === 'verify' && result.data.found && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">{result.data.count} credential{result.data.count > 1 ? 's' : ''} found</p>
                {result.data.credentials.map((cred: any) => (
                  <div key={cred.registry_id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎓</span>
                        <div>
                          <p className="font-semibold text-gray-900">{cred.student_name}</p>
                          <p className="text-sm text-gray-500">{cred.institution_name}</p>
                        </div>
                      </div>
                      <span className={"px-3 py-1 rounded-full text-xs font-medium " + (cred.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {cred.is_valid ? '✓ Valid' : '✗ Invalid'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Degree</p>
                        <p className="font-medium text-gray-900">{cred.degree_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Field</p>
                        <p className="font-medium text-gray-900">{cred.field_of_study}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Year</p>
                        <p className="font-medium text-gray-900">{cred.graduation_year}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Blockchain</p>
                        <p className="font-medium text-gray-900">{cred.chain_name}</p>
                      </div>
                    </div>
                    {cred.tx_hash && (
                      <p
                        onClick={() => window.open('https://bscscan.com/tx/' + cred.tx_hash, '_blank')}
                        className="font-mono text-xs text-blue-600 mt-3 cursor-pointer hover:underline truncate"
                      >
                        {cred.tx_hash}
                      </p>
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