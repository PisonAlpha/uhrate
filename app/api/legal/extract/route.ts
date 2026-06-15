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
            text: 'This is a legal document. Extract the following fields and respond ONLY with valid JSON, no markdown, no preamble: { "firmName": "", "documentTitle": "", "documentType": "", "parties": "", "executionDate": "", "jurisdiction": "", "referenceNumber": "" }. If a field is not visible or unclear, use an empty string. For documentType, pick the closest match to: "Contract/Agreement", "Non-Disclosure Agreement (NDA)", "Memorandum of Understanding (MOU)", "Power of Attorney", "Court Filing", "Affidavit", "Deed/Title", "Will/Testament", "Partnership Agreement", "Employment Contract", "Intellectual Property Filing", "Other Legal Document". For executionDate, use YYYY-MM-DD format if visible.',
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
    console.error('Legal extract error:', error);
    return NextResponse.json({ error: 'Failed to read document. Please fill in manually.' }, { status: 500 });
  }
}