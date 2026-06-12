'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS } from '@/lib/registry';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const DOCUMENT_TYPES = [
  { value: 'educational', label: '🎓 Educational Certificate' },
  { value: 'legal', label: '⚖️ Legal Document' },
  { value: 'media', label: '📰 Media/Journalism' },
  { value: 'identity', label: '🪪 Identity Document' },
  { value: 'contract', label: '📝 Contract/Agreement' },
  { value: 'research', label: '🔬 Research Paper' },
  { value: 'creative', label: '🎨 Creative Work' },
  { value: 'financial', label: '💰 Financial Document' },
  { value: 'medical', label: '🏥 Medical Record' },
  { value: 'other', label: '📄 Other Document' },
];

export default function Registry() {
  const [file, setFile] = useState<File | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedChain, setSelectedChain] = useState('bnb');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'details' | 'sign' | 'complete'>('upload');
  const [txHash, setTxHash] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dna, setDna] = useState<any>(null);

  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
    setCheckedAuth(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setStep('details');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const addMetadata = () => {
    if (!metaKey || !metaValue) return;
    setMetadata(prev => ({ ...prev, [metaKey]: metaValue }));
    setMetaKey('');
    setMetaValue('');
  };

  const removeMetadata = (key: string) => {
    setMetadata(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSignAndRegister = async () => {
    if (!file || !ownerName || !ownerEmail || !documentType) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setDna({ sha256 });

      const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain);

      if (!window.ethereum) {
        setError('Please install MetaMask to register documents on blockchain');
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (chain && !chain.testnet && chain.id !== 'solana') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + chain.chainId.toString(16) }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
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
        }
      }

      if (selectedChain === 'bnb-testnet') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }],
        }).catch(async (error: any) => {
          if (error.code === 4902) {
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
      }

      const documentData = JSON.stringify({
        platform: 'UHRATE',
        sha256,
        file: file.name,
        type: documentType,
        owner: ownerName,
        timestamp: Date.now(),
      });

      const dataHex = '0x' + Buffer.from(documentData).toString('hex');

      setStep('sign');

      const txHashResult = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: '0x5dD548e385B1Eaa1bcD0e55809Cc3B9A81bcDDDB',
          value: '0x0',
          data: dataHex,
          gas: '0x186A0',
        }],
      });

      setTxHash(txHashResult);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerName', ownerName);
      formData.append('ownerEmail', ownerEmail);
      formData.append('documentType', documentType);
      formData.append('chainId', selectedChain);
      formData.append('txHash', txHashResult);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch('/api/registry/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResult(data);
      setStep('complete');
    } catch (err: any) {
      setError(err.message);
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain);

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
              onClick={() => window.location.href = '/registry/lookup'}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Verify Document
            </button>
            <span className="text-sm text-gray-500 font-medium">Document Registry</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create a free account to register documents on the blockchain and manage your registry history.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Register Your Document
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Give your original document a permanent blockchain identity.
            Anyone who tries to counterfeit it can be detected instantly.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {['upload', 'details', 'sign', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium " + (
                step === s ? 'bg-black text-white' :
                ['upload', 'details', 'sign', 'complete'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              )}>
                {['upload', 'details', 'sign', 'complete'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === 'upload' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Upload your document</h3>
            <div
              {...getRootProps()}
              className={"border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all " + (
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Drop your original document here</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, images, videos, audio, documents — max 50MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(step === 'details' || step === 'sign') && file && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📄</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · {file.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="Full name or organization"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Email *</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
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
                      <p className={"text-xs mt-0.5 " + (selectedChain === chain.id ? 'text-gray-300' : 'text-gray-400')}>
                        {chain.symbol}
                      </p>
                      {chain.testnet && (
                        <span className={"text-xs " + (selectedChain === chain.id ? 'text-yellow-300' : 'text-yellow-600')}>
                          testnet
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Metadata <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={metaKey}
                    onChange={e => setMetaKey(e.target.value)}
                    placeholder="Key (e.g. Institution)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    value={metaValue}
                    onChange={e => setMetaValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={addMetadata}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {Object.keys(metadata).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(metadata).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700"><strong>{k}:</strong> {v}</span>
                        <button onClick={() => removeMetadata(k)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium mb-1">What happens next:</p>
                <p className="text-sm text-blue-700">
                  MetaMask will ask you to sign a transaction on {chain?.name}.
                  Your document's fingerprint will be permanently recorded on-chain.
                  Gas fee applies (~{chain?.symbol} 0.001).
                </p>
              </div>

              <button
                onClick={handleSignAndRegister}
                disabled={loading || step === 'sign'}
                className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {step === 'sign' ? 'Waiting for MetaMask...' : 'Registering...'}
                  </span>
                ) : (
                  'Sign & Register on ' + chain?.name
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && result && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">Document Registered!</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Your document has a permanent blockchain identity on {result.chain}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Registry ID</p>
                  <p className="font-mono text-sm text-blue-600 break-all">{result.registry_id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Blockchain</p>
                  <p className="font-medium text-gray-900">{result.chain}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">SHA-256 Hash</p>
                <p className="font-mono text-xs text-gray-700 break-all">{result.sha256_hash}</p>
              </div>

              {result.tx_hash && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Transaction Hash</p>
                  <p
                    onClick={() => {
                      const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
                      window.open(chain?.explorer + '/tx/' + result.tx_hash, '_blank');
                    }}
                    className="font-mono text-xs text-blue-600 break-all cursor-pointer hover:underline"
                  >
                    {result.tx_hash}
                  </p>
                </div>
              )}

              {result.ipfs_hash && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">IPFS Hash</p>
                  <p
                    onClick={() => window.open('https://gateway.pinata.cloud/ipfs/' + result.ipfs_hash, '_blank')}
                    className="font-mono text-xs text-blue-600 break-all cursor-pointer hover:underline"
                  >
                    {result.ipfs_hash}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const cert = JSON.stringify(result, null, 2);
                    const blob = new Blob([cert], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'uhrate_registry_' + result.registry_id + '.json';
                    a.click();
                  }}
                  className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Download Registry Certificate
                </button>
                <button
                  onClick={() => {
                    setStep('upload');
                    setFile(null);
                    setResult(null);
                    setOwnerName('');
                    setOwnerEmail('');
                    setDocumentType('');
                    setMetadata({});
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Register Another
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🎓', title: 'Educational', desc: 'Universities register degrees and certificates that employers can instantly verify' },
            { icon: '⚖️', title: 'Legal', desc: 'Law firms register contracts with tamper-evident blockchain proof' },
            { icon: '📰', title: 'Media', desc: 'Journalists register original photos and videos to prove authenticity' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </>
        )}
      </div>
    </main>
  );
}