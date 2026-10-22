import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useAppKit, useAppKitState, useProvider } from '@reown/appkit-react-native';
import type { Chain } from '@/constants/chains';
import { utf8ToHex } from '@/lib/file-hash';
import { networkFor } from '@/wallet/appkit';
import { FEE_WALLET, feeInWei } from '@/wallet/fee';

// How long the modal may stay closed before a pending connect counts as
// cancelled.
const CLOSE_GRACE_MS = 3000;

/** The user closed the wallet modal or refused the request in their wallet. */
export class WalletCancelledError extends Error {
  constructor() {
    super('Cancelled in the wallet.');
  }
}

// EIP-1193 code for "user rejected the request". WalletConnect wallets
// don't all send it, so the message is checked too.
function isRejection(err: unknown): boolean {
  const e = err as { code?: number; message?: string } | null;
  return e?.code === 4001 || /reject|denied|cancel/i.test(e?.message ?? '');
}

/** A message to show for a failed wallet request. */
export function walletErrorMessage(err: unknown): string {
  if (__DEV__) console.warn('Wallet request failed:', err);
  if (err instanceof WalletCancelledError || isRejection(err)) return 'Cancelled in your wallet.';
  if (err instanceof Error && err.message) return err.message;
  return 'The wallet request failed. Please try again.';
}

/**
 * The connected wallet and the requests the app makes to it: connect, sign
 * a message (wallet login) and pay the registration fee.
 */
export function useWallet() {
  const { open, disconnect, switchNetwork } = useAppKit();
  const { address, isConnected, chainId } = useAccount();
  const { isOpen } = useAppKitState();
  const { provider } = useProvider();

  // The async flows below outlive the render they started in, so they read
  // the latest values through this ref.
  const latest = useRef({ address, isConnected, chainId, provider });
  latest.current = { address, isConnected, chainId, provider };

  const pending = useRef<{
    resolve: (address: string) => void;
    reject: (err: Error) => void;
    opened: boolean;
    closeTimer?: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    if (isConnected && address && provider) {
      clearTimeout(p.closeTimer);
      pending.current = null;
      p.resolve(address);
    } else if (isOpen) {
      clearTimeout(p.closeTimer);
      p.closeTimer = undefined;
      p.opened = true;
    } else if (p.opened && !p.closeTimer) {
      // AppKit closes the modal on success a moment before it reports the
      // connection, so only a modal that stays closed means "cancelled".
      p.closeTimer = setTimeout(() => {
        if (pending.current !== p) return;
        pending.current = null;
        p.reject(new WalletCancelledError());
      }, CLOSE_GRACE_MS);
    }
  }, [isConnected, address, provider, isOpen]);

  // A pending connect must not hang if the screen goes away.
  useEffect(
    () => () => {
      clearTimeout(pending.current?.closeTimer);
      pending.current?.reject(new WalletCancelledError());
    },
    []
  );

  /** Resolves with the address, opening the wallet picker first if needed. */
  const connect = useCallback((): Promise<string> => {
    const now = latest.current;
    if (now.isConnected && now.address && now.provider) return Promise.resolve(now.address);
    clearTimeout(pending.current?.closeTimer);
    pending.current?.reject(new WalletCancelledError());
    return new Promise((resolve, reject) => {
      pending.current = { resolve, reject, opened: false };
      open({ view: 'Connect' });
    });
  }, [open]);

  const request = useCallback(<T>(method: string, params: unknown[]): Promise<T> => {
    const { provider: p } = latest.current;
    if (!p) return Promise.reject(new Error('Connect a wallet first.'));
    return p.request<T>({ method, params });
  }, []);

  /** personal_sign of a UTF-8 message. Returns the signature. */
  const signMessage = useCallback(
    async (message: string) => {
      const from = await connect();
      return request<string>('personal_sign', [utf8ToHex(message), from]);
    },
    [connect, request]
  );

  /**
   * Pays the $0.20 platform fee on `chain`, carrying `record` as the
   * transaction data, as the web registries do. Returns the transaction hash.
   */
  const payFee = useCallback(
    async (chain: Chain, record: Record<string, unknown>) => {
      const from = await connect();
      if (latest.current.chainId !== String(chain.chainId)) await switchNetwork(networkFor(chain));
      const value = await feeInWei(chain);
      return request<string>('eth_sendTransaction', [
        {
          from,
          to: FEE_WALLET,
          value: '0x' + value.toString(16),
          data: utf8ToHex(JSON.stringify(record)),
          // Same gas limit the web sets (200,000); the record makes the
          // data too large for the default 21,000.
          gas: '0x30D40',
        },
      ]);
    },
    [connect, request, switchNetwork]
  );

  return {
    address,
    isConnected,
    connect,
    disconnect: () => disconnect(),
    /** Opens the wallet's account view (address, network, disconnect). */
    openAccount: () => open({ view: 'Account' }),
    signMessage,
    payFee,
  };
}
