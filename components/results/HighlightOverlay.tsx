import React from 'react';
import { BBox } from '@/lib/types';
import { clsx } from 'clsx';

export interface HighlightOverlayProps {
  bbox: BBox;
  label?: string; // e.g. "Q1", "Q2", "Q2(a)"
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
        'absolute rounded-xl pointer-events-auto cursor-pointer transition-all duration-150 z-10',
        isUnmatched
          ? 'border-2 border-dashed border-[#DC4C3E] bg-[#DC4C3E]/15 shadow-sm'
          : isActive
          ? 'border-2 border-[#3F9142] bg-[#3F9142]/15 shadow-sm ring-1 ring-[#3F9142]/30'
          : 'border border-[#3F9142]/60 bg-[#3F9142]/5 hover:border-[#3F9142] hover:bg-[#3F9142]/15'
      )}
      title={`${label} answer region`}
    >
      {/* Pinned Green Badge at Top-Left Corner */}
      <div
        className={clsx(
          'absolute -top-3.5 left-2 text-[11px] font-bold px-2 py-0.5 rounded-t-md rounded-b-sm select-none shadow-2xs flex items-center gap-0.5',
          isUnmatched
            ? 'bg-[#DC4C3E] text-white'
            : 'bg-[#3F9142] text-white'
        )}
      >
        <span>{label}</span>
      </div>
    </div>
  );
};

