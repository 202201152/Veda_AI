import React, { useState } from 'react';
import { Question, Grade, Mapping } from '@/lib/types';
import { QuestionListItem } from './QuestionListItem';

export interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
  mappings?: Mapping[];
  grades?: Grade[];
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  mappings = [],
  grades = [],
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
    <div className="flex flex-col h-full bg-white border-r border-slate-border">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-border flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-text-primary">
            Extracted Questions
          </h2>
          <span className="text-xs text-slate-text-secondary font-medium">
            (from question paper • {questions.length} items)
          </span>
        </div>

        {questions.length > 0 && (
          <button
            onClick={handleToggleExpandAll}
            className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded-md hover:bg-primary-light/50"
          >
            {expandedIds.size === questions.length ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-text-secondary text-sm">
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
      </div>
    </div>
  );
};
