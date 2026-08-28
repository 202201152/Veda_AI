import React from 'react';
import { UnmatchedAnswer, AnswerBlock } from '@/lib/types';
import { HelpCircle, AlertOctagon } from 'lucide-react';
import { clsx } from 'clsx';

export interface UnmatchedAnswersPanelProps {
  unmatchedAnswers: UnmatchedAnswer[];
  answerBlocks: AnswerBlock[];
  selectedUnmatchedId: string | null;
  onSelectUnmatched: (answerBlockId: string) => void;
}

export const UnmatchedAnswersPanel: React.FC<UnmatchedAnswersPanelProps> = ({
  unmatchedAnswers,
  answerBlocks,
  selectedUnmatchedId,
  onSelectUnmatched,
}) => {
  const answerBlockMap = React.useMemo(() => {
    const map = new Map<string, AnswerBlock>();
    answerBlocks.forEach((b) => map.set(b.id, b));
    return map;
  }, [answerBlocks]);

  if (unmatchedAnswers.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-red-50/20 border-2 border-dashed border-status-error/40 rounded-2xl mx-4 my-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-status-error font-bold text-xs sm:text-sm">
          <AlertOctagon className="w-4 h-4" />
          <span>Unmatched Handwriting ({unmatchedAnswers.length})</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          Manual Review
        </span>
      </div>

      <p className="text-[11px] text-slate-text-secondary leading-relaxed mb-3">
        The following handwritten block(s) did not map to any question on the question paper (e.g. rough work or unassigned notes).
      </p>

      {/* List of unmatched blocks */}
      <div className="space-y-2">
        {unmatchedAnswers.map((item) => {
          const block = answerBlockMap.get(item.answerBlockId);
          const isSelected = selectedUnmatchedId === item.answerBlockId;
          const pageNum = block?.bbox?.[0]?.page || 1;

          return (
            <div
              key={item.answerBlockId}
              onClick={() => onSelectUnmatched(item.answerBlockId)}
              className={clsx(
                'p-3 rounded-xl border bg-white transition-all cursor-pointer select-none text-xs',
                isSelected
                  ? 'border-status-error bg-red-50/40 ring-1 ring-status-error/30 shadow-xs'
                  : 'border-slate-border hover:border-status-error/40 hover:bg-slate-50/60 shadow-2xs'
              )}
            >
              <div className="flex items-center justify-between font-semibold text-slate-text-primary mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-status-error">
                    {block?.detectedLabel ? `Label: "${block.detectedLabel}"` : 'Unlabeled block'}
                  </span>
                </div>
                <span className="text-slate-400 font-normal">Page {pageNum}</span>
              </div>

              {block?.text && (
                <p className="text-slate-600 line-clamp-2 italic font-serif mb-1.5 text-[11px]">
                  &ldquo;{block.text}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>{item.reason}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
