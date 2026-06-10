'use client';
import { useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BlockchainLink({ tx }: { tx: string | null }) {
  if (!tx) return <p className="text-xs text-gray-500 mt-0.5">Permanent proof record created</p>;
  const url = "https://testnet.bscscan.com/tx/" + tx;
  return (
    <p
      onClick={() => window.open(url, '_blank')}
      className="text-xs text-blue-600 hover:underline font-mono mt-0.5 block truncate cursor-pointer"
    >
      {tx}
    </p>
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
  const [minting, setMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftResult, setNftResult] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleMintNFT = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to mint NFTs');
        return;
      }

      setMinting(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const userAddress = accounts[0];

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

      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: data.certificate_id,
          recipientAddress: userAddress,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setNftResult(result);
      setNftMinted(true);
    } catch (err: any) {
      alert('Minting failed: ' + err.message);
    } finally {
      setMinting(false);
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
      blockchain_chain: data.blockchain_chain,
      issued_at: data.created_at,
      digital_dna: dna,
      platform: 'UHRATE — Decentralized Authenticity Network',
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "uhrate_certificate_" + data.certificate_id + ".json";
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

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{data.file_name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data.file_type} · {(data.file_size / 1024).toFixed(1)} KB
            </p>
          </div>
          <span className={"px-3 py-1 rounded-full text-sm font-medium border " + getRatingStyle(data.rating)}>
            {data.rating}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Confidence Scores</h4>
          <ScoreBar label="Originality score" value={data.originality_score} color="green" />
          <ScoreBar label="AI probability" value={data.ai_score} color="amber" />
          <ScoreBar label="Deepfake risk" value={data.deepfake_score} color="red" />
          <ScoreBar label="Manipulation score" value={data.manipulation_score} color="blue" />
          <ScoreBar label="Trust score" value={data.trust_score} color="purple" />
        </div>

        {analysis?.summary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{analysis.summary}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Digital DNA</h4>
        <div className="space-y-3 font-mono text-xs text-gray-500 break-all">
          <div>
            <span className="text-gray-900 font-medium">SHA-256</span>
            <p className="mt-1">{dna?.sha256 || data.sha256_hash}</p>
          </div>
          <div>
            <span className="text-gray-900 font-medium">Perceptual Hash</span>
            <p className="mt-1">{dna?.perceptual}</p>
          </div>
          <div>
            <span className="text-gray-900 font-medium">Certificate ID</span>
            <p className="mt-1 text-blue-600">{data.certificate_id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Blockchain Registration</h4>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Registered on {data.blockchain_chain}</p>
            <BlockchainLink tx={data.blockchain_tx} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={downloadCertificate}
          className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Download Certificate
        </button>
        <button
          onClick={handleMintNFT}
          disabled={minting || nftMinted}
          className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {minting ? 'Minting...' : nftMinted ? 'NFT Minted!' : 'Mint NFT'}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Verify Another File
        </button>
      </div>
      {nftResult && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm font-medium text-purple-900 mb-1">NFT Certificate Minted!</p>
          <p
            onClick={() => window.open("https://testnet.bscscan.com/tx/" + nftResult.txHash, '_blank')}
            className="font-mono text-xs text-purple-600 hover:underline cursor-pointer truncate"
          >
            {nftResult.txHash}
          </p>
        </div>
      )}
    </div>
  );
}