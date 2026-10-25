"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const SWAP_CONTRACT_ADDRESS = "0xb30EBA845C4169bee13C049FcC928d9543e3cD58";
const UHR_TOKEN_ADDRESS = "0xFD8723F83F5A441EdB231F2ef1f89113B481E447";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const SWAP_ABI = [
  "function buyUHR(uint256 uhrAmount) external",
  "function getUHRBalance() external view returns (uint256)",
  "function getUSDTCost(uint256 uhrAmount) external pure returns (uint256)",
  "function paused() external view returns (bool)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

type Step = "connect" | "approve" | "buy" | "success";

const BSC_CHAIN_ID = "0x38";
const BSC_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"],
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function SwapPage() {
  const [step, setStep] = useState<Step>("connect");
  const [account, setAccount] = useState("");
  const [uhrInput, setUhrInput] = useState("");
  const [usdtCost, setUsdtCost] = useState("0.00");
  const [userUsdtBalance, setUserUsdtBalance] = useState("—");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [buyTxHash, setBuyTxHash] = useState<string | null>(null);
  const [confirmedUhrAmount, setConfirmedUhrAmount] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchUserBalance = useCallback(async (addr: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
      const raw: bigint = await usdt.balanceOf(addr);
      setUserUsdtBalance((Number(raw) / 1e18).toFixed(2));
    } catch {}
  }, []);

  useEffect(() => {
    const val = parseFloat(uhrInput);
    if (!isNaN(val) && val > 0) {
      setUsdtCost((val * 0.02).toFixed(2));
    } else {
      setUsdtCost("0.00");
    }
  }, [uhrInput]);

  async function connectWallet() {
    setError("");
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = "https://metamask.app.link/dapp/uhrate.online/swap";
        return;
      }
      setError("MetaMask not found. Please install MetaMask extension.");
      return;
    }
    setLoading(true);
    try {
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
      } catch (switchErr: unknown) {
        const e = switchErr as { code?: number };
        if (e?.code === 4902) {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BSC_PARAMS] });
        } else throw switchErr;
      }
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      await fetchUserBalance(accounts[0]);
      setStep("approve");
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      setError(e?.code === 4001 ? "Connection cancelled." : "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  }

  async function approveUSDT() {
    setError("");
    const val = parseFloat(uhrInput);
    if (isNaN(val) || val <= 0) { setError("Enter a valid UHR amount."); return; }
    if (!Number.isInteger(val)) { setError("UHR amount must be a whole number."); return; }

    setLoading(true);
    setStatusMsg("Confirm USDT approval in MetaMask…");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

      const uhrWei = ethers.parseEther(uhrInput);
      const usdtWei = (uhrWei * BigInt(2e16)) / BigInt(1e18);

      const existing: bigint = await usdt.allowance(account, SWAP_CONTRACT_ADDRESS);
      if (existing >= usdtWei) {
        setConfirmedUhrAmount(uhrInput);
        setApproveTxHash("already_approved");
        setStep("buy");
        setStatusMsg("");
        setLoading(false);
        return;
      }

      const tx = await usdt.approve(SWAP_CONTRACT_ADDRESS, usdtWei);
      setStatusMsg(`Approval submitted — waiting for confirmation…`);
      await tx.wait();
      setApproveTxHash(tx.hash);
      setConfirmedUhrAmount(uhrInput);
      setStep("buy");
      setStatusMsg("");
    } catch (err: unknown) {
      const e = err as { code?: number; reason?: string; message?: string };
      setError(e?.code === 4001 ? "Approval cancelled." : e?.reason ?? e?.message ?? "Approval failed.");
    } finally {
      setLoading(false);
    }
  }

  async function buyUHR() {
    setError("");
    setLoading(true);
    setStatusMsg("Confirm swap transaction in MetaMask…");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const swap = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SWAP_ABI, signer);

      const uhrWei = ethers.parseEther(confirmedUhrAmount);
      const tx = await swap.buyUHR(uhrWei);
      setStatusMsg("Transaction submitted — waiting for confirmation…");
      await tx.wait();
      setBuyTxHash(tx.hash);
      await fetchUserBalance(account);
      setStep("success");
      setStatusMsg("");
    } catch (err: unknown) {
      const e = err as { code?: number; reason?: string; message?: string; data?: { message?: string } };
      setError(
        e?.code === 4001 ? "Transaction cancelled." :
        e?.reason ?? e?.data?.message ?? e?.message ?? "Transaction failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("approve");
    setUhrInput("");
    setUsdtCost("0.00");
    setError("");
    setApproveTxHash(null);
    setBuyTxHash(null);
    setConfirmedUhrAmount("");
    setStatusMsg("");
    fetchUserBalance(account);
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/tokenomics'} className="text-sm text-gray-500 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Tokenomics</button>
            <button onClick={() => window.location.href = '/seal'} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors border-0 cursor-pointer">Seal a Document</button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold mb-6">
            🔄 UHR Token Swap
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Buy UHR Tokens</h1>
          <p className="text-gray-500 text-base">Fixed price · $0.02 per UHR · Instant on-chain delivery</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-gray-900">$0.02</p>
            <p className="text-xs text-gray-500 mt-1">UHR Price</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-gray-900">Instant</p>
            <p className="text-xs text-gray-500 mt-1">Token Delivery</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-6">

          {/* CONNECT */}
          {step === "connect" && (
            <div className="text-center">
              <div className="text-5xl mb-4">🦊</div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-500 text-sm mb-8">Connect MetaMask on BNB Smart Chain. You will need USDT (BEP20) to buy UHR.</p>
              {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">{error}</p>}
              <button onClick={connectWallet} disabled={loading} className="w-full py-4 bg-black text-white rounded-xl text-base font-black hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? "Connecting…" : "🦊 Connect MetaMask"}
              </button>
            </div>
          )}

          {/* APPROVE */}
          {step === "approve" && (
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Connected: <span className="font-mono text-gray-600">{shortAddr(account)}</span>
                {userUsdtBalance !== "—" && <span className="ml-auto text-gray-400">USDT Balance: <strong className="text-gray-700">${userUsdtBalance}</strong></span>}
              </div>

              <h2 className="text-xl font-black text-gray-900 mb-6">Buy UHR Tokens</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">You Pay (USDT BEP20)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={usdtCost === "0.00" ? "" : usdtCost}
                      onChange={e => {
                        const usdt = parseFloat(e.target.value) || 0;
                        setUsdtCost(e.target.value);
                        setUhrInput(usdt > 0 ? String(Math.floor(usdt / 0.02)) : "");
                      }}
                      placeholder="0.00"
                      min="0"
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-xl font-bold focus:outline-none focus:border-black transition-colors pr-20 placeholder-gray-300"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">USDT</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">↓</div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">You Receive (UHR) — Instantly</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={uhrInput}
                      onChange={e => {
                        setUhrInput(e.target.value);
                        const val = parseFloat(e.target.value) || 0;
                        setUsdtCost(val > 0 ? (val * 0.02).toFixed(2) : "0.00");
                      }}
                      placeholder="0"
                      min="0"
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-xl font-black focus:outline-none focus:border-black transition-colors pr-16 placeholder-gray-300"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">UHR</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate</span>
                  <span className="text-gray-900">1 USDT = 50 UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="font-bold text-gray-900">$0.02 per UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-green-600 font-bold">⚡ Instant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <span className="text-gray-900">BNB Smart Chain</span>
                </div>
              </div>

              {statusMsg && <p className="text-sm text-blue-600 bg-blue-50 rounded-xl px-4 py-3 mb-4">{statusMsg}</p>}
              {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">{error}</p>}

              <button onClick={approveUSDT} disabled={loading || !uhrInput || parseFloat(uhrInput) <= 0} className="w-full py-4 bg-black text-white rounded-xl text-base font-black hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? "Approving…" : `Step 1: Approve ${usdtCost !== "0.00" ? usdtCost : "0"} USDT`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">First approve USDT spending, then buy UHR in the next step</p>
            </div>
          )}

          {/* BUY */}
          {step === "buy" && (
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Connected: <span className="font-mono text-gray-600">{shortAddr(account)}</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-4">Confirm Swap</h2>

              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center mb-6">
                <p className="text-green-700 text-sm font-semibold">✓ USDT Approved — Ready to buy!</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">You Send</span>
                  <span className="font-bold text-gray-900">{(parseFloat(confirmedUhrAmount) * 0.02).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">You Receive</span>
                  <span className="font-bold text-gray-900">{confirmedUhrAmount} UHR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="text-gray-900">$0.02 / UHR</span>
                </div>
              </div>

              {approveTxHash && approveTxHash !== "already_approved" && (
                <a href={`https://bscscan.com/tx/${approveTxHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 rounded-xl px-4 py-2 mb-4 hover:bg-blue-100 transition-colors">
                  <span>Approval TX</span>
                  <span className="font-mono underline">{approveTxHash.slice(0, 10)}…{approveTxHash.slice(-6)} ↗</span>
                </a>
              )}
              {approveTxHash === "already_approved" && (
                <p className="text-xs text-green-600 mb-4">✓ Existing allowance sufficient — no approval needed.</p>
              )}

              {statusMsg && <p className="text-sm text-blue-600 bg-blue-50 rounded-xl px-4 py-3 mb-4">{statusMsg}</p>}
              {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">{error}</p>}

              <button onClick={buyUHR} disabled={loading} className="w-full py-4 bg-black text-white rounded-xl text-base font-black hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? "Processing…" : `Step 2: Buy ${confirmedUhrAmount} UHR → Instant`}
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Swap Complete!</h2>
              <p className="text-gray-500 mb-6">
                <span className="font-bold text-gray-900">{confirmedUhrAmount} UHR</span> tokens have been sent to your wallet.
              </p>

              {buyTxHash && (
                <a href={`https://bscscan.com/tx/${buyTxHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 rounded-xl px-4 py-3 mb-4 hover:bg-blue-100 transition-colors">
                  <span>Swap Transaction</span>
                  <span className="font-mono underline">{buyTxHash.slice(0, 10)}…{buyTxHash.slice(-6)} ↗</span>
                </a>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-gray-700 mb-1">📌 Add UHR to MetaMask:</p>
                <p className="font-mono text-xs text-gray-500 break-all">{UHR_TOKEN_ADDRESS}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Buy More</button>
                <button onClick={() => window.location.href = '/seal'} className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Seal a Document →</button>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">What is UHR used for?</h3>
          <div className="space-y-4">
            {[
              { step: "1", title: "Buy UHR", desc: "Get UHR tokens at $0.02 each from this swap" },
              { step: "2", title: "Seal Documents", desc: "Pay with UHR to seal documents on the blockchain — save 50% vs paying with ETH/BNB" },
              { step: "3", title: "Verify Anywhere", desc: "Your sealed documents can be verified by anyone, anywhere, forever" },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{item.step}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          ⚠️ Only send USDT on BNB Smart Chain (BEP20). Swap contract: <span className="font-mono text-xs break-all">{SWAP_CONTRACT_ADDRESS}</span>
        </div>
      </div>
    </main>
  );
}