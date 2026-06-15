import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = file.type || 'image/jpeg';

    if (!mediaType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files can be auto-read.' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: base64 } },
          {
            type: 'text',
            text: 'This is a media content file (photo, screenshot, or document). Extract the following fields and respond ONLY with valid JSON, no markdown, no preamble: { "contentTitle": "", "contentType": "", "captureDate": "", "location": "", "description": "", "mediaOrganization": "" }. If a field is not visible or unclear, use an empty string. For contentType, pick the closest match to: "Photograph", "Video Recording", "Audio Recording", "Written Article", "Document/Report", "Screenshot/Screen Recording", "Satellite/Aerial Image", "Social Media Post", "Interview Recording", "Other Media". For captureDate, use YYYY-MM-DD format if visible. For description, write a brief 1-sentence description of what the content shows.',
          },
        ],
      }],
    });

    const textBlock = message.content.find(c => c.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(clean);

    return NextResponse.json({ success: true, extracted });
  } catch (error) {
    console.error('Media extract error:', error);
    return NextResponse.json({ error: 'Failed to read media. Please fill in manually.' }, { status: 500 });
  }
}