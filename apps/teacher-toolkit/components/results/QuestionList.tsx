import React, { useState } from 'react';
import { Question, Grade, Mapping, UnmatchedAnswer, AnswerBlock, OverallSummary } from '@/lib/types';
import { QuestionListItem } from './QuestionListItem';
import { UnmatchedAnswersPanel } from './UnmatchedAnswersPanel';

export interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  selectedUnmatchedId?: string | null;
  onSelectQuestion: (question: Question) => void;
  onSelectUnmatched?: (answerBlockId: string) => void;
  mappings?: Mapping[];
  grades?: Grade[];
  overallSummary?: OverallSummary | null;
  unmatchedAnswers?: UnmatchedAnswer[];
  answerBlocks?: AnswerBlock[];
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionId,
  selectedUnmatchedId = null,
  onSelectQuestion,
  onSelectUnmatched,
  mappings = [],
  grades = [],
  unmatchedAnswers = [],
  answerBlocks = [],
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const mappingMap = React.useMemo(() => {
    const map = new Map<string, Mapping>();
    mappings.forEach((m) => map.set(m.questionId, m));
    return map;
  }, [mappings]);

  const gradeMap = React.useMemo(() => {
    const map = new Map<string, Grade>();
    grades.forEach((g) => map.set(g.questionId, g));
    return map;
  }, [grades]);

  const toggleExpand = (questionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedIds.size === questions.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(questions.map((q) => q.id)));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Questions Section Header matching Figma */}
      <div className="p-4 sm:px-6 sm:py-4 flex items-center justify-between bg-transparent sticky top-0 z-10 flex-shrink-0">
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] tracking-tight">
            Extracted <span className="underline decoration-slate-300 underline-offset-4">Questions</span> <span className="font-normal text-slate-700">(from question paper)</span>
          </h2>
        </div>

        {questions.length > 0 && (
          <button
            onClick={handleToggleExpandAll}
            className="text-xs font-semibold text-[#0F172A] hover:text-[#F4522D] transition-colors px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs hover:bg-slate-50"
          >
            {expandedIds.size === questions.length ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {/* Questions Scrollable List & Unmatched Panel */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-3">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 text-sm">
            <p>No questions extracted yet.</p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionListItem
              key={q.id}
              question={q}
              isSelected={selectedQuestionId === q.id}
              isExpanded={expandedIds.has(q.id)}
              mapping={mappingMap.get(q.id)}
              grade={gradeMap.get(q.id)}
              onSelect={() => onSelectQuestion(q)}
              onToggleExpand={() => toggleExpand(q.id)}
            />
          ))
        )}

        {/* Distinct Unmatched Answers Section if present */}
        {unmatchedAnswers.length > 0 && onSelectUnmatched && (
          <div className="pt-2">
            <UnmatchedAnswersPanel
              unmatchedAnswers={unmatchedAnswers}
              answerBlocks={answerBlocks}
              selectedUnmatchedId={selectedUnmatchedId}
              onSelectUnmatched={onSelectUnmatched}
            />
          </div>
        )}
      </div>
    </div>
  );
};

