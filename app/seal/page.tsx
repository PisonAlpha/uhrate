'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { SUPPORTED_CHAINS, PLATFORM_FEE_USD, PLATFORM_FEE_UHR_USD, UHR_CONTRACT } from '@/lib/registry';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a';

export default function SealFile() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [step, setStep] = useState<'upload' | 'scanned' | 'sealing' | 'sealed'>('upload');
  const [selectedChain, setSelectedChain] = useState('bnb');
  const [payWithUHR, setPayWithUHR] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [withWatermark, setWithWatermark] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain)!;

  const onDrop = async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setError(null);
    setProgress('Extracting Digital DNA...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setProgress('Running AI analysis...');
      await new Promise(r => setTimeout(r, 600));
      setProgress('Generating certificate...');

      const formData = new FormData();
      formData.append('file', f);
      if (user?.email) formData.append('userEmail', user.email);

      const response = await fetch('/api/verify', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
      setFile(f);
      setStep('scanned');
    } catch (err: any) {
      setError(err.message || 'Failed to process file.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1, maxSize: 50 * 1024 * 1024,
  });

  const downloadSealedFile = async () => {
    if (!file || !result) return;
    setDownloading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('watermark', withWatermark.toString());
      if (user?.email) formData.append('userEmail', user.email);

      const response = await fetch('/api/seal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Sealing failed');

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const fileNameMatch = disposition.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : `sealed_${result.data.certificate_id}.${file.name.split('.').pop()}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const sealOnBlockchain = async () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const currentUrl = window.location.href;
        window.location.href = `https://metamask.app.link/dapp/${currentUrl.replace('https://', '')}`;
        return;
      }
      setError('Please install MetaMask to seal files on the blockchain.');
      return;
    }
    setLoading(true);
    setError(null);
    setStep('sealing');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainIdHex }],
      }).catch(async (e: any) => {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chain.chainIdHex,
              chainName: chain.name,
              nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
              rpcUrls: [chain.rpc],
              blockExplorerUrls: [chain.explorer],
            }],
          });
        }
      });

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      let txHash: string;

      if (payWithUHR) {
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const uhrContract = new ethers.Contract(
          UHR_CONTRACT,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          signer
        );
        const uhrAmount = ethers.parseUnits('10', 18);
        const tx = await uhrContract.transfer(PAYMENT_WALLET, uhrAmount);
        await tx.wait();
        txHash = tx.hash;
      } else {
        const documentData = JSON.stringify({
          platform: 'UHRATE',
          certificate_id: result.data.certificate_id,
          sha256_hash: result.data.sha256_hash,
          file_name: result.data.file_name,
          rating: result.data.rating,
          trust_score: result.data.trust_score,
          sealed_at: new Date().toISOString(),
        });
        const hexData = '0x' + Buffer.from(documentData).toString('hex');

        let nativePrice = 300;
        try {
          const sym = chain.symbol === 'ETH' ? 'ETH' : chain.symbol === 'MATIC' ? 'MATIC' : 'BNB';
          const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
          if (priceRes.ok) {
            const pd = await priceRes.json();
            nativePrice = parseFloat(pd.price) || 300;
          }
        } catch {}

        const feeWei = '0x' + BigInt(Math.floor(PLATFORM_FEE_USD / nativePrice * 1e18)).toString(16);
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: userAddress,
            to: PAYMENT_WALLET,
            value: feeWei,
            data: hexData,
            gas: '0x30D40',
          }],
        });
      }

      // Save blockchain tx to database
      try {
        await fetch('/api/billing/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash,
            chainId: selectedChain,
            userEmail: user?.email || '',
            documentId: result.data.certificate_id,
          }),
        });
      } catch {}

      setDeployResult({ txHash, chain: selectedChain });
      setStep('sealed');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Transaction cancelled.');
      } else {
        setError(err.message || 'Sealing failed. Please try again.');
      }
      setStep('scanned');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!result) return;
    const cert = {
      certificate_id: result.data.certificate_id,
      file_name: result.data.file_name,
      file_type: result.data.file_type,
      sha256_hash: result.data.sha256_hash,
      trust_score: result.data.trust_score,
      rating: result.data.rating,
      sealed_on: deployResult ? chain.name : 'Not sealed on blockchain',
      tx_hash: deployResult?.txHash || null,
      sealed_at: new Date().toISOString(),
      platform: 'UHRATE - The decentralized notary for the digital world',
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uhrate_seal_${cert.certificate_id}.json`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            Permanent Digital Identity
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Seal Your File</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Give any file a permanent, immutable digital identity. The sealed file carries its UHRATE identity wherever it goes.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { key: 'upload', label: '1. Upload' },
            { key: 'scanned', label: '2. Analysed' },
            { key: 'sealing', label: '3. Sealing' },
            { key: 'sealed', label: '4. Sealed' },
          ].map((s, i) => {
            const steps = ['upload', 'scanned', 'sealing', 'sealed'];
            const current = steps.indexOf(step);
            const thisStep = steps.indexOf(s.key);
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold " + (
                  current > thisStep ? 'bg-green-500 text-white' :
                  current === thisStep ? 'bg-black text-white' :
                  'bg-gray-200 text-gray-500'
                )}>
                  {current > thisStep ? 'checkmark' : i + 1}
                </div>
                <span className={"text-xs " + (current === thisStep ? 'text-gray-900 font-semibold' : 'text-gray-400')}>{s.label}</span>
                {i < 3 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            );
          })}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div
              {...getRootProps()}
              className={"border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all " + (
                isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black hover:bg-gray-50'
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium">{progress}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-5xl">seal</div>
                  <div>
                    <p className="font-bold text-gray-700 text-lg">Drop your file to seal it</p>
                    <p className="text-sm text-gray-400 mt-1">Images, videos, audio, documents — max 50MB</p>
                  </div>
                </div>
              )}
            </div>
            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'dna', title: 'Digital DNA', desc: 'Unique SHA-256 fingerprint' },
                { icon: 'ai', title: 'AI Analysis', desc: 'Deepfake and manipulation detection' },
                { icon: 'chain', title: 'Sealed File', desc: 'Download with identity embedded' },
              ].map(item => (
                <div key={item.title} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanned Step */}
        {step === 'scanned' && result && (
          <div className="space-y-4">
            {/* File summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">check</div>
                <div>
                  <p className="font-bold text-gray-900">{result.data.file_name}</p>
                  <p className="text-sm text-gray-500">Trust Score: <span className="font-bold text-gray-900">{result.data.trust_score}/100</span> · {result.data.rating}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Digital DNA (SHA-256)</p>
                <p className="font-mono text-xs text-gray-700 break-all">{result.data.sha256_hash}</p>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                <p className="font-mono text-sm text-blue-600 font-bold">{result.data.certificate_id}</p>
              </div>
            </div>

            {/* DOWNLOAD SEALED FILE */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Download Sealed File</h3>
              <p className="text-sm text-gray-500 mb-4">Your file with UHRATE identity embedded — the sealed file can be verified anywhere by uploading it to Lookup.</p>

              {/* Watermark choice */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setWithWatermark(true)}
                  className={"p-3 border-2 rounded-xl text-left transition-all " + (withWatermark ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400')}
                >
                  <p className="text-sm font-bold text-gray-900">With Badge</p>
                  <p className="text-xs text-gray-500">Small UHRATE stamp in corner</p>
                  <p className="text-xs text-green-600 mt-1">Visible proof of sealing</p>
                </button>
                <button
                  onClick={() => setWithWatermark(false)}
                  className={"p-3 border-2 rounded-xl text-left transition-all " + (!withWatermark ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400')}
                >
                  <p className="text-sm font-bold text-gray-900">Metadata Only</p>
                  <p className="text-xs text-gray-500">Identity hidden in file data</p>
                  <p className="text-xs text-blue-600 mt-1">No visual change</p>
                </button>
              </div>

              <button
                onClick={downloadSealedFile}
                disabled={downloading}
                className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {downloading ? 'Preparing sealed file...' : 'Download Sealed File'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Free download — UHRATE identity embedded in the file</p>
            </div>

            {/* BLOCKCHAIN DEPLOYMENT */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Permanent Blockchain Record (Optional)</h3>
              <p className="text-sm text-gray-500 mb-4">Add an immutable on-chain record for maximum proof. Pay platform fee + gas.</p>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Network</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SUPPORTED_CHAINS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedChain(c.id); setPayWithUHR(false); }}
                      className={"p-3 rounded-xl border-2 text-left transition-all " + (
                        selectedChain === c.id && !payWithUHR ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      <p className="text-sm font-semibold text-gray-900">{c.icon} {c.name}</p>
                      <p className="text-xs text-gray-500">Gas {c.gasEstimate}</p>
                    </button>
                  ))}
                </div>

                <p className="text-sm font-semibold text-gray-700 mb-2">Platform Fee</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setPayWithUHR(false)}
                    className={"p-3 rounded-xl border-2 text-left transition-all " + (!payWithUHR ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400')}
                  >
                    <p className="text-sm font-bold text-gray-900">${PLATFORM_FEE_USD}</p>
                    <p className="text-xs text-gray-500">Pay with {chain?.symbol}</p>
                  </button>
                  <button
                    onClick={() => setPayWithUHR(true)}
                    className={"p-3 rounded-xl border-2 text-left transition-all relative " + (payWithUHR ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400')}
                  >
                    <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-black text-white text-xs rounded-full font-bold">50% OFF</div>
                    <p className="text-sm font-bold text-gray-900">${PLATFORM_FEE_UHR_USD}</p>
                    <p className="text-xs text-gray-500">Pay with UHR token</p>
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">{chain?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee</span>
                    <span className="font-bold">{payWithUHR ? `$${PLATFORM_FEE_UHR_USD} in UHR` : `$${PLATFORM_FEE_USD} in ${chain?.symbol}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gas Fee</span>
                    <span className="text-gray-700">{chain?.gasEstimate} (paid to network)</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={sealOnBlockchain}
                  disabled={loading}
                  className="w-full py-3.5 border-2 border-black text-black rounded-xl text-sm font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deploying to blockchain...' : `Deploy to ${chain?.name} — Pay $${payWithUHR ? PLATFORM_FEE_UHR_USD + ' UHR' : PLATFORM_FEE_USD + ' ' + chain?.symbol}`}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Optional — the downloaded sealed file already carries UHRATE identity</p>
              </div>
            </div>
          </div>
        )}

        {/* Sealing Step */}
        {step === 'sealing' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Deploying to {chain?.name}...</h2>
            <p className="text-gray-500">Waiting for blockchain confirmation.</p>
          </div>
        )}

        {/* Sealed Step */}
        {step === 'sealed' && deployResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">seal</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">File Sealed on Blockchain!</h2>
              <p className="text-gray-600 mb-4">Permanent on-chain record created on {SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.name}.</p>
              <button
                onClick={() => window.open(`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`, '_blank')}
                className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors border-0 cursor-pointer"
              >
                View on Blockchain Explorer
              </button>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-left">
                <p className="text-xs text-gray-500 mb-1">Blockchain Transaction Hash</p>
                <p className="font-mono text-xs text-blue-600 break-all">{deployResult.txHash}</p>
              </div>
            </div>

            {/* Certificate ID — show prominently */}
            <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Your Certificate ID — save this for lookup</p>
              <p className="font-mono text-lg font-black text-yellow-400 break-all mb-3">{result?.data?.certificate_id}</p>
              <p className="text-xs text-gray-400">Use this ID to verify this file from any device at uhrate.online/lookup</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Download Your Sealed File</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setWithWatermark(true)}
                  className={"p-3 border-2 rounded-xl text-left transition-all " + (withWatermark ? 'border-black bg-gray-50' : 'border-gray-200')}
                >
                  <p className="text-sm font-bold text-gray-900">With Badge</p>
                  <p className="text-xs text-gray-500">Small UHRATE stamp in corner</p>
                </button>
                <button
                  onClick={() => setWithWatermark(false)}
                  className={"p-3 border-2 rounded-xl text-left transition-all " + (!withWatermark ? 'border-black bg-gray-50' : 'border-gray-200')}
                >
                  <p className="text-sm font-bold text-gray-900">Metadata Only</p>
                  <p className="text-xs text-gray-500">No visual change</p>
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadSealedFile}
                  disabled={downloading}
                  className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {downloading ? 'Preparing...' : 'Download Sealed File'}
                </button>
                <button onClick={downloadCertificate} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Download Certificate JSON
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 mb-2">Verify this sealed file anytime</p>
              <button onClick={() => window.location.href = '/lookup'} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                Go to Lookup
              </button>
            </div>

            <button
              onClick={() => { setStep('upload'); setFile(null); setResult(null); setDeployResult(null); setError(null); }}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Seal Another File
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
