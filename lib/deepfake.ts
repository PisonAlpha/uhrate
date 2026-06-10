import sharp from 'sharp';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeImage(buffer: Buffer, mimeType: string) {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const stats = await image.stats();

    const { data: resizedData } = await image
      .resize(512, 512, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    const base64Image = resizedData.toString('base64');

    const prompt = `You are an expert digital forensics AI specializing in deepfake and AI-generated image detection.

Analyze this image carefully for signs of:
1. AI generation (GAN artifacts, unnatural textures, perfect symmetry)
2. Deepfake manipulation (face swapping, expression manipulation)
3. Photo manipulation (cloning, splicing, retouching)
4. Compression artifacts inconsistent with camera capture
5. Metadata inconsistencies

Image technical details:
- Format: ${metadata.format}
- Dimensions: ${metadata.width}x${metadata.height}
- Color space: ${metadata.space}
- Channels: ${metadata.channels}
- Has alpha: ${metadata.hasAlpha}
- DPI: ${metadata.density || 'unknown'}

Statistical analysis:
- Mean values per channel: ${stats.channels.map((c: any) => c.mean.toFixed(2)).join(', ')}
- Standard deviation: ${stats.channels.map((c: any) => c.stdev.toFixed(2)).join(', ')}

Return ONLY a JSON object:
{
  "originality_score": <0-100>,
  "ai_score": <0-100>,
  "deepfake_score": <0-100>,
  "manipulation_score": <0-100>,
  "trust_score": <0-100>,
  "rating": <"Verified Original"|"Likely Original"|"Mixed Content"|"AI Assisted"|"AI Generated"|"Deepfake Suspected"|"High Risk">,
  "summary": <one sentence explanation>,
  "detected_issues": <array of specific issues found, empty if none>
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const clean = content.text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
}

export async function analyzeDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string
) {
  try {
    const client2 = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are an expert document forensics AI for UHRATE.

Analyze this document for authenticity:

File: ${fileName}
Type: ${fileType}
Size: ${buffer.length} bytes

Check for:
1. AI-generated text patterns
2. Inconsistent formatting
3. Template manipulation
4. Suspicious metadata patterns
5. Content authenticity markers

Return ONLY a JSON object:
{
  "originality_score": <0-100>,
  "ai_score": <0-100>,
  "deepfake_score": <0-100>,
  "manipulation_score": <0-100>,
  "trust_score": <0-100>,
  "rating": <"Verified Original"|"Likely Original"|"Mixed Content"|"AI Assisted"|"AI Generated"|"Deepfake Suspected"|"High Risk">,
  "summary": <one sentence explanation>,
  "detected_issues": []
}`;

    const message = await client2.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');

    const clean = content.text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Document analysis error:', error);
    return null;
  }
}

export async function analyzeFile(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  sha256: string
) {
  let result = null;

  if (fileType.startsWith('image/')) {
    result = await analyzeImage(buffer, fileType);
  } else if (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('text')
  ) {
    result = await analyzeDocument(buffer, fileName, fileType);
  }

  if (!result) {
    const { analyzeWithClaude } = await import('./analyzer');
    result = await analyzeWithClaude(fileName, fileType, buffer.length, sha256);
  }

  return result;
}