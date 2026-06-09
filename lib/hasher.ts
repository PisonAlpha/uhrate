import crypto from 'crypto';

export function generateSHA256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function generateSHA512(buffer: Buffer): string {
  return crypto.createHash('sha512').update(buffer).digest('hex');
}

export function generatePerceptualHash(buffer: Buffer): string {
  const sample = buffer.slice(0, 1024);
  return crypto.createHash('md5').update(sample).digest('hex');
}

export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `UHRATE-${timestamp}-${random}`;
}

export function generateDigitalDNA(buffer: Buffer, fileName: string, fileType: string) {
  const sha256 = generateSHA256(buffer);
  const sha512 = generateSHA512(buffer);
  const perceptual = generatePerceptualHash(buffer);
  const semantic = crypto
    .createHash('sha256')
    .update(`${fileName}-${fileType}-${buffer.length}`)
    .digest('hex');

  return {
    sha256,
    sha512,
    perceptual,
    semantic,
    size: buffer.length,
    generatedAt: new Date().toISOString(),
  };
}