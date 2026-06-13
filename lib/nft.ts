import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function mintCertificate(address to, string memory certificateId, string memory fileHash, string memory fileName, string memory rating, string memory tokenURIData) public returns (uint256)",
  "function getCertificate(uint256 tokenId) public view returns (tuple(string certificateId, string fileHash, string fileName, string rating, uint256 timestamp, address owner))",
  "function certificateToToken(string memory certificateId) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event CertificateMinted(uint256 indexed tokenId, string certificateId, string fileHash, address owner)",
];

const BNB_TESTNET_RPC = 'https://bsc-dataseed.binance.org';

export function generateTokenURI(
  certificateId: string,
  fileName: string,
  fileHash: string,
  rating: string,
  trustScore: number
) {
  const metadata = {
    name: "UHRATE Authenticity Certificate",
    description: "This NFT certifies the authenticity of a digital file verified by UHRATE.",
    image: "https://uhrate.xyz/nft-image.svg",
    attributes: [
      { trait_type: "Certificate ID", value: certificateId },
      { trait_type: "File Name", value: fileName },
      { trait_type: "SHA-256 Hash", value: fileHash },
      { trait_type: "Authenticity Rating", value: rating },
      { trait_type: "Trust Score", value: trustScore },
      { trait_type: "Platform", value: "UHRATE" },
      { trait_type: "Verified At", value: new Date().toISOString() },
    ],
  };

  const json = JSON.stringify(metadata);
  const base64 = Buffer.from(json).toString('base64');
  return "data:application/json;base64," + base64;
}

export async function mintNFTCertificate(
  recipientAddress: string,
  certificateId: string,
  fileHash: string,
  fileName: string,
  rating: string,
  trustScore: number,
  contractAddress: string
) {
  try {
    const provider = new ethers.JsonRpcProvider(BNB_TESTNET_RPC, {
      chainId: 97,
      name: 'bnb-testnet',
    });

    const privateKey = process.env.WALLET_PRIVATE_KEY!;

    if (!privateKey || privateKey === 'your_wallet_private_key') {
      throw new Error('Wallet private key not configured');
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Minting from wallet:', wallet.address);
    console.log('Contract address:', contractAddress);
    console.log('Recipient:', recipientAddress);

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

    const tokenURIData = generateTokenURI(
      certificateId,
      fileName,
      fileHash,
      rating,
      trustScore
    );

    const gasEstimate = await contract.mintCertificate.estimateGas(
      recipientAddress,
      certificateId,
      fileHash,
      fileName,
      rating,
      tokenURIData
    ).catch(() => 500000n);

    const tx = await contract.mintCertificate(
      recipientAddress,
      certificateId,
      fileHash,
      fileName,
      rating,
      tokenURIData,
      { gasLimit: gasEstimate }
    );

    console.log('Mint tx hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Mint receipt status:', receipt.status);

    let tokenId = null;
    if (receipt.logs && receipt.logs.length > 0) {
      try {
        tokenId = parseInt(receipt.logs[0].topics[1], 16);
      } catch {
        tokenId = null;
      }
    }

    return {
      success: true,
      txHash: tx.hash,
      tokenId,
      explorerUrl: "https://testnet.bscscan.com/tx/" + tx.hash,
    };
  } catch (error: any) {
    console.error('NFT mint error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}