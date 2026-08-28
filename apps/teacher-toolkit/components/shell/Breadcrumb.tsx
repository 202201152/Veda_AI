import React from 'react';
import { ClipboardList } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  current?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  current = 'Exams',
}) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[#64748B]">
      <ClipboardList className="w-4 h-4 text-[#64748B]" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="hover:text-[#0F172A] transition-colors cursor-pointer font-medium">
            {item.label}
          </span>
          <span className="text-slate-300">/</span>
        </React.Fragment>
      ))}
      <span className="font-semibold text-[#64748B]">{current}</span>
    </nav>
  );
};

