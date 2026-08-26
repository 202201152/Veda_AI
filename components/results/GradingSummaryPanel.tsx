import React from 'react';
import { OverallSummary, Grade, Mapping } from '@/lib/types';
import { Award, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface GradingSummaryPanelProps {
  overallSummary: OverallSummary | null;
  grades: Grade[];
  mappings: Mapping[];
  onExpandAllFeedback?: () => void;
}

export const GradingSummaryPanel: React.FC<GradingSummaryPanelProps> = ({
  overallSummary,
  grades,
  mappings,
  onExpandAllFeedback,
}) => {
  if (!overallSummary) return null;

  const totalScore = overallSummary.totalScore;
  const maxTotalScore = overallSummary.maxTotalScore || 1;
  const percentage = Math.round((totalScore / maxTotalScore) * 100);

  const answeredCount = mappings.filter((m) => m.status === 'answered' || m.status === 'out_of_order').length;
  const unansweredCount = mappings.filter((m) => m.status === 'unanswered').length;

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-status-success bg-highlight-green-light border-status-success/30';
    if (percentage >= 40) return 'text-status-warning bg-amber-50 border-status-warning/30';
    return 'text-status-error bg-red-50 border-status-error/30';
  };

  return (
    <div className="bg-white border-b border-slate-border p-4 sm:p-5 space-y-3.5">
      {/* Top Row: Total Score & Performance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-text-secondary">
              Grading Summary
            </h3>
            <div className="text-xs font-semibold text-slate-text-primary">
              Overall Student Performance
            </div>
          </div>
        </div>

        {/* Score Pill */}
        <div
          className={clsx(
            'px-3.5 py-1.5 rounded-full border flex items-center gap-2 font-bold text-sm shadow-2xs',
            getScoreColor()
          )}
        >
          <span>{totalScore} / {maxTotalScore}</span>
          <span className="text-xs font-medium opacity-80">({percentage}%)</span>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 py-1 text-center">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium">Questions</div>
          <div className="text-sm font-bold text-slate-text-primary mt-0.5">
            {grades.length}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-highlight-green-light/60 border border-status-success/20">
          <div className="text-[11px] text-status-success font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Answered
          </div>
          <div className="text-sm font-bold text-status-success mt-0.5">
            {answeredCount}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-red-50/60 border border-status-error/20">
          <div className="text-[11px] text-status-error font-medium flex items-center justify-center gap-1">
            <XCircle className="w-3 h-3" /> Unanswered
          </div>
          <div className="text-sm font-bold text-status-error mt-0.5">
            {unansweredCount}
          </div>
        </div>
      </div>

      {/* Overall AI Feedback */}
      {overallSummary.overallFeedback && (
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-text-primary leading-relaxed">
          <span className="font-semibold text-slate-700 block mb-0.5">Overall Feedback:</span>
          {overallSummary.overallFeedback}
        </div>
      )}

      {/* Permanent AI Disclosure Notice */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800 leading-snug">
        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>AI-generated assessment:</strong> Marks and feedback are computed by AI for evaluation assistance and do not replace a teacher&apos;s verified answer key.
        </span>
      </div>
    </div>
  );
};
