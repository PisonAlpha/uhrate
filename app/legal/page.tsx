'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

declare global {
  interface Window { ethereum?: any; }
}

const LEGAL_DOCUMENT_TYPES = [
  'Contract/Agreement',
  'Non-Disclosure Agreement (NDA)',
  'Memorandum of Understanding (MOU)',
  'Power of Attorney',
  'Court Filing',
  'Affidavit',
  'Deed/Title',
  'Will/Testament',
  'Partnership Agreement',
  'Employment Contract',
  'Intellectual Property Filing',
  'Other Legal Document',
];

export default function Legal() {
  const [activeTab, setActiveTab] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedChain, setSelectedChain] = useState('bnb');
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    setCheckedAuth(true);
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [sha256Hash, setSha256Hash] = useState('');

  const [form, setForm] = useState({
    firmName: '',
    firmEmail: '',
    documentTitle: '',
    documentType: '',
    parties: '',
    executionDate: '',
    jurisdiction: '',
    referenceNumber: '',
  });

  const [verifyForm, setVerifyForm] = useState({
    registryId: '',
    documentTitle: '',
    firmName: '',
    sha256Hash: '',
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);

    const bytes = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setSha256Hash(hash);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleRegister = async () => {
    if (!form.firmName || !form.firmEmail || !form.documentTitle ||
      !form.documentType || !form.parties || !form.executionDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      const docData = JSON.stringify({
        platform: 'UHRATE Legal',
        firm: form.firmName,
        title: form.documentTitle,
        type: form.documentType,
        parties: form.parties,
        date: form.executionDate,
        sha256: sha256Hash || null,
        timestamp: Date.now(),
      });

      const dataHex = '0x' + Buffer.from(docData).toString('hex');

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: '0x5dD548e385B1Eaa1bcD0e55809Cc3B9A81bcDDDB',
          value: '0x0',
          data: dataHex,
          gas: '0x186A0',
        }],
      });

      const response = await fetch('/api/legal/register', {
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
    if (!verifyForm.registryId && !verifyForm.documentTitle && !verifyForm.sha256Hash) {
      setError('Enter a registry ID, document title, or SHA-256 hash');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/legal/verify', {
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
          <span className="text-sm font-medium text-gray-500">⚖️ Legal Registry</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create a free account to register legal documents on the blockchain and manage your registry history.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Legal Document Registry</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Law firms and legal professionals register contracts and legal documents on blockchain.
            Creates tamper-evident records that can be verified by any party.
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'register', label: '⚖️ Register Document' },
            { key: 'verify', label: '✓ Verify Document' },
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
            <h3 className="font-semibold text-gray-900 mb-6">Register Legal Document</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            {result?.type === 'register' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <p className="font-medium text-green-900 mb-2">✓ Legal Document Registered!</p>
                <p className="text-sm text-green-700">Registry ID: <span className="font-mono">{result.data.registry_id}</span></p>
                <p className="text-sm text-green-700 mt-1">Chain: {result.data.chain}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document <span className="text-gray-400 font-normal">(optional — generates SHA-256 hash)</span>
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
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all">{sha256Hash}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Drop document here to generate hash</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Law Firm / Organization *</label>
                <input type="text" value={form.firmName} onChange={e => setForm(p => ({ ...p, firmName: e.target.value }))}
                  placeholder="Firm name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firm Email *</label>
                <input type="email" value={form.firmEmail} onChange={e => setForm(p => ({ ...p, firmEmail: e.target.value }))}
                  placeholder="legal@firm.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Title *</label>
                <input type="text" value={form.documentTitle} onChange={e => setForm(p => ({ ...p, documentTitle: e.target.value }))}
                  placeholder="Service Agreement between..." className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                <select value={form.documentType} onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">Select type</option>
                  {LEGAL_DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parties Involved *</label>
                <input type="text" value={form.parties} onChange={e => setForm(p => ({ ...p, parties: e.target.value }))}
                  placeholder="Party A, Party B" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Execution Date *</label>
                <input type="date" value={form.executionDate} onChange={e => setForm(p => ({ ...p, executionDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                <input type="text" value={form.jurisdiction} onChange={e => setForm(p => ({ ...p, jurisdiction: e.target.value }))}
                  placeholder="e.g. New York, USA" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input type="text" value={form.referenceNumber} onChange={e => setForm(p => ({ ...p, referenceNumber: e.target.value }))}
                  placeholder="e.g. REF/2024/001" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
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
              ) : 'Register Legal Document on Blockchain'}
            </button>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Verify Legal Document</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registry ID</label>
                <input type="text" value={verifyForm.registryId} onChange={e => setVerifyForm(p => ({ ...p, registryId: e.target.value }))}
                  placeholder="ULEG-XXXXXXXX-XXXXXXXX" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
              </div>
              <div className="text-center text-gray-400 text-sm">— or search by details —</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                  <input type="text" value={verifyForm.documentTitle} onChange={e => setVerifyForm(p => ({ ...p, documentTitle: e.target.value }))}
                    placeholder="Document title" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SHA-256 Hash</label>
                  <input type="text" value={verifyForm.sha256Hash} onChange={e => setVerifyForm(p => ({ ...p, sha256Hash: e.target.value }))}
                    placeholder="Document hash" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
                </div>
              </div>
            </div>

            <button onClick={handleVerify} disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mb-6">
              {loading ? 'Verifying...' : 'Verify Legal Document'}
            </button>

            {result?.type === 'verify' && !result.data.found && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-red-700 font-medium">No documents found</p>
                <p className="text-red-600 text-sm mt-1">{result.data.message}</p>
              </div>
            )}

            {result?.type === 'verify' && result.data.found && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">{result.data.count} document{result.data.count > 1 ? 's' : ''} found</p>
                {result.data.documents.map((doc: any) => (
                  <div key={doc.registry_id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚖️</span>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.document_title}</p>
                          <p className="text-sm text-gray-500">{doc.firm_name}</p>
                        </div>
                      </div>
                      <span className={"px-3 py-1 rounded-full text-xs font-medium " + (doc.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {doc.is_valid ? '✓ Valid' : '✗ Invalid'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div><p className="text-gray-500">Type</p><p className="font-medium">{doc.document_type}</p></div>
                      <div><p className="text-gray-500">Parties</p><p className="font-medium">{doc.parties}</p></div>
                      <div><p className="text-gray-500">Execution Date</p><p className="font-medium">{doc.execution_date}</p></div>
                      <div><p className="text-gray-500">Blockchain</p><p className="font-medium">{doc.chain_name}</p></div>
                      {doc.jurisdiction && <div><p className="text-gray-500">Jurisdiction</p><p className="font-medium">{doc.jurisdiction}</p></div>}
                      {doc.reference_number && <div><p className="text-gray-500">Reference</p><p className="font-medium">{doc.reference_number}</p></div>}
                    </div>
                    <p className="font-mono text-xs text-blue-600 mb-1">{doc.registry_id}</p>
                    {doc.tx_hash && (
                      <p onClick={() => window.open('https://testnet.bscscan.com/tx/' + doc.tx_hash, '_blank')}
                        className="font-mono text-xs text-blue-600 cursor-pointer hover:underline truncate">{doc.tx_hash}</p>
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