import React from 'react';
import { AlertCircle, RefreshCw, Upload } from 'lucide-react';
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

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({
  currentStage,
  error,
  onRetry,
  onCancel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full text-center animate-fadeIn select-none">
      {/* Centered Sparkle Loader Image from Figma */}
      <div className="relative mb-4 flex items-center justify-center">
        {error ? (
          <div className="w-20 h-20 rounded-full bg-red-50 text-[#DC4C3E] ring-8 ring-red-100/60 flex items-center justify-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-[#DC4C3E]" />
          </div>
        ) : (
          <div className="w-28 h-28 flex items-center justify-center animate-pulse">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/analysing-loader.png"
              alt="Extracting"
              className="w-24 h-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Main Headline */}
      <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0F172A] tracking-tight">
        {error ? 'Processing Failed' : 'Extracting…'}
      </h2>

      {/* Subtitle */}
      <p className="text-[14px] text-[#64748B] mt-1 font-medium">
        {error ? 'We encountered a problem while analyzing the documents.' : 'This may take a while'}
      </p>

      {/* Error state card if something failed */}
      {error && (
        <div className="mt-8 p-6 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#DC4C3E] text-left space-y-3 shadow-2xs w-full">
          <div className="font-bold flex items-center gap-2 text-sm text-[#0F172A]">
            <AlertCircle className="w-4 h-4 text-[#DC4C3E] flex-shrink-0" />
            <span>Document Processing Issue</span>
          </div>
          <p className="text-[#64748B] text-xs leading-relaxed font-medium">{error}</p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            {onRetry && (
              <Button size="sm" variant="danger" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry Processing
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="secondary" onClick={onCancel} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Upload Different Files
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

