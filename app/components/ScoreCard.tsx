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
  const [showShare, setShowShare] = useState(false);
  const [minting, setMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [nftResult, setNftResult] = useState<any>(null);

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
        params: [{ chainId: '0x38' }],
      }).catch(async (error: any) => {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed.binance.org'],
              blockExplorerUrls: ['https://bscscan.com'],
            }],
          });
        }
      });

      const tokenURIResponse = await fetch('/api/nft/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: data.certificate_id }),
      });

      const prepData = await tokenURIResponse.json();
      if (!tokenURIResponse.ok) throw new Error(prepData.error);

      const contractAddress = prepData.contractAddress;
      const abi = [
        "function mintCertificate(address to, string memory certificateId, string memory fileHash, string memory fileName, string memory rating, string memory tokenURIData) public returns (uint256)"
      ];

      const iface = new (await import('ethers')).Interface(abi);
      const txData = iface.encodeFunctionData('mintCertificate', [
        userAddress,
        prepData.certificateId,
        prepData.fileHash,
        prepData.fileName,
        prepData.rating,
        prepData.tokenURI,
      ]);

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: contractAddress,
          data: txData,
          value: '0x0',
        }],
      });

      const saveResponse = await fetch('/api/nft/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: data.certificate_id,
          txHash,
        }),
      });

      const saveData = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveData.error);

      setNftResult({ txHash });
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

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={downloadCertificate}
          className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Download Certificate
        </button>
        <button
          onClick={() => setShowShare(!showShare)}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Share Certificate
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

      {showShare && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Share your certificate</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                const text = "I just verified my file on UHRATE — the decentralized authenticity network. Certificate: " + data.certificate_id + " | Rating: " + data.rating + " | uhrate.xyz";
                window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), '_blank');
              }}
              className="flex flex-col items-center gap-2 p-3 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </button>
            <button
              onClick={() => {
                const text = "I verified my file on UHRATE — AI-powered authenticity verification with blockchain proof.\n\nCertificate: " + data.certificate_id + "\nRating: " + data.rating + "\nTrust Score: " + data.trust_score + "/100\n\nVerify at uhrate.xyz";
                window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://uhrate.xyz/verify") + "&summary=" + encodeURIComponent(text), '_blank');
              }}
              className="flex flex-col items-center gap-2 p-3 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
            <button
              onClick={() => {
                const text = "I verified my file on UHRATE!\n\nCertificate: " + data.certificate_id + "\nRating: " + data.rating + "\nTrust Score: " + data.trust_score + "/100\n\nVerify at: https://uhrate.xyz/verify";
                window.open("https://wa.me/?text=" + encodeURIComponent(text), '_blank');
              }}
              className="flex flex-col items-center gap-2 p-3 bg-green-500 text-white rounded-xl text-xs font-medium hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => {
                const text = "I verified my file on UHRATE!\n\nCertificate: " + data.certificate_id + "\nRating: " + data.rating + "\nTrust Score: " + data.trust_score + "/100\n\nVerify at: https://uhrate.xyz/verify";
                window.open("https://t.me/share/url?url=" + encodeURIComponent("https://uhrate.xyz/verify") + "&text=" + encodeURIComponent(text), '_blank');
              }}
              className="flex flex-col items-center gap-2 p-3 bg-blue-500 text-white rounded-xl text-xs font-medium hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>
        </div>
      )}

      {nftResult && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm font-medium text-purple-900 mb-1">NFT Certificate Minted!</p>
          <p
            onClick={() => window.open("https://bscscan.com/tx/" + nftResult.txHash, '_blank')}
            className="font-mono text-xs text-purple-600 hover:underline cursor-pointer truncate"
          >
            {nftResult.txHash}
          </p>
        </div>
      )}
    </div>
  );
}