import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppKit, type AppKitNetwork, type Storage } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { CHAINS, DEFAULT_CHAIN, type Chain } from '@/constants/chains';

// Wallet connection through Reown AppKit (WalletConnect). The wallet itself
// signs messages and sends payments; the app only asks it to.
//
// EXPO_PUBLIC_REOWN_PROJECT_ID comes from mobile/.env.local. It identifies
// the app to WalletConnect and is public by design (it ships in the web app
// too), so it is not a secret.
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID ?? '';

if (__DEV__ && !projectId) {
  console.warn('EXPO_PUBLIC_REOWN_PROJECT_ID is not set; wallet connection will not work.');
}

function toNetwork(chain: Chain): AppKitNetwork {
  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
    rpcUrls: { default: { http: [chain.rpc] } },
    blockExplorers: { default: { name: 'Explorer', url: chain.explorer } },
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${chain.chainId}`,
    testnet: chain.testnet,
  };
}

const networks = CHAINS.map(toNetwork);

/** The AppKit network for a chain from constants/chains.ts. */
export function networkFor(chain: Chain): AppKitNetwork {
  return networks.find((n) => n.id === chain.chainId)!;
}

// AppKit stores its session as JSON in AsyncStorage, prefixed so it can't
// collide with anything else the app keeps there.
const PREFIX = 'appkit:';

const storage: Storage = {
  async getKeys() {
    return (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));
  },
  async getEntries<T = unknown>() {
    const keys = await storage.getKeys();
    const pairs = await AsyncStorage.multiGet(keys.map((k) => PREFIX + k));
    return pairs.map(([k, v]) => [k.slice(PREFIX.length), parse(v)] as [string, T]);
  },
  async getItem<T = unknown>(key: string) {
    return parse(await AsyncStorage.getItem(PREFIX + key)) as T | undefined;
  },
  async setItem<T = unknown>(key: string, value: T) {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(PREFIX + key);
  },
};

function parse(value: string | null): unknown {
  if (value == null) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const appKit = createAppKit({
  projectId,
  networks,
  defaultNetwork: networkFor(CHAINS.find((c) => c.id === DEFAULT_CHAIN)!),
  adapters: [new EthersAdapter()],
  storage,
  metadata: {
    name: 'UHRATE',
    description: 'Verify and register documents and media on the blockchain',
    url: 'https://uhrate.online',
    icons: ['https://uhrate.online/uhrate-logo.jpeg'],
    // Where the wallet sends the user back to after they approve.
    redirect: { native: 'uhrate://' },
  },
  // Wallets only: no email or social accounts, swaps or card purchases.
  features: { socials: false, swaps: false, onramp: false },
});
