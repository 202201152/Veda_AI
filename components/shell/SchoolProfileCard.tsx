import React from 'react';

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
      <div 
        className="w-10 h-10 mx-auto rounded-xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden p-1 shadow-2xs border border-slate-200/70 cursor-pointer"
        title={`${schoolName} — ${city}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Frame 39959.png"
          alt={schoolName}
          className="w-full h-full object-cover object-left"
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xs border border-slate-200/60 cursor-pointer hover:shadow-xs transition-shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/Frame 39959.png"
        alt={`${schoolName} - ${city}`}
        className="w-full h-auto object-contain block"
      />
    </div>
  );
};


