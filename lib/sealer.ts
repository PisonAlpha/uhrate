import sharp from 'sharp';

export interface SealOptions {
  certificateId: string;
  sha256Hash: string;
  rating: string;
  trustScore: number;
  watermark: boolean; // user choice
}

export interface SealResult {
  sealedBuffer: Buffer;
  mimeType: string;
  extension: string;
  method: 'watermark' | 'metadata' | 'none';
}

// Generate UHRATE watermark SVG — small, subtle, bottom right
function generateWatermarkSVG(certificateId: string, width: number, height: number): Buffer {
  const badgeWidth = Math.min(280, Math.floor(width * 0.35));
  const badgeHeight = 44;
  const x = width - badgeWidth - 12;
  const y = height - badgeHeight - 12;
  const shortId = certificateId.split('-').slice(-1)[0];

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${y}" width="${badgeWidth}" height="${badgeHeight}" 
        rx="8" ry="8" fill="rgba(0,0,0,0.55)"/>
      <rect x="${x + 8}" y="${y + 7}" width="22" height="22" 
        rx="4" ry="4" fill="white"/>
      <text x="${x + 19}" y="${y + 22}" 
        font-family="Arial, sans-serif" font-size="9" font-weight="900" 
        fill="black" text-anchor="middle">UH</text>
      <text x="${x + 38}" y="${y + 19}" 
        font-family="Arial, sans-serif" font-size="11" font-weight="700" 
        fill="white">UHRATE</text>
      <text x="${x + 38}" y="${y + 34}" 
        font-family="Arial, sans-serif" font-size="9" 
        fill="rgba(255,255,255,0.75)">Sealed · ${shortId}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

// Seal image files
async function sealImage(
  buffer: Buffer,
  mimeType: string,
  options: SealOptions
): Promise<SealResult> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Build EXIF comment with certificate data
    const sealComment = JSON.stringify({
      platform: 'UHRATE',
      certificate_id: options.certificateId,
      sha256_hash: options.sha256Hash,
      rating: options.rating,
      trust_score: options.trustScore,
      sealed_at: new Date().toISOString(),
      verify_at: 'https://uhrate.online/lookup',
    });

    let processedImage = image.withExif({
      IFD0: {
        ImageDescription: `UHRATE Sealed — Certificate: ${options.certificateId}`,
        Copyright: `UHRATE Decentralized Authenticity Network — ${options.certificateId}`,
        Software: 'UHRATE Seal v1.0',
        Artist: sealComment,
      },
    });

    if (options.watermark) {
      const watermarkSvg = generateWatermarkSVG(options.certificateId, width, height);
      processedImage = processedImage.composite([{
        input: watermarkSvg,
        top: 0,
        left: 0,
      }]);
    }

    let sealedBuffer: Buffer;
    let extension: string;
    let outputMimeType: string;

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      sealedBuffer = await processedImage.jpeg({ quality: 95 }).toBuffer();
      extension = 'jpg';
      outputMimeType = 'image/jpeg';
    } else if (mimeType === 'image/png') {
      sealedBuffer = await processedImage.png({ compressionLevel: 6 }).toBuffer();
      extension = 'png';
      outputMimeType = 'image/png';
    } else if (mimeType === 'image/webp') {
      sealedBuffer = await processedImage.webp({ quality: 95 }).toBuffer();
      extension = 'webp';
      outputMimeType = 'image/webp';
    } else {
      // For other image types convert to PNG
      sealedBuffer = await processedImage.png().toBuffer();
      extension = 'png';
      outputMimeType = 'image/png';
    }

    return {
      sealedBuffer,
      mimeType: outputMimeType,
      extension,
      method: options.watermark ? 'watermark' : 'metadata',
    };
  } catch (err) {
    console.error('Image seal error:', err);
    // Return original if sealing fails
    return {
      sealedBuffer: buffer,
      mimeType,
      extension: mimeType.split('/')[1] || 'bin',
      method: 'none',
    };
  }
}

