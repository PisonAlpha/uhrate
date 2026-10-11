// Blockchains a registry entry can be recorded on. Mirrors SUPPORTED_CHAINS
// in lib/registry.ts on the backend; `id` is the value its APIs expect.
export const CHAINS = [
  { id: 'bnb', name: 'BNB Chain', symbol: 'BNB' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'base', name: 'Base', symbol: 'ETH' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
] as const;

export type ChainId = (typeof CHAINS)[number]['id'];

/** The web registries preselect BNB Chain. */
export const DEFAULT_CHAIN: ChainId = 'bnb';
