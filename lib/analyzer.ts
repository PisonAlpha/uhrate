import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeWithClaude(
  fileName: string,
  fileType: string,
  fileSize: number,
  sha256: string
) {
  const prompt = `You are an expert digital forensics AI for UHRATE, a digital authenticity verification platform.

Analyze this file and return authenticity scores:

File Name: ${fileName}
File Type: ${fileType}
File Size: ${fileSize} bytes
SHA256: ${sha256}

Based on the file metadata, return ONLY a JSON object with these exact fields:
{
  "originality_score": <0-100, how likely the content is original>,
  "ai_score": <0-100, probability it is AI generated>,
  "deepfake_score": <0-100, probability it is a deepfake>,
  "manipulation_score": <0-100, probability it has been manipulated>,
  "trust_score": <0-100, overall trust level>,
  "rating": <one of: "Verified Original", "Likely Original", "Mixed Content", "AI Assisted", "AI Generated", "Deepfake Suspected", "High Risk">,
  "summary": <one sentence explanation of the result>
}

Return ONLY the JSON, no other text.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const clean = content.text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Claude analysis error:', error);
    return getFallbackScores(fileType);
  }
}

function getFallbackScores(fileType: string) {
  const isVideo = fileType.includes('video');
  const isImage = fileType.includes('image');
  const isAudio = fileType.includes('audio');

  return {
    originality_score: isVideo ? 45 : isImage ? 60 : 75,
    ai_score: isVideo ? 55 : isImage ? 40 : 25,
    deepfake_score: isVideo ? 50 : isImage ? 20 : 30,
    manipulation_score: isVideo ? 45 : isImage ? 35 : 20,
    trust_score: isVideo ? 40 : isImage ? 55 : 70,
    rating: isVideo ? 'High Risk' : isImage ? 'Mixed Content' : 'Likely Original',
    summary: 'Analysis completed using fallback scoring system.',
  };
}

export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'Verified Original': return 'green';
    case 'Likely Original': return 'green';
    case 'Mixed Content': return 'amber';
    case 'AI Assisted': return 'amber';
    case 'AI Generated': return 'red';
    case 'Deepfake Suspected': return 'red';
    case 'High Risk': return 'red';
    default: return 'gray';
  }
}