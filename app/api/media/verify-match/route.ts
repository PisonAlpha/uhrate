import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contentTitle = formData.get('contentTitle') as string;
    const contentType = formData.get('contentType') as string;
    const captureDate = formData.get('captureDate') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const mediaOrganization = formData.get('mediaOrganization') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = file.type || 'image/jpeg';

    if (!mediaType.startsWith('image/')) {
      return NextResponse.json({ success: true, mismatches: [], skipped: true });
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
            text: 'Compare this media content image against the following submitted form values:\n\n' +
              'Content Title: "' + contentTitle + '"\n' +
              'Content Type: "' + contentType + '"\n' +
              'Capture Date: "' + captureDate + '"\n' +
              'Location: "' + location + '"\n' +
              'Description: "' + description + '"\n' +
              'Media Organization: "' + mediaOrganization + '"\n\n' +
              'For each field, check if the submitted value reasonably matches what is visible in the image (allow for minor variations). ' +
              'If a field is blank/empty in the submitted form, treat it as "not provided" — do not flag it as a mismatch. ' +
              'For contentType, verify it matches the type of media shown. ' +
              'For description, check if it reasonably describes the content. ' +
              'Respond ONLY with valid JSON, no markdown, no preamble, in this exact format: ' +
              '{ "mismatches": [ { "field": "fieldName", "submitted": "value user entered", "found": "what is actually in the image", "reason": "short explanation" } ] }. ' +
              'If everything matches or fields are blank, return { "mismatches": [] }. ' +
              'fieldName must be one of: contentTitle, contentType, captureDate, location, description, mediaOrganization.',
          },
        ],
      }],
    });

    const textBlock = message.content.find(c => c.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '{"mismatches":[]}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ success: true, mismatches: result.mismatches || [] });
  } catch (error) {
    console.error('Media match check error:', error);
    return NextResponse.json({ success: true, mismatches: [], error: 'Match check failed, proceeding without verification' });
  }
}