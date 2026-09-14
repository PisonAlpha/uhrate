'use client';

import { useState, useEffect } from 'react';

const SWAP_WALLET = '0x6c55d7594a3a85cc142095153faeb9f5042c7863';
const UHR_CONTRACT = '0xFD8723F83F5A441EdB231F2ef1f89113B481E447';
const USDT_BEP20 = '0x55d398326f99059fF775485246999027B3197955';
const SWAP_PRICE = 0.02;
const BNB_CHAIN_ID = '0x38';

export default function Swap() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [uhrAmount, setUhrAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'connect' | 'swap' | 'success'>('connect');

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStep('swap');
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
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
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setStep('swap');
    } catch (err: any) {
      setError(err.code === 4001 ? 'Connection cancelled.' : 'Failed to connect wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsdtChange = (val: string) => {
    setUsdtAmount(val);
    const usdt = parseFloat(val) || 0;
    setUhrAmount(usdt > 0 ? Math.floor(usdt / SWAP_PRICE).toLocaleString() : '');
  };

  const executeSwap = async () => {
    if (!walletAddress || !usdtAmount || parseFloat(usdtAmount) <= 0) {
      setError('Please enter a valid USDT amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const amount = parseFloat(usdtAmount);
      const amountWei = BigInt(Math.floor(amount * 1e18)).toString(16);
      const transferFn = '0xa9059cbb';
      const toAddress = SWAP_WALLET.slice(2).padStart(64, '0');
      const amountHex = amountWei.padStart(64, '0');
      const data = transferFn + toAddress + amountHex;

      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: USDT_BEP20,
          data,
          gas: '0x186A0',
        }],
      });

      setTxHash(tx);
      setStep('success');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Transaction cancelled.');
      } else {
        setError('Transaction failed. Make sure you have enough USDT (BEP20).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/presale'} className="text-sm text-red-600 font-semibold bg-transparent border-0 cursor-pointer">🔥 Presale</button>
            <button onClick={() => window.location.href = '/tokenomics'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Tokenomics</button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Buy UHR Token</h1>
          <p className="text-gray-500">Swap USDT for UHR at a fixed price</p>
        </div>

        {/* Price comparison */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-xs text-red-500 font-semibold mb-1">🔥 PRESALE PRICE</p>
            <p className="text-2xl font-black text-red-600">$0.01</p>
            <p className="text-xs text-red-400">per UHR</p>
            <button onClick={() => window.location.href = '/presale'} className="mt-2 text-xs text-red-600 underline bg-transparent border-0 cursor-pointer">
              Join Presale →
            </button>
          </div>
          <div className="bg-black rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 font-semibold mb-1">SWAP PRICE</p>
            <p className="text-2xl font-black text-white">$0.02</p>
            <p className="text-xs text-gray-400">per UHR</p>
            <p className="text-xs text-green-400 mt-2">Current Rate</p>
          </div>
        </div>

        {/* Swap Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-6">
          {step === 'connect' && (
            <div className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet to Swap</h2>
              <p className="text-gray-500 text-sm mb-8">Connect MetaMask on BNB Smart Chain. Swap USDT (BEP20) for UHR tokens at $0.02 per UHR.</p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button onClick={connectWallet} disabled={loading} className="w-full py-4 bg-black text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
              </button>
            </div>
          )}

          {step === 'swap' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Swap USDT → UHR</h2>
                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">You Pay</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={usdtAmount}
                      onChange={e => handleUsdtChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black pr-20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-gray-500 font-semibold text-sm">USDT</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-lg">↓</div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">You Receive</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={uhrAmount}
                      readOnly
                      placeholder="0"
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-4 text-xl font-black text-black focus:outline-none pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">UHR</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate</span>
                  <span className="text-gray-900 font-medium">1 USDT = 50 UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per UHR</span>
                  <span className="text-gray-900 font-bold">$0.02</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <span className="text-gray-900">BNB Smart Chain</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">{error}</p>}

              <button
                onClick={executeSwap}
                disabled={loading || !usdtAmount || parseFloat(usdtAmount) <= 0}
                className="w-full py-4 bg-black text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Swap for ${uhrAmount || '0'} UHR →`}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Swap Complete!</h2>
              <p className="text-gray-500 text-sm mb-6">Your USDT has been sent. UHR tokens will be delivered to your wallet shortly.</p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-blue-600 hover:underline break-all">
                  {txHash}
                </a>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800 text-left">
                <p className="font-bold mb-1">📌 Add UHR to MetaMask:</p>
                <p className="font-mono text-xs break-all">{UHR_CONTRACT}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep('swap'); setTxHash(null); setUsdtAmount(''); setUhrAmount(''); }} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Swap More
                </button>
                <button onClick={() => window.open(`https://bscscan.com/tx/${txHash}`, '_blank')} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  View on BSCScan
                </button>
              </div>
            </div>
          )}
        </div>

               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
          ⚠️ Only send USDT on BNB Smart Chain (BEP20). Verify the contract address before transacting.
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">What is UHR used for?</h3>
          <div className="space-y-3">
            {[
              { icon: '💸', title: 'Cheaper Deployments', desc: 'Pay just $0.10 in UHR to deploy documents on-chain instead of $0.20 in ETH/BNB — 50% cheaper.' },
              { icon: '🔥', title: 'Fee Burn', desc: '10% of all UHR collected as platform fees is permanently burned — reducing supply over time.' },
             
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 py-2 border-b border-gray-50">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}