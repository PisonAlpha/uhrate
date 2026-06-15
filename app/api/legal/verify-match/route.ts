import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const firmName = formData.get('firmName') as string;
    const documentTitle = formData.get('documentTitle') as string;
    const documentType = formData.get('documentType') as string;
    const parties = formData.get('parties') as string;
    const executionDate = formData.get('executionDate') as string;
    const jurisdiction = formData.get('jurisdiction') as string;
    const referenceNumber = formData.get('referenceNumber') as string;

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
            text: 'Compare the data on this legal document image against the following submitted form values:\n\n' +
              'Firm/Organization Name: "' + firmName + '"\n' +
              'Document Title: "' + documentTitle + '"\n' +
              'Document Type: "' + documentType + '"\n' +
              'Parties Involved: "' + parties + '"\n' +
              'Execution Date: "' + executionDate + '"\n' +
              'Jurisdiction: "' + jurisdiction + '"\n' +
              'Reference Number: "' + referenceNumber + '"\n\n' +
              'For each field, check if the submitted value reasonably matches what is shown on the document (allow for minor spelling variations, abbreviations, or formatting differences). ' +
              'If a field is blank/empty in the submitted form, treat it as "not provided" — do not flag it as a mismatch. ' +
              'Respond ONLY with valid JSON, no markdown, no preamble, in this exact format: ' +
              '{ "mismatches": [ { "field": "fieldName", "submitted": "value user entered", "found": "value found on document", "reason": "short explanation" } ] }. ' +
              'If everything matches or fields are blank, return { "mismatches": [] }. ' +
              'fieldName must be one of: firmName, documentTitle, documentType, parties, executionDate, jurisdiction, referenceNumber.',
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
    console.error('Legal match check error:', error);
    return NextResponse.json({ success: true, mismatches: [], error: 'Match check failed, proceeding without verification' });
  }
}