import { NextRequest, NextResponse } from 'next/server';
import { generateStructured } from '@/lib/gemini';
import { MAP_ANSWERS_PROMPT } from '@/lib/prompts';
import { Question, AnswerBlock, Mapping, UnmatchedAnswer } from '@/lib/types';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimiter';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.resetSeconds);
  }

  try {
    const body = await req.json();
    const questions: Question[] = Array.isArray(body?.questions) ? body.questions : [];
    const answerBlocks: AnswerBlock[] = Array.isArray(body?.answerBlocks) ? body.answerBlocks : [];

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided for mapping' },
        { status: 400 }
      );
    }

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      number: q.number,
      subpart: q.subpart,
      text: q.text,
      page: q.page,
    }));

    const formattedAnswerBlocks = answerBlocks.map((a) => ({
      id: a.id,
      detectedLabel: a.detectedLabel,
      text: a.text,
      pages: a.bbox.map((b) => b.page),
      confidence: a.confidence,
    }));

    const prompt = `${MAP_ANSWERS_PROMPT}

Extracted Questions:
${JSON.stringify(formattedQuestions, null, 2)}

Extracted Answer Blocks:
${JSON.stringify(formattedAnswerBlocks, null, 2)}
`;

    const schemaDesc = '{ mappings: [{ questionId: string, answerBlockIds: string[], status: "answered"|"unanswered"|"out_of_order" }], unmatchedAnswers: [{ answerBlockId: string, reason: string }] }';

    const result = await generateStructured<{
      mappings: Mapping[];
      unmatchedAnswers: UnmatchedAnswer[];
    }>(prompt, [], schemaDesc);

    const rawMappings = Array.isArray(result?.mappings) ? result.mappings : [];
    const mappedQuestionIds = new Set(rawMappings.map((m) => m.questionId));

    const finalMappings: Mapping[] = [...rawMappings];

    questions.forEach((q) => {
      if (!mappedQuestionIds.has(q.id)) {
        finalMappings.push({
          questionId: q.id,
          answerBlockIds: [],
          status: 'unanswered',
        });
      }
    });

    const rawUnmatched = Array.isArray(result?.unmatchedAnswers) ? result.unmatchedAnswers : [];
    const finalUnmatched: UnmatchedAnswer[] = rawUnmatched.map((u) => ({
      answerBlockId: String(u.answerBlockId),
      reason: String(u.reason || 'Unmapped handwriting block'),
    }));

    return NextResponse.json({
      mappings: finalMappings,
      unmatchedAnswers: finalUnmatched,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to map answers to questions';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
