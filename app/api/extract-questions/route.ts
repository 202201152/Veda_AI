import { NextRequest, NextResponse } from 'next/server';
import { generateStructured } from '@/lib/gemini';
import { EXTRACT_QUESTIONS_PROMPT } from '@/lib/prompts';
import { Question } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No question paper file provided' },
        { status: 400 }
      );
    }

    // Server-side size validation
    const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10);
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds the server limit of ${maxMb}MB` },
        { status: 400 }
      );
    }

    // Supported MIME types
    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validMimes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image (PNG/JPG).' },
        { status: 400 }
      );
    }

    // Convert file to base64 inline data
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const inlinePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const schemaDesc = '{ questions: [{ id: string, number: string, subpart: string | null, text: string, page: number }] }';

    const result = await generateStructured<{ questions: Question[] }>(
      EXTRACT_QUESTIONS_PROMPT,
      [inlinePart],
      schemaDesc
    );

    // Validate and sanitize questions array
    const rawQuestions = Array.isArray(result?.questions) ? result.questions : [];
    const questions: Question[] = rawQuestions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      number: String(q.number || idx + 1),
      subpart: q.subpart ? String(q.subpart) : null,
      text: String(q.text || '').trim(),
      page: typeof q.page === 'number' ? q.page : 1,
    }));

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to extract questions from document';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
