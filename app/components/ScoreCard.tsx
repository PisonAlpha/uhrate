'use client';
import { useState } from 'react';
import { SUPPORTED_CHAINS, PLATFORM_FEE_USD, PLATFORM_FEE_UHR_USD, UHR_CONTRACT } from '@/lib/registry';

interface ScoreCardProps {
  result: any;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}/100</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors[color]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

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

export default function ScoreCard({ result }: ScoreCardProps) {
  const { data, dna, analysis } = result;
  const [showBlockchain, setShowBlockchain] = useState(false);
  const [selectedChain, setSelectedChain] = useState('bnb');
  const [payWithUHR, setPayWithUHR] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a';

  const chain = SUPPORTED_CHAINS.find(c => c.id === selectedChain)!;
  const fee = payWithUHR ? PLATFORM_FEE_UHR_USD : PLATFORM_FEE_USD;

  const deployToBlockchain = async () => {
    if (!window.ethereum) {
      setDeployError('Please install MetaMask to deploy to blockchain.');
      return;
    }
    setDeploying(true);
    setDeployError(null);
    try {
      // Switch to correct network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainIdHex }],
      }).catch(async (error: any) => {
        if (error.code === 4902) {
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
        // Pay with UHR token (BEP20 transfer on BNB chain)
        const uhrAmount = BigInt(Math.floor(PLATFORM_FEE_UHR_USD * 1e18)).toString(16);
        const transferFn = '0xa9059cbb';
        const toAddress = PAYMENT_WALLET.slice(2).padStart(64, '0');
        const amountHex = uhrAmount.padStart(64, '0');
        const data_hex = transferFn + toAddress + amountHex;

        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: userAddress,
            to: UHR_CONTRACT,
            data: data_hex,
            gas: '0x186A0',
          }],
        });
      } else {
        // Pay with native token — store document hash in transaction data
        const documentData = JSON.stringify({
          platform: 'UHRATE',
          certificate_id: data.certificate_id,
          sha256_hash: data.sha256_hash,
          file_name: data.file_name,
          rating: data.rating,
          trust_score: data.trust_score,
          timestamp: new Date().toISOString(),
        });
        const hexData = '0x' + Buffer.from(documentData).toString('hex');

        // Get ETH price to calculate fee in native token
        const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + chain.symbol + 'USDT').catch(() => null);
        let nativePrice = 300; // fallback
        if (priceRes?.ok) {
          const priceData = await priceRes.json();
          nativePrice = parseFloat(priceData.price) || 300;
        }

        const feeInNative = PLATFORM_FEE_USD / nativePrice;
        const feeWei = BigInt(Math.floor(feeInNative * 1e18)).toString(16);

        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: userAddress,
            to: PAYMENT_WALLET,
            value: '0x' + feeWei,
            data: hexData,
            gas: '0x30D40',
          }],
        });
      }

      // Save to database
      await fetch('/api/billing/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          chainId: selectedChain,
          userEmail: '',
          documentId: data.certificate_id,
        }),
      });

      setDeployResult({ txHash, chain: selectedChain });
      setDeployed(true);
    } catch (err: any) {
      if (err.code === 4001) {
        setDeployError('Transaction cancelled.');
      } else {
        setDeployError(err.message || 'Deployment failed. Please try again.');
      }
    } finally {
      setDeploying(false);
    }
  };

  const downloadCertificate = () => {
    const cert = {
      certificate_id: data.certificate_id,
      file_name: data.file_name,
      file_type: data.file_type,
      file_size: data.file_size,
      sha256_hash: data.sha256_hash,
      originality_score: data.originality_score,
      ai_score: data.ai_score,
      deepfake_score: data.deepfake_score,
      manipulation_score: data.manipulation_score,
      trust_score: data.trust_score,
      rating: data.rating,
      issued_at: data.created_at,
      digital_dna: dna,
      blockchain: deployResult || null,
      platform: 'UHRATE — Decentralized Authenticity Network',
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uhrate_certificate_${data.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {result.cached && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          This file has been verified before. Showing existing record.
        </div>
      )}

      {/* Main Result Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{data.file_name}</h3>
            <p className="text-sm text-gray-500 mt-1">{data.file_type} · {(data.file_size / 1024).toFixed(1)} KB</p>
          </div>
          <span className={"px-3 py-1 rounded-full text-sm font-medium border self-start whitespace-nowrap " + getRatingStyle(data.rating)}>
            {data.rating}
          </span>
        </div>

        <ScoreBar label="Originality Score" value={data.originality_score} color="green" />
        <ScoreBar label="AI Generation Probability" value={data.ai_score} color="amber" />
        <ScoreBar label="Deepfake Risk" value={data.deepfake_score} color="red" />
        <ScoreBar label="Manipulation Score" value={data.manipulation_score} color="blue" />

        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Trust Score</span>
            <span className={"text-2xl font-black " + (
              data.trust_score >= 70 ? 'text-green-600' :
              data.trust_score >= 40 ? 'text-amber-600' : 'text-red-600'
            )}>{data.trust_score}/100</span>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">AI Analysis</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis}</p>
        </div>
      )}

      {/* Digital DNA */}
      {dna && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Digital DNA Fingerprint</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(dna).slice(0, 6).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">UHRATE Certificate</h4>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Issued</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Certificate ID</span>
            <span className="font-mono text-sm text-blue-600">{data.certificate_id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">SHA-256 Hash</span>
            <span className="font-mono text-xs text-gray-600 truncate max-w-48">{data.sha256_hash?.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Issued At</span>
            <span className="text-sm text-gray-700">{new Date(data.created_at).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={downloadCertificate}
          className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ↓ Download Certificate (JSON)
        </button>
      </div>

      {/* Blockchain Identity */}
      <div className="bg-white border-2 border-black rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-900">⛓ Blockchain Identity</h4>
          {deployed && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ On-Chain</span>}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Give this document a permanent, immutable identity on the blockchain. Verifiable by anyone, anywhere, forever.
        </p>

        {deployed && deployResult ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-1">✓ Successfully deployed on-chain!</p>
              <p className="text-xs text-green-600">Your document now has a permanent blockchain identity.</p>
            </div>
            <a
              href={`${SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.explorer}/tx/${deployResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-black text-white rounded-xl text-sm font-medium text-center hover:bg-gray-800 transition-colors"
            >
              View on {SUPPORTED_CHAINS.find(c => c.id === deployResult.chain)?.name} Explorer ↗
            </a>
            <button onClick={downloadCertificate} className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              ↓ Download Full Certificate with Blockchain Proof
            </button>
          </div>
        ) : (
          <>
            {!showBlockchain ? (
              <button
                onClick={() => setShowBlockchain(true)}
                className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Deploy to Blockchain →
              </button>
            ) : (
              <div className="space-y-4">
                {/* Chain Selection */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Network</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_CHAINS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedChain(c.id); setPayWithUHR(false); }}
                        className={"p-3 rounded-xl border-2 text-left transition-all " + (
                          selectedChain === c.id && !payWithUHR
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        )}
                      >
                        <p className="text-sm font-semibold text-gray-900">{c.icon} {c.name}</p>
                        <p className="text-xs text-gray-500">Gas {c.gasEstimate}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Platform Fee</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPayWithUHR(false)}
                      className={"p-3 rounded-xl border-2 text-left transition-all " + (
                        !payWithUHR ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      <p className="text-sm font-bold text-gray-900">${PLATFORM_FEE_USD}</p>
                      <p className="text-xs text-gray-500">Pay with {chain.symbol}</p>
                    </button>
                    <button
                      onClick={() => setPayWithUHR(true)}
                      className={"p-3 rounded-xl border-2 text-left transition-all relative " + (
                        payWithUHR ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-black text-white text-xs rounded-full font-bold">50% OFF</div>
                      <p className="text-sm font-bold text-gray-900">${PLATFORM_FEE_UHR_USD}</p>
                      <p className="text-xs text-gray-500">Pay with UHR token</p>
                    </button>
                  </div>
                  {payWithUHR && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700">
                        UHR payment only on BNB Chain. <button onClick={() => window.location.href = '/presale'} className="underline bg-transparent border-0 cursor-pointer text-amber-700 font-semibold">Get UHR in presale →</button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">{chain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee</span>
                    <span className="font-bold">{payWithUHR ? `$${PLATFORM_FEE_UHR_USD} in UHR` : `$${PLATFORM_FEE_USD} in ${chain.symbol}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gas Fee</span>
                    <span className="text-gray-700">{chain.gasEstimate} (paid to network)</span>
                  </div>
                </div>

                {deployError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {deployError}
                  </div>
                )}

                <button
                  onClick={deployToBlockchain}
                  disabled={deploying}
                  className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {deploying ? 'Deploying to blockchain...' : `Deploy — Pay $${payWithUHR ? PLATFORM_FEE_UHR_USD + ' UHR' : PLATFORM_FEE_USD + ' ' + chain.symbol} + Gas`}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  You pay both the platform fee and network gas fee. UHRATE does not cover any costs.
                </p>

                <button
                  onClick={() => setShowBlockchain(false)}
                  className="w-full py-2 text-gray-400 text-sm bg-transparent border-0 cursor-pointer hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}