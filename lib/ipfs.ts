import FormData from 'form-data';
import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

export async function uploadFileToIPFS(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<{ ipfsHash: string; ipfsUrl: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: fileName,
      contentType: fileType,
    });

    const metadata = JSON.stringify({ name: fileName });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 0 });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = PINATA_GATEWAY + '/ipfs/' + ipfsHash;

    return { ipfsHash, ipfsUrl };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return null;
  }
}

export async function uploadCertificateToIPFS(
  certificateData: object,
  certificateId: string
): Promise<{ ipfsHash: string; ipfsUrl: string } | null> {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: certificateData,
        pinataMetadata: { name: 'UHRATE-' + certificateId },
        pinataOptions: { cidVersion: 0 },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = PINATA_GATEWAY + '/ipfs/' + ipfsHash;

    return { ipfsHash, ipfsUrl };
  } catch (error) {
    console.error('IPFS certificate upload error:', error);
    return null;
  }
}

export async function getIPFSUrl(ipfsHash: string): Promise<string> {
  return PINATA_GATEWAY + '/ipfs/' + ipfsHash;
}