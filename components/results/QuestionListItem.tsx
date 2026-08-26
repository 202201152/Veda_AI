import React from 'react';
import { Question, Grade, Mapping } from '@/lib/types';
import { ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';

export interface QuestionListItemProps {
  question: Question;
  isSelected: boolean;
  isExpanded: boolean;
  mapping?: Mapping;
  grade?: Grade;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export const QuestionListItem: React.FC<QuestionListItemProps> = ({
  question,
  isSelected,
  isExpanded,
  mapping,
  grade,
  onSelect,
  onToggleExpand,
}) => {
  const isSubpart = Boolean(question.subpart);

  // Status Badge Logic matching v2.0 Design Tokens
  const renderStatusBadge = () => {
    if (grade) {
      if (grade.correctness === 'correct') {
        return (
          <Badge variant="success" size="sm">
            {grade.score}/{grade.maxScore}
          </Badge>
        );
      }
      if (grade.correctness === 'partial') {
        return (
          <Badge variant="warning" size="sm">
            {grade.score}/{grade.maxScore}
          </Badge>
        );
      }
      if (grade.correctness === 'incorrect') {
        return (
          <Badge variant="error" size="sm">
            {grade.score}/{grade.maxScore}
          </Badge>
        );
      }
      return (
        <Badge variant="error" size="sm">
          0/{grade.maxScore}
        </Badge>
      );
    }

    if (mapping) {
      if (mapping.status === 'answered') {
        return (
          <Badge variant="success" size="sm">
            Answered
          </Badge>
        );
      }
      if (mapping.status === 'out_of_order') {
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Out of Order
          </Badge>
        );
      }
      if (mapping.status === 'unanswered') {
        return (
          <Badge variant="error" size="sm">
            Unanswered
          </Badge>
        );
      }
    }

    return null;
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'group rounded-xl border transition-all cursor-pointer p-4 select-none',
        isSubpart && 'ml-4 border-l-2 border-l-primary/40',
        isSelected
          ? 'border-primary bg-primary-light/20 shadow-sm ring-1 ring-primary/30'
          : 'border-slate-border bg-white hover:border-primary/40 hover:bg-slate-50/60 shadow-xs'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Neutral Charcoal Circular Number Badge */}
          <div className="w-7 h-7 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
            {question.number}
          </div>

          <div className="min-w-0">
            {/* Subpart indicator if present */}
            {isSubpart && (
              <span className="inline-block text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md mb-1 mr-2">
                Part ({question.subpart})
              </span>
            )}

            {/* Question Text */}
            <p className="text-sm font-medium text-slate-text-primary leading-snug">
              {question.text}
            </p>
          </div>
        </div>

        {/* Status Badge & Expand Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {renderStatusBadge()}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand feedback'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Inline AI Feedback Card (Shown when expanded) */}
      {isExpanded && grade && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3.5 pt-3 border-t border-slate-border/60 animate-fadeIn"
        >
          <div className="rounded-xl border border-primary bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-primary text-primary" />
              <span>AI Feedback</span>
            </div>
            <p className="text-xs text-slate-text-primary leading-relaxed">
              {grade.feedback || 'No feedback available for this question.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
