import { ethers } from 'ethers';

const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
const CHAIN_ID = 97;

export async function getProvider() {
  const provider = new ethers.JsonRpcProvider(BNB_TESTNET_RPC, {
    chainId: CHAIN_ID,
    name: 'bnb-testnet',
  });
  return provider;
}

export async function getWallet() {
  const provider = await getProvider();
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!privateKey || privateKey === 'your_wallet_private_key') {
    throw new Error('Wallet private key not configured');
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
}

export async function registerOnBlockchain(
  certificateId: string,
  sha256Hash: string,
  fileName: string,
  rating: string
) {
  try {
    const wallet = await getWallet();

    const data = ethers.hexlify(
      ethers.toUtf8Bytes(
        JSON.stringify({
          platform: 'UHRATE',
          certificateId,
          sha256Hash,
          fileName,
          rating,
          timestamp: Date.now(),
        })
      )
    );

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0n,
      data,
      gasLimit: 100000n,
    });

    await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      chain: 'BNB Testnet',
      explorerUrl: `https://testnet.bscscan.com/tx/${tx.hash}`,
    };
  } catch (error: any) {
    console.error('Blockchain registration error:', error);
    return {
      success: false,
      txHash: null,
      chain: 'BNB Testnet',
      explorerUrl: null,
      error: error.message,
    };
  }
}

export async function getWalletBalance() {
  try {
    const wallet = await getWallet();
    const balance = await wallet.provider!.getBalance(wallet.address);
    return {
      address: wallet.address,
      balance: ethers.formatEther(balance),
      chain: 'BNB Testnet',
    };
  } catch (error) {
    return null;
  }
}