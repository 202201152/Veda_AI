import React from 'react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

export interface TopBarProps {
  onBack?: () => void;
  showBack?: boolean;
  breadcrumbCurrent?: string;
  teacherName?: string;
  teacherAvatarUrl?: string;
  unreadNotifications?: boolean;
  onOpenHelp?: () => void;
  onOpenNotifications?: () => void;
  onOpenAiTools?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onBack,
  showBack = false,
  breadcrumbCurrent = 'Exams',
  teacherName = 'Madhur Rastogi',
  teacherAvatarUrl,
  unreadNotifications = true,
  onOpenHelp,
  onOpenNotifications,
  onOpenAiTools,
  onToggleMobileMenu,
}) => {
  return (
    <header className="h-16 bg-white px-5 sm:px-8 flex items-center justify-between select-none z-20 flex-shrink-0">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        {/* Desktop Back button */}
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          title="Go back"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Desktop Breadcrumb */}
        <div className="hidden sm:block">
          <Breadcrumb current={breadcrumbCurrent} />
        </div>

        {/* Mobile VedaAI wordmark without collapse icon */}
        <div className="sm:hidden flex items-center overflow-hidden w-[108px] h-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/Frame 1618872393.png"
            alt="VedaAI"
            className="h-full w-auto max-w-none object-left select-none"
          />
        </div>

      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Help icon - circular outline with ? */}
        <button
          onClick={onOpenHelp}
          className="hidden sm:flex w-8 h-8 rounded-full border border-slate-300 items-center justify-center text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 text-sm font-semibold transition-colors shadow-2xs"
          title="Help"
          aria-label="Help"
        >
          ?
        </button>

        {/* Notification Bell with red dot */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#F4522D] ring-2 ring-white" />
          )}
        </button>

        {/* AI Action Icon */}
        <button
          onClick={onOpenAiTools}
          className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-slate-700 hover:text-[#F4522D] hover:bg-slate-100 transition-colors"
          title="AI Assistant"
          aria-label="AI Tools"
        >
          <Sparkles className="w-5 h-5 fill-slate-700 hover:fill-[#F4522D] text-slate-700 hover:text-[#F4522D]" />
        </button>

        {/* User Account / Profile */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center shadow-2xs flex-shrink-0">
            {teacherAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacherAvatarUrl}
                alt={teacherName}
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/teacher-avatar.png"
                alt={teacherName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="hidden md:inline text-[13.5px] font-semibold text-[#0F172A] group-hover:text-[#F4522D] transition-colors">
            {teacherName}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-[#0F172A] transition-colors hidden sm:inline" />
        </div>

        {/* Mobile Hamburger menu */}
        <button
          onClick={onToggleMobileMenu}
          className="sm:hidden p-1.5 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

