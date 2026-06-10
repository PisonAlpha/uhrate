import { ethers } from 'ethers';

const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
const BNB_MAINNET_RPC = 'https://bsc-dataseed.binance.org';

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export async function getBNBPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'
    );
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Failed to fetch BNB price:', error);
    return 300;
  }
}

export async function calculateBNBAmount(usdtAmount: number): Promise<string> {
  const bnbPrice = await getBNBPrice();
  const bnbAmount = usdtAmount / bnbPrice;
  return bnbAmount.toFixed(6);
}

export async function verifyBNBPayment(
  txHash: string,
  expectedAmount: number,
  paymentWallet: string
): Promise<{ valid: boolean; amount?: string; from?: string }> {
  try {
    const provider = new ethers.JsonRpcProvider(BNB_MAINNET_RPC);
    const tx = await provider.getTransaction(txHash);

    if (!tx) return { valid: false };

    const toAddress = tx.to?.toLowerCase();
    const expectedWallet = paymentWallet.toLowerCase();

    if (toAddress !== expectedWallet) return { valid: false };

    const amount = parseFloat(ethers.formatEther(tx.value));
    const bnbPrice = await getBNBPrice();
    const usdtValue = amount * bnbPrice;

    if (usdtValue < expectedAmount * 0.95) return { valid: false };

    return {
      valid: true,
      amount: amount.toFixed(6),
      from: tx.from,
    };
  } catch (error) {
    console.error('BNB payment verify error:', error);
    return { valid: false };
  }
}

export async function verifyUSDTPayment(
  txHash: string,
  expectedAmount: number,
  paymentWallet: string
): Promise<{ valid: boolean; amount?: string; from?: string }> {
  try {
    const provider = new ethers.JsonRpcProvider(BNB_MAINNET_RPC);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) return { valid: false };

    const usdtInterface = new ethers.Interface(USDT_ABI);

    for (const log of receipt.logs) {
      try {
        const parsed = usdtInterface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed && parsed.name === 'Transfer') {
          const to = parsed.args[1].toLowerCase();
          const amount = parseFloat(ethers.formatUnits(parsed.args[2], 18));

          if (
            to === paymentWallet.toLowerCase() &&
            amount >= expectedAmount * 0.95
          ) {
            return {
              valid: true,
              amount: amount.toFixed(2),
              from: parsed.args[0],
            };
          }
        }
      } catch {
        continue;
      }
    }

    return { valid: false };
  } catch (error) {
    console.error('USDT payment verify error:', error);
    return { valid: false };
  }
}

export function getPlanDetails(plan: string) {
  const plans: Record<string, any> = {
    pro: {
      name: 'Pro',
      usdtPrice: 10,
      features: [
        'Unlimited verifications',
        'Priority AI analysis',
        'NFT certificates',
        'API access',
        'Email support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      usdtPrice: 50,
      features: [
        'Everything in Pro',
        'Bulk verification',
        'Custom API integration',
        'Dedicated support',
        'White-label option',
        'SLA guarantee',
      ],
    },
  };
  return plans[plan] || null;
}