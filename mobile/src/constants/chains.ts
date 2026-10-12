// Blockchains a registry entry can be recorded on. Mirrors SUPPORTED_CHAINS
// in lib/registry.ts on the backend; `id` is the value its APIs expect.
export interface Chain {
  id: string;
  name: string;
  /** Native coin the fee and gas are paid in. */
  symbol: string;
  /** EVM chain ID, used to switch the wallet to this network. */
  chainId: number;
  testnet: boolean;
}

const MAINNET_CHAINS: Chain[] = [
  { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', chainId: 56, testnet: false },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', chainId: 1, testnet: false },
  { id: 'base', name: 'Base', symbol: 'ETH', chainId: 8453, testnet: false },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', chainId: 137, testnet: false },
];

// For testing payments with free test BNB. Offered only when
// EXPO_PUBLIC_ENABLE_TESTNET=true (mobile/.env.local); the server must have
// NEXT_PUBLIC_ENABLE_TESTNET=true too, or it won't recognise the chain.
const BNB_TESTNET: Chain = { id: 'bnb-testnet', name: 'BNB Testnet', symbol: 'BNB', chainId: 97, testnet: true };

export const CHAINS: Chain[] =
  process.env.EXPO_PUBLIC_ENABLE_TESTNET === 'true' ? [...MAINNET_CHAINS, BNB_TESTNET] : MAINNET_CHAINS;

export type ChainId = Chain['id'];

/** The web registries preselect BNB Chain. */
export const DEFAULT_CHAIN: ChainId = 'bnb';