// Seal audio files — embed metadata in ID3 tags via binary injection
async function sealAudio(
  buffer: Buffer,
  mimeType: string,
  options: SealOptions
): Promise<SealResult> {
  try {
    // For MP3 files inject ID3 comment tag
    if (mimeType === 'audio/mpeg' || mimeType === 'audio/mp3') {
      const comment = `UHRATE Sealed | Certificate: ${options.certificateId} | Hash: ${options.sha256Hash} | Verify: uhrate.online/lookup`;
      
      // ID3v2 header + comment frame
      const frameContent = Buffer.from(`eng\0${comment}`, 'utf8');
      const frameSize = frameContent.length;
      
      const id3Header = Buffer.alloc(10);
      id3Header.write('ID3', 0, 'ascii');
      id3Header[3] = 3; // version 2.3
      id3Header[4] = 0; // flags
      // Syncsafe size
      const totalSize = frameSize + 10;
      id3Header[6] = (totalSize >> 21) & 0x7F;
      id3Header[7] = (totalSize >> 14) & 0x7F;
      id3Header[8] = (totalSize >> 7) & 0x7F;
      id3Header[9] = totalSize & 0x7F;

      const frameHeader = Buffer.alloc(10);
      frameHeader.write('COMM', 0, 'ascii');
      frameHeader.writeUInt32BE(frameSize, 4);
      frameHeader[8] = 0;
      frameHeader[9] = 0;

      const encodingByte = Buffer.from([0x00]); // ISO-8859-1

      // Check if file already has ID3 header
      const hasId3 = buffer.slice(0, 3).toString('ascii') === 'ID3';
      
      let sealedBuffer: Buffer;
      if (hasId3) {
        // Append after existing ID3
        sealedBuffer = Buffer.concat([
          id3Header, frameHeader, encodingByte, frameContent, buffer
        ]);
      } else {
        sealedBuffer = Buffer.concat([
          id3Header, frameHeader, encodingByte, frameContent, buffer
        ]);
      }

      return { sealedBuffer, mimeType, extension: 'mp3', method: 'metadata' };
    }

    // For other audio formats just return with metadata note
    return { sealedBuffer: buffer, mimeType, extension: mimeType.split('/')[1] || 'audio', method: 'none' };
  } catch {
    return { sealedBuffer: buffer, mimeType, extension: 'mp3', method: 'none' };
  }
}

// Seal PDF files — add invisible metadata
async function sealPDF(
  buffer: Buffer,
  options: SealOptions
): Promise<SealResult> {
  try {
    // Add UHRATE metadata to PDF by injecting into info dictionary
    const sealText = `\n%% UHRATE SEAL\n%% Certificate: ${options.certificateId}\n%% Hash: ${options.sha256Hash}\n%% Verify at: https://uhrate.online/lookup\n%% Sealed: ${new Date().toISOString()}\n`;
    const sealBuffer = Buffer.from(sealText, 'utf8');
    const sealedBuffer = Buffer.concat([buffer, sealBuffer]);

    return { sealedBuffer, mimeType: 'application/pdf', extension: 'pdf', method: 'metadata' };
  } catch {
    return { sealedBuffer: buffer, mimeType: 'application/pdf', extension: 'pdf', method: 'none' };
  }
}

// Main seal function
export async function sealFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  options: SealOptions
): Promise<SealResult> {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/bmp'];
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/m4a'];
  const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];

  if (imageTypes.includes(mimeType)) {
    return sealImage(buffer, mimeType, options);
  } else if (audioTypes.includes(mimeType)) {
    return sealAudio(buffer, mimeType, options);
  } else if (mimeType === 'application/pdf') {
    return sealPDF(buffer, options);
  } else {
    // For video and other files — return original with metadata note
    return {
      sealedBuffer: buffer,
      mimeType,
      extension: fileName.split('.').pop() || 'bin',
      method: 'none',
    };
  }
}

// Read UHRATE seal from image EXIF
export async function readSealFromImage(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Try to read Artist field which contains our JSON
    const exifStr = exif.toString('utf8');
    const match = exifStr.match(/\{"platform":"UHRATE".*?\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      return data.certificate_id || null;
    }
    return null;
  } catch {
    return null;
  }
}