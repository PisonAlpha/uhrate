'use client';

import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

const PRESALE_CONTRACT = '0xaDE648982c4ABceB02A48BE71B71C45580f6Ca08';
const UHR_CONTRACT = '0xFD8723F83F5A441EdB231F2ef1f89113B481E447';
const USDT_BEP20 = '0x55d398326f99059fF775485246999027B3197955';
const PRESALE_PRICE = 0.01;
const TOTAL_TOKENS = 80000000;
const BNB_CHAIN_ID = '0x38';

// ERC20 ABI fragments
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

const PRESALE_ABI = [
  'function buyTokens(uint256 usdtAmount) external',
  'function getUHRAmount(uint256 usdtAmount) view returns (uint256)',
  'function getRemainingUHR() view returns (uint256)',
  'function getPresaleInfo() view returns (bool active, uint256 sold, uint256 available, uint256 raised, uint256 price)',
];

export default function Presale() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [uhrAmount, setUhrAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'connect' | 'approve' | 'buy' | 'success'>('connect');
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [tokensSold, setTokensSold] = useState(12450000);
  const [totalRaised, setTotalRaised] = useState(0);
  const [presaleActive, setPresaleActive] = useState(true);

  const progressPct = Math.min(Math.round((tokensSold / TOTAL_TOKENS) * 100), 100);

  useEffect(() => {
    fetchPresaleStats();
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStep('approve');
        }
      });
    }
  }, []);

  const fetchPresaleStats = async () => {
    try {
      // Fetch from Supabase
      const { data } = await fetch('/api/presale/stats').then(r => r.json()).catch(() => ({ data: null }));
      if (data?.tokensSold) setTokensSold(data.tokensSold);
      if (data?.totalRaised) setTotalRaised(data.totalRaised);
    } catch {}
  };

  const switchToBNB = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BNB_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BNB_CHAIN_ID,
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await switchToBNB();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setStep('approve');
    } catch (err: any) {
      setError(err.code === 4001 ? 'Connection cancelled.' : 'Failed to connect wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsdtChange = (val: string) => {
    setUsdtAmount(val);
    const usdt = parseFloat(val) || 0;
    setUhrAmount(usdt > 0 ? Math.floor(usdt / PRESALE_PRICE).toLocaleString() : '');
    setApproved(false);
  };

  const approveUSDT = async () => {
    if (!walletAddress || !usdtAmount || parseFloat(usdtAmount) <= 0) {
      setError('Please enter a valid USDT amount first.');
      return;
    }
    setApproving(true);
    setError(null);
    try {
      await switchToBNB();

      const amount = parseFloat(usdtAmount);
      const amountInWei = BigInt(Math.floor(amount * 1e6)); // USDT has 6 decimals
      const amountHex = '0x' + amountInWei.toString(16).padStart(64, '0');

            const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const usdtContract = new ethers.Contract(
        USDT_BEP20,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );

      const usdtAmountWei = ethers.parseUnits(amount.toString(), 18);
      const approveTx = await usdtContract.approve(PRESALE_CONTRACT, usdtAmountWei);
      await approveTx.wait();

      setApproving(false);
      setApproved(true);
      setStep('buy');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Approval cancelled.');
      } else {
        setError('Approval failed. Please try again.');
      }
      setApproving(false);
    }
  };

  const buyTokens = async () => {
    if (!walletAddress || !usdtAmount || parseFloat(usdtAmount) <= 0) {
      setError('Please enter a valid USDT amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await switchToBNB();

      const amount = parseFloat(usdtAmount);
      const amountInWei = BigInt(Math.floor(amount * 1e6));
      const amountHex = '0x' + amountInWei.toString(16).padStart(64, '0');

            const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const presaleContract = new ethers.Contract(
        PRESALE_CONTRACT,
        ['function buyTokens(uint256 usdtAmount) external'],
        signer
      );

      const usdtAmountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await presaleContract.buyTokens(usdtAmountWei, {
        gasLimit: 300000,
      });
      await tx.wait();
      const txReceipt = tx.hash;

            setTxHash(txReceipt);

      // Record in Supabase
      await fetch('/api/presale/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          usdtAmount: amount,
          uhrAmount: Math.floor(amount / PRESALE_PRICE),
          txHash: txReceipt,
        }),
      });

      // Update progress
      setTokensSold(prev => prev + Math.floor(amount / PRESALE_PRICE));
      setStep('success');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Transaction cancelled.');
      } else {
        setError('Purchase failed. Make sure you approved USDT first and have enough balance.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-white">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/tokenomics'} className="text-sm text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">Tokenomics</button>
            <button onClick={() => window.location.href = '/swap'} className="text-sm text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">Buy UHR</button>
            {walletAddress && (
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-6">
            🔥 Presale Live Now
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">UHR Token Presale</h1>
          <p className="text-gray-400 text-lg mb-2">Get UHR at the lowest possible price</p>
          <p className="text-3xl font-black text-yellow-400">$0.01 <span className="text-gray-500 text-base font-normal">per UHR</span></p>
        </div>

        {/* Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-400">Presale Progress</span>
            <span className="text-white font-bold">{progressPct}% Sold</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: progressPct + '%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{tokensSold.toLocaleString()} UHR sold</span>
            <span>{TOTAL_TOKENS.toLocaleString()} UHR total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Presale Price', value: '$0.01' },
            { label: 'Listing Price', value: '$0.02' },
            { label: 'Remaining', value: ((TOTAL_TOKENS - tokensSold) / 1000000).toFixed(1) + 'M UHR' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xl font-black text-yellow-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">

          {/* Step indicator */}
          {step !== 'connect' && step !== 'success' && (
            <div className="flex items-center gap-2 mb-6">
              {[
                { key: 'approve', label: '1. Enter Amount & Approve' },
                { key: 'buy', label: '2. Buy UHR' },
              ].map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold " + (
                    (step === 'buy' && i === 0) || step === s.key
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 text-gray-400'
                  )}>
                    {step === 'buy' && i === 0 ? '✓' : i + 1}
                  </div>
                  <span className={"text-xs " + (step === s.key ? 'text-white font-semibold' : 'text-gray-500')}>{s.label}</span>
                  {i === 0 && <span className="text-gray-600 mx-1">→</span>}
                </div>
              ))}
            </div>
          )}

          {step === 'connect' && (
            <div className="text-center">
              <div className="text-5xl mb-4">👛</div>
              <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 text-sm mb-8">Connect MetaMask on BNB Smart Chain. You will need USDT (BEP20) to participate.</p>
              {error && <p className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-xl">{error}</p>}
              <button onClick={connectWallet} disabled={loading} className="w-full py-4 bg-yellow-400 text-black rounded-xl text-base font-black hover:bg-yellow-300 transition-colors disabled:opacity-50">
                {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
              </button>
              <p className="text-xs text-gray-600 mt-4">Make sure you have USDT (BEP20) in your wallet</p>
            </div>
          )}

          {(step === 'approve' || step === 'buy') && (
            <div>
              <h2 className="text-xl font-bold mb-6">Buy UHR Tokens</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">You Pay (USDT BEP20)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={usdtAmount}
                      onChange={e => handleUsdtChange(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-xl font-bold focus:outline-none focus:border-yellow-400 transition-colors pr-20 placeholder-gray-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">USDT</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Minimum: $1 · Maximum: $10,000</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400">↓</div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">You Receive (UHR) — Instantly</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={uhrAmount}
                      readOnly
                      placeholder="0"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-xl font-black focus:outline-none pr-16 placeholder-gray-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">UHR</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">1 USDT = 100 UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Presale Price</span>
                  <span className="text-yellow-400 font-bold">$0.01 per UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distribution</span>
                  <span className="text-green-400 font-bold">⚡ Instant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">BNB Smart Chain</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-xl">{error}</p>}

              {step === 'approve' && (
                <div className="space-y-3">
                  <button
                    onClick={approveUSDT}
                    disabled={approving || !usdtAmount || parseFloat(usdtAmount) < 1}
                    className="w-full py-4 bg-yellow-400 text-black rounded-xl text-base font-black hover:bg-yellow-300 transition-colors disabled:opacity-50"
                  >
                    {approving ? 'Approving USDT...' : `Step 1: Approve ${usdtAmount || '0'} USDT`}
                  </button>
                  <p className="text-xs text-gray-500 text-center">First approve USDT spending, then buy UHR in the next step</p>
                </div>
              )}

              {step === 'buy' && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                    <p className="text-green-400 text-sm font-semibold">✓ USDT Approved — Ready to buy!</p>
                  </div>
                  <button
                    onClick={buyTokens}
                    disabled={loading}
                    className="w-full py-4 bg-green-500 text-white rounded-xl text-base font-black hover:bg-green-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Step 2: Buy ${uhrAmount || '0'} UHR → Instant`}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
              <h2 className="text-2xl font-black mb-2">UHR Tokens Received!</h2>
              <p className="text-gray-400 mb-6">Your UHR tokens have been sent instantly to your wallet.</p>
              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-yellow-400 hover:underline break-all">{txHash}</a>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 mb-6 text-sm text-yellow-300 text-left">
                <p className="font-bold mb-1">📌 Add UHR to MetaMask:</p>
                <p className="font-mono text-xs break-all">{UHR_CONTRACT}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep('approve'); setTxHash(null); setUsdtAmount(''); setUhrAmount(''); setApproved(false); }} className="flex-1 py-3 border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">
                  Buy More
                </button>
                <button onClick={() => window.open(`https://bscscan.com/tx/${txHash}`, '_blank')} className="flex-1 py-3 bg-yellow-400 text-black rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors">
                  View on BSCScan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4">How the Presale Works</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Connect MetaMask', desc: 'Connect your wallet on BNB Smart Chain' },
              { step: '2', title: 'Approve USDT', desc: 'Allow the presale contract to spend your USDT' },
              { step: '3', title: 'Buy UHR', desc: 'Contract sends UHR to your wallet instantly — 1 USDT = 100 UHR' },
              { step: '4', title: 'Use on UHRATE', desc: 'Pay $0.10 in UHR for document deployments (vs $0.20)' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{item.step}</div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
          ⚠️ Only send USDT on BNB Smart Chain (BEP20). Verify the contract address before transacting. Presale contract: <span className="font-mono text-xs break-all">{PRESALE_CONTRACT}</span>
        </div>
      </div>
    </main>
  );
}