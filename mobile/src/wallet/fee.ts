import type { Chain } from '@/constants/chains';

/** Platform fee for one registration, as on the web (PLATFORM_FEE_USD). */
export const PLATFORM_FEE_USD = 0.2;

/** Where the fee goes. Same address the web pages pay. */
export const FEE_WALLET = '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a';

// Binance spot pairs for each native coin. Polygon's MATIC trades as POL now.
const PRICE_PAIRS: Record<string, string> = { BNB: 'BNBUSDT', ETH: 'ETHUSDT', MATIC: 'POLUSDT' };

/**
 * The fee in wei of the chain's native coin, at today's Binance price.
 *
 * The web always uses the BNB price (with $300 if Binance can't be reached),
 * which is wrong for ETH and MATIC. Here each coin uses its own price, and a
 * failed lookup stops the payment instead of guessing.
 */
export async function feeInWei(chain: Chain): Promise<bigint> {
  const pair = PRICE_PAIRS[chain.symbol];
  let price = NaN;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    if (res.ok) price = parseFloat((await res.json()).price);
  } catch {
    // handled below
  }
  if (!(price > 0)) throw new Error(`Couldn't get the current ${chain.symbol} price. Please try again.`);
  return BigInt(Math.floor((PLATFORM_FEE_USD / price) * 1e18));
}
