import React from 'react';
import { Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

export type PipelineStage = 
  | 'extract_questions'
  | 'extract_answers'
  | 'map_answers'
  | 'grade'
  | 'completed'
  | 'error';

export interface ProcessingStep {
  id: PipelineStage;
  label: string;
  description: string;
}

export interface ProcessingStepperProps {
  currentStage: PipelineStage;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

const STEPS: ProcessingStep[] = [
  {
    id: 'extract_questions',
    label: 'Reading question paper',
    description: 'Extracting questions and sub-parts in printed order',
  },
  {
    id: 'extract_answers',
    label: 'Reading handwriting',
    description: 'Scanning answer blocks and locating coordinates',
  },
  {
    id: 'map_answers',
    label: 'Matching answers',
    description: 'Connecting handwriting to corresponding questions',
  },
  {
    id: 'grade',
    label: 'Grading & feedback',
    description: 'Assessing correctness and generating feedback',
  },
];

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  currentStage,
  error,
  onRetry,
  onCancel,
}) => {
  const getStepStatus = (stepId: PipelineStage, index: number) => {
    if (error) {
      // Find index of current failed stage
      const currentFailedIndex = STEPS.findIndex((s) => s.id === currentStage);
      if (index === currentFailedIndex) return 'failed';
      if (index < currentFailedIndex) return 'completed';
      return 'pending';
    }

    if (currentStage === 'completed') return 'completed';
    const currentIndex = STEPS.findIndex((s) => s.id === currentStage);

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 max-w-xl mx-auto w-full text-center">
      {/* Centered 4-point Sparkle Icon (as in Figma) */}
      <div className="relative mb-6">
        <div className={clsx(
          'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500',
          error
            ? 'bg-red-50 text-status-error ring-8 ring-red-100/50'
            : 'bg-primary-light/60 text-primary ring-8 ring-primary-light/40 animate-pulse'
        )}>
          {error ? (
            <AlertCircle className="w-10 h-10 text-status-error" />
          ) : (
            <Sparkles className="w-10 h-10 fill-primary text-primary" />
          )}
        </div>
      </div>

      {/* Main Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-text-primary tracking-tight">
        {error ? 'Extraction Error' : 'Extracting…'}
      </h2>
      <p className="text-sm text-slate-text-secondary mt-1.5 font-medium">
        {error ? 'An issue occurred while processing the documents.' : 'This may take a while'}
      </p>

      {/* Horizontal / Vertical 4-Stage Stepper */}
      <div className="w-full mt-10 p-6 bg-white rounded-2xl border border-slate-border shadow-sm text-left">
        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const status = getStepStatus(step.id, idx);
            return (
              <div key={step.id} className="flex items-center gap-4">
                {/* Step indicator circle */}
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
                    status === 'completed' && 'bg-primary text-white shadow-sm',
                    status === 'active' && 'border-2 border-primary text-primary bg-primary-light/30 animate-pulse',
                    status === 'pending' && 'bg-slate-100 text-slate-400 border border-slate-200',
                    status === 'failed' && 'bg-status-error text-white shadow-sm'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : status === 'failed' ? (
                    '!'
                  ) : status === 'active' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Step text */}
                <div className="min-w-0 flex-1">
                  <div
                    className={clsx(
                      'text-sm font-semibold transition-colors',
                      status === 'active' && 'text-primary',
                      status === 'completed' && 'text-slate-text-primary',
                      status === 'pending' && 'text-slate-400',
                      status === 'failed' && 'text-status-error'
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-slate-text-secondary truncate">
                    {step.description}
                  </div>
                </div>

                {/* Status tag */}
                {status === 'active' && (
                  <span className="text-[11px] font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full animate-pulse">
                    In progress
                  </span>
                )}
                {status === 'completed' && (
                  <span className="text-[11px] font-medium text-status-success bg-highlight-green-light px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error message box if failed */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-status-error text-left">
            <div className="font-semibold mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Processing halted
            </div>
            <div>{error}</div>
            <div className="mt-4 flex gap-3">
              {onRetry && (
                <Button size="sm" variant="danger" onClick={onRetry}>
                  Retry Stage
                </Button>
              )}
              {onCancel && (
                <Button size="sm" variant="secondary" onClick={onCancel}>
                  Cancel &amp; Re-upload
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
