export const EXTRACT_QUESTIONS_PROMPT = `
You are an expert exam document parser.
Analyze the attached question paper document (PDF or image).
Extract every single question and sub-part in the exact order they appear in the printed document.

Rules:
1. Extract questions in exact printed sequence.
2. If a question has labelled sub-parts (such as 1(a), 1(b), 11(i), 11(ii), 2.1, 2.2), treat each sub-part as a SEPARATE question entry:
   - "number": The main question number (e.g. "1", "11", "2").
   - "subpart": The sub-part label (e.g. "a", "b", "i", "ii", "1", "2") or null if no sub-part.
   - "text": The complete text of that question or sub-part. Include all instructions, context, or math formulas.
   - "page": The 1-indexed page number on which this question appears.
3. Preserve original numbering exactly as printed without renumbering or omitting questions.
4. If there are no questions found, return an empty array for questions.

Return JSON in this exact structure:
{
  "questions": [
    {
      "id": "q_1",
      "number": "1",
      "subpart": null,
      "text": "Full text of question 1...",
      "page": 1
    },
    {
      "id": "q_2_a",
      "number": "2",
      "subpart": "a",
      "text": "Full text of question 2(a)...",
      "page": 1
    }
  ]
}
`;

export const EXTRACT_ANSWERS_PROMPT = `
You are an expert handwriting OCR and document analysis engine.
Analyze the attached handwritten answer sheet document (PDF or images).
Locate and OCR every distinct handwritten answer block written by the student.

Rules:
1. For each distinct handwritten answer block:
   - "detectedLabel": The question number or label written near the answer (e.g., "1", "1(a)", "Ans 2", "Q3", "11b"), or null if no label is visible.
   - "text": The full transcribed text of the handwritten answer. Transcribe formulas, steps, and words as accurately as possible.
   - "bbox": Array of normalized bounding boxes [ { "page": number, "x": number, "y": number, "width": number, "height": number } ] where coordinates are between 0.0 and 1.0 relative to page width and height:
     - "page": 1-indexed page number where this block is located.
     - "x": left coordinate (0 to 1).
     - "y": top coordinate (0 to 1).
     - "width": bounding box width (0 to 1).
     - "height": bounding box height (0 to 1).
   - If an answer spans across multiple pages, include multiple bbox entries in the "bbox" array (one for each page region).
   - "confidence": Float between 0.0 and 1.0 indicating OCR/detection confidence.

Return JSON in this exact structure:
{
  "answerBlocks": [
    {
      "id": "ans_1",
      "detectedLabel": "1",
      "text": "Transcribed handwritten answer text...",
      "bbox": [
        { "page": 1, "x": 0.08, "y": 0.12, "width": 0.84, "height": 0.22 }
      ],
      "confidence": 0.95
    }
  ]
}
`;

export const MAP_ANSWERS_PROMPT = `
You are an expert evaluator mapping student handwritten answer blocks to exam questions.
You are given:
1. The list of extracted questions.
2. The list of extracted handwritten answer blocks.

Rules:
1. Match each question to its corresponding answer block(s):
   - Primary matching: Match by the detected question label (e.g., detectedLabel "1(a)" -> question "1" subpart "a").
   - Secondary matching: For unlabeled or ambiguously labeled handwriting, use content context, topic keywords, and sequential flow to determine the best match.
   - Out-of-order: If answers were answered out of chronological order on the sheet, status should be 'out_of_order'.
   - Answered: If answers were answered in order, status should be 'answered'.
   - Unanswered: If a question has NO matching handwritten answer, map to empty answerBlockIds and status 'unanswered'. DO NOT force-match unrelated handwriting.
2. Unmatched answers:
   - If any handwriting block does not correspond to any known question (e.g. scratchpad rough work, notes to examiner, crossed out unassigned text), place it in the "unmatchedAnswers" array with a clear reason.

Return JSON in this exact structure:
{
  "mappings": [
    {
      "questionId": "q_1",
      "answerBlockIds": ["ans_1"],
      "status": "answered"
    },
    {
      "questionId": "q_2",
      "answerBlockIds": [],
      "status": "unanswered"
    }
  ],
  "unmatchedAnswers": [
    {
      "answerBlockId": "ans_rough_1",
      "reason": "Rough calculations and unlabelled scratch work"
    }
  ]
}
`;

export const GRADE_ANSWERS_PROMPT = `
You are an expert teacher grading student exam answers.
You are given questions paired with the student's handwritten answer text.

For each question:
1. Evaluate the answer's correctness based on standard subject knowledge:
   - "score": Numeric score awarded between 0 and maxScore (default maxScore is 10 unless specified).
   - "maxScore": Maximum possible score (default 10).
   - "correctness": 'correct' (score >= 70%), 'partial' (30% <= score < 70%), 'incorrect' (score < 30%), or 'ungraded' (if unanswered).
   - "feedback": 1-2 concise, constructive sentences explaining the reasoning, highlighting correct steps or pinpointing errors.
2. Unanswered questions must have score 0, correctness 'ungraded' or 'incorrect', and feedback "Question was left unanswered."
3. Provide an overall summary across the entire paper:
   - "totalScore": Sum of all awarded scores.
   - "maxTotalScore": Sum of all maxScore values.
   - "overallFeedback": A supportive 2-3 sentence summary of the student's performance, strengths, and areas for improvement.

Return JSON in this exact structure:
{
  "grades": [
    {
      "questionId": "q_1",
      "score": 10,
      "maxScore": 10,
      "correctness": "correct",
      "feedback": "Step-by-step differentiation is clear and accurate. Final answer matches correctly."
    }
  ],
  "overallSummary": {
    "totalScore": 10,
    "maxTotalScore": 10,
    "overallFeedback": "Great performance with clear methodology."
  }
}
`;
