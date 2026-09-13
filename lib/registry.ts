import { ethers } from 'ethers';

export const SUPPORTED_CHAINS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    chainIdHex: '0x1',
    rpc: 'https://cloudflare-eth.com',
    explorer: 'https://etherscan.io',
    color: '#627EEA',
    icon: '⟠',
    testnet: false,
    gasEstimate: '~$1-3',
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: 56,
    chainIdHex: '0x38',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    color: '#F3BA2F',
    icon: '⬡',
    testnet: false,
    gasEstimate: '~$0.10-0.30',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    chainIdHex: '0x2105',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    color: '#0052FF',
    icon: '🔵',
    testnet: false,
    gasEstimate: '~$0.01-0.05',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    chainIdHex: '0x89',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    color: '#8247E5',
    icon: '⬡',
    testnet: false,
    gasEstimate: '~$0.01-0.05',
  },
];

export const PLATFORM_FEE_USD = 0.20;
export const PLATFORM_FEE_UHR_USD = 0.10;
export const UHR_CONTRACT = '0xFD8723F83F5A441EdB231F2ef1f89113B481E447';
export const UHR_CHAIN_ID = 56; // BNB Chain
export const PRESALE_WALLET = '0x2b2df01fcd78986c1ebdedfdbdaa909f0663ac6a';
export const SWAP_WALLET = '0x6c55d7594a3a85cc142095153faeb9f5042c7863';
export const PRESALE_PRICE_USD = 0.01;
export const SWAP_PRICE_USD = 0.02;
export const PRESALE_TOTAL_TOKENS = 80000000;
export const SWAP_POOL_TOKENS = 20000000;

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

    if (chainId === 'bnb') {
      apiUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY}`;
    } else if (chainId === 'ethereum') {
      apiUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else if (chainId === 'base') {
      apiUrl = `https://api.basescan.org/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else if (chainId === 'polygon') {
      apiUrl = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.POLYGONSCAN_API_KEY}`;
    } else {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const tx = await provider.getTransaction(txHash);
      if (!tx) return { valid: false };
      const decoded = tx.data
        ? Buffer.from(tx.data.slice(2), 'hex').toString('utf8')
        : '';
      return { valid: true, data: decoded, blockNumber: tx.blockNumber || undefined };
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