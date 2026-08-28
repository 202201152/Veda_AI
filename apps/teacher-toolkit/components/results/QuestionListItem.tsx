import React from 'react';
import { Question, Grade, Mapping } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

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

  // Status/Score Badge Logic matching Figma Design
  const renderScoreBadge = () => {
    if (grade) {
      const scoreRatio = grade.maxScore > 0 ? grade.score / grade.maxScore : 0;
      let badgeStyle = 'bg-[#EAF5EC] text-[#3F9142]'; // Green

      if (scoreRatio < 0.4 || grade.correctness === 'incorrect') {
        badgeStyle = 'bg-[#FDEEEC] text-[#DC4C3E]'; // Red
      } else if (scoreRatio < 0.7 || grade.correctness === 'partial') {
        badgeStyle = 'bg-[#FEF3E8] text-[#F59E0B]'; // Amber
      }

      return (
        <span className={clsx('text-xs font-bold px-3 py-1 rounded-full select-none flex-shrink-0', badgeStyle)}>
          {grade.score}/{grade.maxScore}
        </span>
      );
    }

    if (mapping) {
      if (mapping.status === 'answered') {
        return (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF5EC] text-[#3F9142] select-none flex-shrink-0">
            Answered
          </span>
        );
      }
      if (mapping.status === 'out_of_order') {
        return (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF3E8] text-[#F59E0B] select-none flex-shrink-0">
            Out of Order
          </span>
        );
      }
      if (mapping.status === 'unanswered') {
        return (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FDEEEC] text-[#DC4C3E] select-none flex-shrink-0">
            Unanswered
          </span>
        );
      }
    }

    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 select-none flex-shrink-0">
        --
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'rounded-2xl transition-all cursor-pointer p-4 sm:p-4.5 select-none bg-white',
        isSelected
          ? 'border-2 border-[#F4522D] shadow-xs'
          : 'border border-slate-200 hover:border-slate-300 hover:shadow-2xs'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Question Number Circle Badge */}
          <div
            className={clsx(
              'w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs transition-colors',
              isSelected ? 'bg-[#F4522D]' : 'bg-[#333333]'
            )}
          >
            {question.number}
          </div>

          {/* Subpart (e.g. "a." or "b.") */}
          {isSubpart && (
            <span className="font-bold text-xs text-[#0F172A] bg-slate-100 px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5">
              {question.subpart}.
            </span>
          )}

          {/* Question Text */}
          <p className="text-[13.5px] font-medium text-[#0F172A] leading-snug flex-1">
            {question.text}
          </p>
        </div>

        {/* Score Badge & Expand Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {renderScoreBadge()}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand feedback'}
            aria-label="Toggle feedback"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Inline AI Feedback Card (Shown when expanded or when selected) */}
      {(isExpanded || isSelected) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3.5 pt-1 animate-fadeIn"
        >
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/60 p-3.5 shadow-2xs">
            <div className="text-xs font-bold text-[#0F172A] mb-1">
              AI Feedback
            </div>
            <p className="text-xs text-[#475569] leading-relaxed font-normal">
              {grade?.feedback || 'Excellent work! You correctly identified the answer and key concepts for this question.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

