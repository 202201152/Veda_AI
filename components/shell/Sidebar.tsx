import React from 'react';
import {
  LayoutGrid,
  Users,
  FileText,
  ClipboardCheck,
  PieChart,
  Settings,
  Sparkles,
  ChevronsRight,
  PanelLeftClose,
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
    { id: 'Home', label: 'Home', icon: LayoutGrid },
    { id: 'My Classroom', label: 'My Classroom', icon: Users },
    { id: 'Assignments', label: 'Assignments', icon: FileText },
    { id: 'Exams', label: 'Exams', icon: ClipboardCheck },
    { id: 'My Library', label: 'My Library', icon: PieChart },
  ];

  return (
    <aside
      className={clsx(
        'h-full bg-white rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all duration-300 z-30 select-none flex-shrink-0',
        isCollapsed ? 'w-[76px] py-5 px-3' : 'w-[260px] p-5'
      )}
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-5">
        {/* Brand Row */}
        {!isCollapsed ? (
          <div 
            onClick={onToggleCollapse}
            className="flex items-center justify-between w-full min-h-[36px] cursor-pointer group"
            title="Toggle sidebar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Frame 1618872393.png"
              alt="VedaAI"
              className="h-7 w-full object-contain select-none group-hover:opacity-90 transition-opacity"
            />
          </div>
        ) : (
          <div 
            onClick={onToggleCollapse}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            title="Expand sidebar"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2D2E32] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              V
            </div>
          </div>
        )}



        {/* AI Teacher's Toolkit Pill Button */}
        {!isCollapsed ? (
          <div className="w-full bg-[#2D2E32] text-white rounded-full py-2.5 px-4 border border-[#F4522D] flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:bg-[#1E1E1E] transition-colors">
            <Sparkles className="w-4 h-4 fill-[#F4522D] text-[#F4522D]" />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              AI Teacher&apos;s Toolkit
            </span>
          </div>
        ) : (
          <div
            onClick={onToggleCollapse}
            className="w-10 h-10 mx-auto rounded-full bg-[#2D2E32] border border-[#F4522D] flex items-center justify-center text-[#F4522D] shadow-xs cursor-pointer hover:bg-[#1E1E1E] transition-colors"
            title="AI Teacher's Toolkit"
          >
            <Sparkles className="w-4 h-4 fill-[#F4522D] text-[#F4522D]" />
          </div>
        )}

        {/* Primary Navigation List */}
        <nav className="flex flex-col gap-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection?.(item.id)}
                className={clsx(
                  'flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13.5px] font-medium transition-all',
                  isActive
                    ? 'bg-[#F1F5F9] text-[#0F172A] font-bold shadow-2xs'
                    : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]',
                  isCollapsed && 'justify-center px-0 h-11 w-11 mx-auto rounded-xl'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={clsx(
                    'w-[18px] h-[18px] flex-shrink-0',
                    isActive ? 'text-[#0F172A]' : 'text-[#64748B]'
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Settings & School profile & Expand button */}
      <div className="flex flex-col gap-3">
        {/* Settings button */}
        {!isCollapsed ? (
          <button
            onClick={() => onSelectSection?.('Settings')}
            className={clsx(
              'flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13.5px] font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors',
              activeSection === 'Settings' && 'bg-[#F1F5F9] text-[#0F172A] font-bold'
            )}
          >
            <Settings className="w-[18px] h-[18px] text-[#64748B]" />
            <span>Settings</span>
          </button>
        ) : null}

        {/* School Profile Card */}
        <SchoolProfileCard
          schoolName={schoolName}
          city={schoolCity}
          isCollapsed={isCollapsed}
        />

        {/* Expand Sidebar Chevron when Collapsed */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

