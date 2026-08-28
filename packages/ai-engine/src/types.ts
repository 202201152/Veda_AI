export interface BBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Question {
  id: string;
  number: string;
  subpart: string | null;
  text: string;
  page: number;
}

export interface AnswerBlock {
  id: string;
  detectedLabel: string | null;
  text: string;
  bbox: BBox[];
  confidence: number;
}

export interface Mapping {
  questionId: string;
  answerBlockIds: string[];
  status: 'answered' | 'unanswered' | 'out_of_order';
}

export interface UnmatchedAnswer {
  answerBlockId: string;
  reason: string;
}

export interface Grade {
  questionId: string;
  score: number;
  maxScore: number;
  correctness: 'correct' | 'partial' | 'incorrect' | 'ungraded';
  feedback: string;
}

export interface OverallSummary {
  totalScore: number;
  maxTotalScore: number;
  overallFeedback: string;
}

export interface AssessmentResult {
  questions: Question[];
  answerBlocks: AnswerBlock[];
  mappings: Mapping[];
  unmatchedAnswers: UnmatchedAnswer[];
  grades: Grade[];
  overallSummary: OverallSummary | null;
}
