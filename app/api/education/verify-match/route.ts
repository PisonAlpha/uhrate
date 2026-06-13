import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const institutionName = formData.get('institutionName') as string;
    const studentName = formData.get('studentName') as string;
    const degreeType = formData.get('degreeType') as string;
    const fieldOfStudy = formData.get('fieldOfStudy') as string;
    const graduationYear = formData.get('graduationYear') as string;
    const certificateNumber = formData.get('certificateNumber') as string;

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
            text: 'Compare the data on this educational certificate image against the following submitted form values:\n\n' +
              'Institution Name: "' + institutionName + '"\n' +
              'Student Name: "' + studentName + '"\n' +
              'Degree Type: "' + degreeType + '"\n' +
              'Field of Study: "' + fieldOfStudy + '"\n' +
              'Graduation Year: "' + graduationYear + '"\n' +
              'Certificate Number: "' + certificateNumber + '"\n\n' +
              'For each field, check if the submitted value reasonably matches what is shown on the certificate (allow for minor spelling variations, abbreviations, or formatting differences — focus on whether they refer to the same thing). ' +
              'If a field is blank/empty in the submitted form, treat it as "not provided" — do not flag it as a mismatch. ' +
              'Respond ONLY with valid JSON, no markdown, no preamble, in this exact format: ' +
              '{ "mismatches": [ { "field": "fieldName", "submitted": "value user entered", "found": "value found on certificate", "reason": "short explanation" } ] }. ' +
              'If everything matches or fields are blank, return { "mismatches": [] }. ' +
              'fieldName must be one of: institutionName, studentName, degreeType, fieldOfStudy, graduationYear, certificateNumber.',
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
    console.error('Match check error:', error);
    return NextResponse.json({ success: true, mismatches: [], error: 'Match check failed, proceeding without verification' });
  }
}