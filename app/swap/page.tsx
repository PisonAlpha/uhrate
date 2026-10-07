"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ── Contract addresses ──────────────────────────────────────────────────────
const SWAP_CONTRACT_ADDRESS = "0xb30EBA845C4169bee13C049FcC928d9543e3cD58";
const UHR_TOKEN_ADDRESS = "0xFD8723F83F5A441EdB231F2ef1f89113B481E447";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// ── ABIs ────────────────────────────────────────────────────────────────────
const SWAP_ABI = [
  "function buyUHR(uint256 uhrAmount) external",
  "function getUHRBalance() external view returns (uint256)",
  "function getUSDTCost(uint256 uhrAmount) external pure returns (uint256)",
  "function paused() external view returns (bool)",
  "event TokensPurchased(address indexed buyer, uint256 uhrAmount, uint256 usdtAmount)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// ── Types ───────────────────────────────────────────────────────────────────
type Step = "connect" | "input" | "approve" | "buy" | "success";

interface TxInfo {
  approveTxHash: string | null;
  buyTxHash: string | null;
  uhrAmount: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const BSC_CHAIN_ID = "0x38";
const BSC_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"],
};

function formatUHR(raw: bigint): string {
  return (Number(raw) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function bscScanTx(hash: string) {
  return `https://bscscan.com/tx/${hash}`;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SwapPage() {
  const [step, setStep] = useState<Step>("connect");
  const [account, setAccount] = useState<string>("");
  const [uhrInput, setUhrInput] = useState<string>("");
  const [usdtCost, setUsdtCost] = useState<string>("0.00");
  const [contractBalance, setContractBalance] = useState<string>("—");
  const [userUsdtBalance, setUserUsdtBalance] = useState<string>("—");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [txInfo, setTxInfo] = useState<TxInfo>({ approveTxHash: null, buyTxHash: null, uhrAmount: "0" });
  const [statusMsg, setStatusMsg] = useState<string>("");

  const fetchChainData = useCallback(async (userAddr?: string) => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const swap = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SWAP_ABI, provider);
      const rawBal: bigint = await swap.getUHRBalance();
      setContractBalance(formatUHR(rawBal));

      if (userAddr) {
        const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
        const rawUsdt: bigint = await usdt.balanceOf(userAddr);
        setUserUsdtBalance((Number(rawUsdt) / 1e18).toFixed(2));
      }
    } catch {
      // silently ignore read errors
    }
  }, []);

  useEffect(() => {
    const val = parseFloat(uhrInput);
    if (!isNaN(val) && val > 0) {
      setUsdtCost((val * 0.02).toFixed(2));
    } else {
      setUsdtCost("0.00");
    }
  }, [uhrInput]);

  useEffect(() => {
    fetchChainData(account || undefined);
    const interval = setInterval(() => fetchChainData(account || undefined), 15000);
    return () => clearInterval(interval);
  }, [account, fetchChainData]);

  async function connectWallet() {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it from metamask.io.");
      return;
    }
    setLoading(true);
    try {
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts.length) throw new Error("No accounts returned.");

      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
      } catch (switchErr: unknown) {
        const err = switchErr as { code?: number };
        if (err?.code === 4902) {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BSC_PARAMS] });
        } else {
          throw switchErr;
        }
      }

      setAccount(accounts[0]);
      await fetchChainData(accounts[0]);
      setStep("input");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  }

  function validateInput(): boolean {
    const val = parseFloat(uhrInput);
    if (isNaN(val) || val <= 0) { setError("Enter a valid UHR amount."); return false; }
    if (val < 100) { setError("Minimum purchase is 100 UHR."); return false; }
    if (val > 10000) { setError("Maximum purchase is 10,000 UHR per transaction."); return false; }
    if (!Number.isInteger(val)) { setError("UHR amount must be a whole number."); return false; }
    return true;
  }

  function proceedToApprove() {
    setError("");
    if (!validateInput()) return;
    setStep("approve");
  }

  async function approveUSDT() {
    setError("");
    if (!validateInput()) return;
    setLoading(true);
    setStatusMsg("Waiting for MetaMask approval signature…");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

      const uhrWei = ethers.parseEther(uhrInput);
      const usdtWei = (uhrWei * BigInt(2e16)) / BigInt(1e18);

      const existing: bigint = await usdt.allowance(account, SWAP_CONTRACT_ADDRESS);
      if (existing >= usdtWei) {
        setTxInfo(prev => ({ ...prev, approveTxHash: "already_approved", uhrAmount: uhrInput }));
        setStep("buy");
        setStatusMsg("");
        setLoading(false);
        return;
      }

      setStatusMsg("Confirm the USDT approval in MetaMask…");
      const tx = await usdt.approve(SWAP_CONTRACT_ADDRESS, usdtWei);
      setStatusMsg(`Approval submitted. Waiting for confirmation… (${shortAddr(tx.hash)})`);
      await tx.wait();

      setTxInfo(prev => ({ ...prev, approveTxHash: tx.hash, uhrAmount: uhrInput }));
      setStep("buy");
      setStatusMsg("");
    } catch (err: unknown) {
      const e = err as { reason?: string; message?: string };
      setError(e?.reason ?? e?.message ?? "Approval failed.");
    } finally {
      setLoading(false);
    }
  }

  async function buyUHR() {
    setError("");
    setLoading(true);
    setStatusMsg("Confirm the swap transaction in MetaMask…");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const swap = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SWAP_ABI, signer);

      const uhrWei = ethers.parseEther(txInfo.uhrAmount);
      const tx = await swap.buyUHR(uhrWei);
      setStatusMsg(`Transaction submitted. Waiting for confirmation… (${shortAddr(tx.hash)})`);
      await tx.wait();

      setTxInfo(prev => ({ ...prev, buyTxHash: tx.hash }));
      await fetchChainData(account);
      setStep("success");
      setStatusMsg("");
    } catch (err: unknown) {
      const e = err as { reason?: string; message?: string; data?: { message?: string } };
      const msg = e?.reason ?? e?.data?.message ?? e?.message ?? "Transaction failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("input");
    setUhrInput("");
    setUsdtCost("0.00");
    setError("");
    setTxInfo({ approveTxHash: null, buyTxHash: null, uhrAmount: "0" });
    setStatusMsg("");
    fetchChainData(account);
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center px-4 py-16 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-700/15 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-400 mb-2 font-semibold">UHRATE Web3</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          Buy{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            UHR Tokens
          </span>
        </h1>
        <p className="mt-3 text-gray-400 text-sm md:text-base max-w-sm mx-auto">
          Fixed price · $0.02 per UHR · Instant on-chain delivery
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-4 mb-8">
        <StatPill label="UHR Price" value="$0.02" accent="purple" />
        <StatPill label="Remaining in Contract" value={`${contractBalance} UHR`} accent="blue" />
        {account && <StatPill label="Your USDT Balance" value={`$${userUsdtBalance}`} accent="green" />}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-2xl">
          <StepIndicator current={step} />

          {step === "connect" && (
            <div className="mt-6 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl">🦊</div>
              <div>
                <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="text-sm text-gray-400 mt-1">Connect MetaMask to buy UHR tokens on BSC.</p>
              </div>
              <button onClick={connectWallet} disabled={loading} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Connecting…" : "Connect MetaMask"}
              </button>
            </div>
          )}

          {step === "input" && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Connected: <span className="text-gray-300 font-mono">{shortAddr(account)}</span>
              </div>
              <h2 className="text-xl font-bold text-white">Enter UHR Amount</h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">UHR Amount (100 – 10,000)</label>
                <input type="number" min={100} max={10000} step={1} value={uhrInput} onChange={e => { setUhrInput(e.target.value); setError(""); }} placeholder="e.g. 500" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-lg" />
              </div>
              <div className="rounded-xl bg-purple-900/20 border border-purple-500/20 px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">USDT Cost</span>
                <span className="text-xl font-bold text-white">${usdtCost}</span>
              </div>
              <button onClick={proceedToApprove} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition">
                Continue →
              </button>
            </div>
          )}

          {step === "approve" && (
            <div className="mt-6 space-y-5">
              <h2 className="text-xl font-bold text-white">Approve USDT Spend</h2>
              <p className="text-sm text-gray-400">Allow the swap contract to pull <span className="text-white font-semibold">${usdtCost} USDT</span> from your wallet.</p>
              <InfoRow label="You Send" value={`${usdtCost} USDT`} />
              <InfoRow label="You Receive" value={`${uhrInput} UHR`} />
              <InfoRow label="Price" value="$0.02 / UHR" />
              {statusMsg && <p className="text-xs text-blue-300 bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-2">{statusMsg}</p>}
              <button onClick={approveUSDT} disabled={loading} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Approving…" : "Approve USDT in MetaMask"}
              </button>
              <button onClick={() => { setStep("input"); setError(""); }} className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition">← Back</button>
            </div>
          )}

          {step === "buy" && (
            <div className="mt-6 space-y-5">
              <h2 className="text-xl font-bold text-white">Confirm Swap</h2>
              <p className="text-sm text-gray-400">USDT approved. Now send the swap transaction to receive your UHR tokens immediately.</p>
              <InfoRow label="You Send" value={`${usdtCost} USDT`} />
              <InfoRow label="You Receive" value={`${txInfo.uhrAmount} UHR`} />
              <InfoRow label="Price" value="$0.02 / UHR" />
              {txInfo.approveTxHash && txInfo.approveTxHash !== "already_approved" && (
                <a href={bscScanTx(txInfo.approveTxHash)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
                  Approval TX: {shortAddr(txInfo.approveTxHash)} ↗
                </a>
              )}
              {txInfo.approveTxHash === "already_approved" && <p className="text-xs text-green-400">✓ Allowance already sufficient — no approval needed.</p>}
              {statusMsg && <p className="text-xs text-blue-300 bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-2">{statusMsg}</p>}
              <button onClick={buyUHR} disabled={loading} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Processing…" : `Buy ${txInfo.uhrAmount} UHR Now`}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="mt-6 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-3xl">✓</div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">Swap Complete!</h2>
                <p className="text-gray-400 mt-1 text-sm"><span className="text-white font-bold">{txInfo.uhrAmount} UHR</span> tokens have been sent to your wallet.</p>
              </div>
              <div className="space-y-2 text-left">
                {txInfo.approveTxHash && txInfo.approveTxHash !== "already_approved" && <TxLink label="Approval TX" hash={txInfo.approveTxHash} />}
                {txInfo.buyTxHash && <TxLink label="Swap TX" hash={txInfo.buyTxHash} />}
              </div>
              <div className="rounded-xl bg-green-900/20 border border-green-500/20 px-4 py-3 text-sm text-green-300">
                Add UHR to MetaMask: <span className="font-mono text-xs break-all">{UHR_TOKEN_ADDRESS}</span>
              </div>
              <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition">Buy More UHR</button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-900/20 border border-red-500/30 px-4 py-3 text-sm text-red-300 break-words">⚠ {error}</div>
          )}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">Network: BNB Smart Chain (BSC) · Token: UHR (BEP-20)</p>
      </div>
    </main>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent: "purple" | "blue" | "green" }) {
  const colors: Record<string, string> = {
    purple: "border-purple-500/30 bg-purple-900/20 text-purple-300",
    blue: "border-blue-500/30 bg-blue-900/20 text-blue-300",
    green: "border-green-500/30 bg-green-900/20 text-green-300",
  };
  return (
    <div className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${colors[accent]}`}>
      {label}: <span className="text-white">{value}</span>
    </div>
  );
}

const STEP_ORDER: Step[] = ["connect", "input", "approve", "buy", "success"];
const STEP_LABELS: Record<Step, string> = { connect: "Connect", input: "Amount", approve: "Approve", buy: "Buy", success: "Done" };

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center justify-between">
      {STEP_ORDER.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${done ? "bg-purple-600 text-white" : active ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white" : "bg-white/5 text-gray-600 border border-white/10"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "text-purple-300" : done ? "text-gray-400" : "text-gray-700"}`}>{STEP_LABELS[s]}</span>
            </div>
            {i < STEP_ORDER.length - 1 && <div className={`flex-1 h-px mx-1 mb-4 transition ${done ? "bg-purple-600" : "bg-white/10"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function TxLink({ label, hash }: { label: string; hash: string }) {
  return (
    <a href={bscScanTx(hash)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono underline underline-offset-2">{hash.slice(0, 10)}…{hash.slice(-6)} ↗</span>
    </a>
  );
}