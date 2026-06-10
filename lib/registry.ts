import { ethers } from 'ethers';

export const SUPPORTED_CHAINS = [
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: 56,
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    testnet: false,
  },
  {
    id: 'bnb-testnet',
    name: 'BNB Testnet',
    symbol: 'tBNB',
    chainId: 97,
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    testnet: true,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpc: 'https://cloudflare-eth.com',
    explorer: 'https://etherscan.io',
    testnet: false,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    testnet: false,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    testnet: false,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    chainId: 10,
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    testnet: false,
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    testnet: false,
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    testnet: false,
  },
];

export function getChainById(chainId: string) {
  return SUPPORTED_CHAINS.find(c => c.id === chainId);
}

export function generateDocumentData(
  sha256: string,
  fileName: string,
  fileType: string,
  documentType: string,
  ownerName: string,
  metadata: Record<string, string>
) {
  return JSON.stringify({
    platform: 'UHRATE',
    version: '1.0',
    document_type: documentType,
    file_name: fileName,
    file_type: fileType,
    sha256_hash: sha256,
    owner_name: ownerName,
    metadata,
    registered_at: new Date().toISOString(),
  });
}

export async function verifyDocumentOnChain(
  txHash: string,
  chainId: string
): Promise<{ valid: boolean; data?: any; blockNumber?: number }> {
  try {
    const chain = getChainById(chainId);
    if (!chain) return { valid: false };

    let apiUrl = '';

    if (chainId === 'bnb' || chainId === 'bnb-testnet') {
      const baseUrl = chainId === 'bnb'
        ? 'https://api.bscscan.com/api'
        : 'https://api-testnet.bscscan.com/api';
      apiUrl = `${baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY}`;
    } else if (chainId === 'ethereum') {
      apiUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const tx = await provider.getTransaction(txHash);
      if (!tx) return { valid: false };

      const decoded = tx.data
        ? Buffer.from(tx.data.slice(2), 'hex').toString('utf8')
        : '';

      return {
        valid: true,
        data: decoded,
        blockNumber: tx.blockNumber || undefined,
      };
    }

    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.result) return { valid: false };

    const decoded = result.result.input
      ? Buffer.from(result.result.input.slice(2), 'hex').toString('utf8')
      : '';

    return {
      valid: true,
      data: decoded,
      blockNumber: parseInt(result.result.blockNumber, 16),
    };
  } catch (error) {
    console.error('Verify on chain error:', error);
    return { valid: false };
  }
}