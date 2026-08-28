import { NextRequest, NextResponse } from 'next/server';
import { generateStructured } from '@/lib/gemini';
import { EXTRACT_ANSWERS_PROMPT } from '@/lib/prompts';
import { AnswerBlock, BBox } from '@/lib/types';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimiter';

export const runtime = 'nodejs';

function sanitizeBbox(rawBoxes: unknown[], defaultPage = 1): BBox[] {
  if (!Array.isArray(rawBoxes) || rawBoxes.length === 0) {
    return [{ page: defaultPage, x: 0.05, y: 0.05, width: 0.9, height: 0.2 }];
  }

  return rawBoxes.map((b: any) => {
    const page = typeof b?.page === 'number' ? b.page : defaultPage;
    const x = Math.max(0, Math.min(1, typeof b?.x === 'number' ? b.x : 0));
    const y = Math.max(0, Math.min(1, typeof b?.y === 'number' ? b.y : 0));
    const width = Math.max(0.01, Math.min(1 - x, typeof b?.width === 'number' ? b.width : 0.8));
    const height = Math.max(0.01, Math.min(1 - y, typeof b?.height === 'number' ? b.height : 0.2));

    return { page, x, y, width, height };
  });
}

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetSeconds);
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No answer sheet file provided' },
        { status: 400 }
      );
    }

    const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10);
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds the server limit of ${maxMb}MB` },
        { status: 400 }
      );
    }

    const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validMimes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image (PNG/JPG).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const inlinePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const schemaDesc = '{ answerBlocks: [{ id: string, detectedLabel: string | null, text: string, bbox: [{ page: number, x: number, y: number, width: number, height: number }], confidence: number }] }';

    const result = await generateStructured<{ answerBlocks: AnswerBlock[] }>(
      EXTRACT_ANSWERS_PROMPT,
      [inlinePart],
      schemaDesc
    );

    const rawBlocks = Array.isArray(result?.answerBlocks) ? result.answerBlocks : [];
    const answerBlocks: AnswerBlock[] = rawBlocks.map((ans, idx) => ({
      id: ans.id || `ans_${idx + 1}`,
      detectedLabel: ans.detectedLabel ? String(ans.detectedLabel).trim() : null,
      text: String(ans.text || '').trim(),
      bbox: sanitizeBbox(ans.bbox, 1),
      confidence: typeof ans.confidence === 'number' ? Math.max(0, Math.min(1, ans.confidence)) : 0.9,
    }));

    return NextResponse.json({ answerBlocks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to extract handwriting and bounding boxes from answer sheet';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
