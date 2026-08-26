import React from 'react';
import { School } from 'lucide-react';

export interface SchoolProfileCardProps {
  schoolName?: string;
  city?: string;
  isCollapsed?: boolean;
}

export const SchoolProfileCard: React.FC<SchoolProfileCardProps> = ({
  schoolName = 'Delhi Public School',
  city = 'Bokaro Steel City',
  isCollapsed = false,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-border text-primary" title={`${schoolName} — ${city}`}>
        <School className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-border">
      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
        <School className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-slate-text-primary truncate">
          {schoolName}
        </div>
        <div className="text-[11px] text-slate-text-secondary truncate">
          {city}
        </div>
      </div>
    </div>
  );
};
