import { NextRequest, NextResponse } from 'next/server';
import { generateStructured } from '@/lib/gemini';
import { GRADE_ANSWERS_PROMPT } from '@/lib/prompts';
import { Question, AnswerBlock, Mapping, Grade, OverallSummary } from '@/lib/types';

export const runtime = 'nodejs';

interface GradeApiResponse {
  grades: Array<{
    questionId: string;
    score: number;
    maxScore: number;
    correctness: 'correct' | 'partial' | 'incorrect' | 'ungraded';
    feedback: string;
  }>;
  overallSummary?: {
    totalScore?: number;
    maxTotalScore?: number;
    overallFeedback?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questions: Question[] = Array.isArray(body?.questions) ? body.questions : [];
    const answerBlocks: AnswerBlock[] = Array.isArray(body?.answerBlocks) ? body.answerBlocks : [];
    const mappings: Mapping[] = Array.isArray(body?.mappings) ? body.mappings : [];

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided for grading' },
        { status: 400 }
      );
    }

    const answerBlockMap = new Map<string, AnswerBlock>();
    answerBlocks.forEach((a) => answerBlockMap.set(a.id, a));

    const mappingMap = new Map<string, Mapping>();
    mappings.forEach((m) => mappingMap.set(m.questionId, m));

    const answeredPairs: Array<{
      questionId: string;
      questionNumber: string;
      subpart: string | null;
      questionText: string;
      studentAnswerText: string;
      maxScore: number;
    }> = [];

    const localGrades: Grade[] = [];

    questions.forEach((q) => {
      const mapping = mappingMap.get(q.id);
      const isAnswered = mapping && mapping.status !== 'unanswered' && mapping.answerBlockIds.length > 0;

      if (isAnswered) {
        const studentText = mapping.answerBlockIds
          .map((id) => answerBlockMap.get(id)?.text || '')
          .filter(Boolean)
          .join('\n\n');

        answeredPairs.push({
          questionId: q.id,
          questionNumber: q.number,
          subpart: q.subpart,
          questionText: q.text,
          studentAnswerText: studentText || '(Handwriting detected but transcription empty)',
          maxScore: 10,
        });
      } else {
        // Unanswered questions are scored 0 locally without wasting an AI call
        localGrades.push({
          questionId: q.id,
          score: 0,
          maxScore: 10,
          correctness: 'ungraded',
          feedback: 'Question was left unanswered.',
        });
      }
    });

    let aiGrades: Grade[] = [];
    let aiOverallFeedback = 'Evaluation complete based on student answers.';

    if (answeredPairs.length > 0) {
      const prompt = `${GRADE_ANSWERS_PROMPT}

Student Exam Questions and Answers to Grade:
${JSON.stringify(answeredPairs, null, 2)}
`;

      const schemaDesc = '{ grades: [{ questionId: string, score: number, maxScore: number, correctness: "correct"|"partial"|"incorrect"|"ungraded", feedback: string }], overallSummary: { totalScore: number, maxTotalScore: number, overallFeedback: string } }';

      const result = await generateStructured<GradeApiResponse>(
        prompt,
        [],
        schemaDesc
      );

      if (Array.isArray(result?.grades)) {
        aiGrades = result.grades.map((g) => ({
          questionId: g.questionId,
          score: typeof g.score === 'number' ? Math.max(0, Math.min(g.maxScore || 10, g.score)) : 5,
          maxScore: g.maxScore || 10,
          correctness: g.correctness || (g.score >= 7 ? 'correct' : g.score >= 3 ? 'partial' : 'incorrect'),
          feedback: String(g.feedback || '').trim(),
        }));
      }

      if (result?.overallSummary?.overallFeedback) {
        aiOverallFeedback = result.overallSummary.overallFeedback;
      }
    } else {
      aiOverallFeedback = 'No answers were detected on the answer sheet. All questions remained unanswered.';
    }

    // Combine grades for all questions
    const finalGradesMap = new Map<string, Grade>();
    aiGrades.forEach((g) => finalGradesMap.set(g.questionId, g));
    localGrades.forEach((g) => finalGradesMap.set(g.questionId, g));

    const finalGrades: Grade[] = questions.map((q) => {
      return (
        finalGradesMap.get(q.id) || {
          questionId: q.id,
          score: 0,
          maxScore: 10,
          correctness: 'ungraded',
          feedback: 'Question was left unanswered.',
        }
      );
    });

    // Compute verified totalScore = sum of all individual scores
    const calculatedTotalScore = finalGrades.reduce((acc, curr) => acc + curr.score, 0);
    const calculatedMaxScore = finalGrades.reduce((acc, curr) => acc + curr.maxScore, 0);

    const overallSummary: OverallSummary = {
      totalScore: calculatedTotalScore,
      maxTotalScore: calculatedMaxScore,
      overallFeedback: aiOverallFeedback,
    };

    return NextResponse.json({
      grades: finalGrades,
      overallSummary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to grade answers';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
