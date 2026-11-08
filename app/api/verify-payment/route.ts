import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, PLATFORM_FEE_USD, PLATFORM_FEE_UHR_USD, UHR_CONTRACT } from '@/lib/registry';

const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a';

// How much tolerance to allow (5% under to handle rounding/price drift)
const TOLERANCE = 0.95;

async function getNativePrice(symbol: string): Promise<number> {
  try {
    const sym = symbol === 'ETH' ? 'ETH' : symbol === 'MATIC' ? 'MATIC' : 'BNB';
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
    if (res.ok) {
      const data = await res.json();
      return parseFloat(data.price) || 300;
    }
  } catch {}
  return 300; // fallback
}

async function getTransactionViaRPC(txHash: string, rpcUrl: string) {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    return { tx, receipt };
  } catch {
    return { tx: null, receipt: null };
  }
}

async function getTransactionViaScan(txHash: string, chainId: string) {
  let apiUrl = '';
  if (chainId === 'bnb') {
    apiUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY || ''}`;
  } else if (chainId === 'ethereum') {
    apiUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY || ''}`;
  } else if (chainId === 'base') {
    apiUrl = `https://api.basescan.org/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY || ''}`;
  } else if (chainId === 'polygon') {
    apiUrl = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.POLYGONSCAN_API_KEY || ''}`;
  }

  if (!apiUrl) return null;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, chainId, payWithUHR } = body;

    if (!txHash || !chainId) {
      return NextResponse.json({ valid: false, error: 'Missing txHash or chainId' }, { status: 400 });
    }

    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (!chain) {
      return NextResponse.json({ valid: false, error: 'Unsupported chain' }, { status: 400 });
    }

    // ── 1. Fetch the transaction ────────────────────────────────────────────
    let toAddress: string | null = null;
    let valueHex: string | null = null;
    let inputData: string | null = null;
    let confirmed = false;

    // Try block explorer API first (more reliable), then RPC fallback
    const scanResult = await getTransactionViaScan(txHash, chainId);

    if (scanResult && typeof scanResult === 'object') {
      toAddress = scanResult.to as string;
      valueHex = scanResult.value as string;
      inputData = scanResult.input as string;
      // If blockNumber is present, it's confirmed
      confirmed = !!(scanResult.blockNumber && scanResult.blockNumber !== '0x');
    } else {
      // Fallback: direct RPC
      const { tx, receipt } = await getTransactionViaRPC(txHash, chain.rpc);
      if (!tx) {
        return NextResponse.json({ valid: false, error: 'Transaction not found. It may still be pending — please wait a moment and try again.' }, { status: 400 });
      }
      toAddress = tx.to;
      valueHex = '0x' + tx.value.toString(16);
      inputData = tx.data;
      confirmed = !!receipt && receipt.status === 1;
    }

    // ── 2. Must be confirmed (mined) ────────────────────────────────────────
    if (!confirmed) {
      return NextResponse.json({ valid: false, error: 'Transaction is still pending. Please wait for it to be confirmed on-chain.' }, { status: 400 });
    }

    // ── 3. Check destination wallet ─────────────────────────────────────────
    const normalizedTo = (toAddress || '').toLowerCase();
    const normalizedPaymentWallet = PAYMENT_WALLET.toLowerCase();
    const normalizedUHRContract = UHR_CONTRACT.toLowerCase();

    if (payWithUHR) {
      // UHR payment: tx goes to UHR contract (ERC-20 transfer)
      if (normalizedTo !== normalizedUHRContract) {
        return NextResponse.json({ valid: false, error: 'Payment was not sent to the UHR contract.' }, { status: 400 });
      }

      // Decode ERC-20 transfer(address,uint256) call
      // transfer selector: 0xa9059cbb
      if (!inputData || !inputData.startsWith('0xa9059cbb')) {
        return NextResponse.json({ valid: false, error: 'Transaction is not a UHR token transfer.' }, { status: 400 });
      }

      // Decode recipient and amount from calldata
      // transfer(address to, uint256 amount) — after 4-byte selector
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const decoded = abiCoder.decode(['address', 'uint256'], '0x' + inputData.slice(10));
      const recipient: string = decoded[0];
      const transferredAmount: bigint = decoded[1];

      if (recipient.toLowerCase() !== normalizedPaymentWallet) {
        return NextResponse.json({ valid: false, error: 'UHR tokens were not sent to the UHRATE payment wallet.' }, { status: 400 });
      }

      // Check amount: PLATFORM_FEE_UHR_USD = $0.10, UHR price = $0.02, so 5 UHR minimum
      // But currently the UI sends 10 UHR ($0.20 worth). Accept ≥ 5 UHR to be safe.
      const minUHR = ethers.parseUnits('5', 18); // 5 UHR (generous floor)
      if (transferredAmount < minUHR) {
        return NextResponse.json({
          valid: false,
          error: `Insufficient UHR payment. Required at least 5 UHR, received ${ethers.formatUnits(transferredAmount, 18)} UHR.`,
        }, { status: 400 });
      }

    } else {
      // Native coin payment: tx goes directly to payment wallet
      if (normalizedTo !== normalizedPaymentWallet) {
        return NextResponse.json({ valid: false, error: 'Payment was not sent to the UHRATE payment wallet.' }, { status: 400 });
      }

      // Verify the value sent is at least PLATFORM_FEE_USD × TOLERANCE
      const nativePrice = await getNativePrice(chain.symbol);
      const minUSD = PLATFORM_FEE_USD * TOLERANCE; // $0.19 with 5% tolerance
      const minWei = BigInt(Math.floor(minUSD / nativePrice * 1e18));

      const sentWei = BigInt(valueHex || '0x0');
      if (sentWei < minWei) {
        const sentUSD = Number(sentWei) / 1e18 * nativePrice;
        return NextResponse.json({
          valid: false,
          error: `Insufficient payment. Required ~$${PLATFORM_FEE_USD}, received ~$${sentUSD.toFixed(4)}.`,
        }, { status: 400 });
      }
    }

    // ── 4. All checks passed ────────────────────────────────────────────────
    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ valid: false, error: 'Payment verification failed. Please try again.' }, { status: 500 });
  }
}