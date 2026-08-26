import React from 'react';
import { Folder } from 'lucide-react';

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
    <nav className="flex items-center space-x-2 text-sm text-slate-text-secondary">
      <Folder className="w-4 h-4 text-slate-400" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="hover:text-slate-text-primary transition-colors cursor-pointer">
            {item.label}
          </span>
          <span className="text-slate-300">/</span>
        </React.Fragment>
      ))}
      <span className="font-medium text-slate-text-primary">{current}</span>
    </nav>
  );
};
