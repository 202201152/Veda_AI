import React from 'react';
import {
  Home,
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SchoolProfileCard } from './SchoolProfileCard';
import { clsx } from 'clsx';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  schoolName?: string;
  schoolCity?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeSection = 'Exams',
  onSelectSection,
  schoolName,
  schoolCity,
}) => {
  const navItems = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'My Classroom', label: 'My Classroom', icon: Users },
    { id: 'Assignments', label: 'Assignments', icon: FileText },
    { id: 'Exams', label: 'Exams', icon: GraduationCap },
    { id: 'My Library', label: 'My Library', icon: BookOpen },
  ];

  return (
    <aside
      className={clsx(
        'h-screen bg-white border-r border-slate-border flex flex-col justify-between transition-all duration-300 z-30 select-none flex-shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header & Toolkit button */}
      <div className="p-4 flex flex-col gap-4">
        {/* Brand Row */}
        <div className="flex items-center justify-between min-h-[36px]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                V
              </div>
              <span className="font-bold text-lg text-slate-text-primary tracking-tight">
                VedaAI
              </span>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
              V
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AI Teacher's Toolkit Pill Button */}
        {!isCollapsed ? (
          <div className="w-full bg-charcoal text-white rounded-full p-2.5 px-3.5 border border-primary flex items-center gap-2.5 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5 fill-primary text-primary" />
            </div>
            <span className="text-xs font-semibold tracking-wide">
              AI Teacher&apos;s Toolkit
            </span>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-full bg-charcoal border border-primary flex items-center justify-center text-primary shadow-sm"
            title="AI Teacher's Toolkit"
          >
            <Sparkles className="w-4 h-4 fill-primary text-primary" />
          </div>
        )}

        {/* Primary Navigation List */}
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection?.(item.id)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-100/90 text-slate-text-primary font-semibold'
                    : 'text-slate-text-secondary hover:bg-slate-50 hover:text-slate-text-primary',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-slate-400'
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: School profile & expand button in collapsed state */}
      <div className="p-4 flex flex-col gap-3">
        <SchoolProfileCard
          schoolName={schoolName}
          city={schoolCity}
          isCollapsed={isCollapsed}
        />

        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
