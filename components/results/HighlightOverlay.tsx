import React from 'react';
import { BBox } from '@/lib/types';
import { clsx } from 'clsx';

export interface HighlightOverlayProps {
  bbox: BBox;
  label?: string; // e.g. "Q1", "Q2(a)"
  isActive?: boolean;
  isUnmatched?: boolean;
  onClick?: () => void;
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  bbox,
  label = 'Q',
  isActive = true,
  isUnmatched = false,
  onClick,
}) => {
  const left = `${Math.max(0, Math.min(100, bbox.x * 100))}%`;
  const top = `${Math.max(0, Math.min(100, bbox.y * 100))}%`;
  const width = `${Math.max(2, Math.min(100, bbox.width * 100))}%`;
  const height = `${Math.max(2, Math.min(100, bbox.height * 100))}%`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        left,
        top,
        width,
        height,
      }}
      className={clsx(
        'absolute rounded pointer-events-auto cursor-pointer transition-all duration-150 z-10',
        isUnmatched
          ? 'border-2 border-dashed border-status-error bg-red-500/15 shadow-sm ring-2 ring-red-400/20'
          : isActive
          ? 'border-2 border-highlight-green bg-highlight-green/15 shadow-sm ring-2 ring-highlight-green/20'
          : 'border border-highlight-green/50 bg-highlight-green/5 hover:border-highlight-green hover:bg-highlight-green/15'
      )}
      title={`${label} answer region`}
    >
      {/* Pinned Tag at Top-Left Corner */}
      <div
        className={clsx(
          'absolute -top-[2px] -left-[2px] text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-tl rounded-br select-none shadow-xs flex items-center gap-1',
          isUnmatched
            ? 'bg-status-error text-white'
            : 'bg-highlight-green text-white'
        )}
      >
        <span>{label}</span>
      </div>
    </div>
  );
};
