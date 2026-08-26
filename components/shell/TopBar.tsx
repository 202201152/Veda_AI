import React from 'react';
import {
  ArrowLeft,
  HelpCircle,
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
  showBack = true,
  breadcrumbCurrent = 'Exams',
  teacherName = 'Mrs. Sharma',
  teacherAvatarUrl,
  unreadNotifications = true,
  onOpenHelp,
  onOpenNotifications,
  onOpenAiTools,
  onToggleMobileMenu,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-border px-4 sm:px-6 flex items-center justify-between select-none z-20 sticky top-0">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="sm:hidden p-2 -ml-2 rounded-lg text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {showBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
            title="Go back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:block">
          <Breadcrumb current={breadcrumbCurrent} />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Help icon */}
        <button
          onClick={onOpenHelp}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
          title="Help & Documentation"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-text-secondary hover:text-slate-text-primary hover:bg-slate-100 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-error ring-2 ring-white" />
          )}
        </button>

        {/* AI Action Icon */}
        <button
          onClick={onOpenAiTools}
          className="w-9 h-9 rounded-full bg-primary-light/60 flex items-center justify-center text-primary hover:bg-primary-light transition-colors"
          title="AI Assistant"
          aria-label="AI Tools"
        >
          <Sparkles className="w-4 h-4 fill-primary" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-border mx-1" />

        {/* User Account / Profile */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer group">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-light border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
            {teacherAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacherAvatarUrl}
                alt={teacherName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs">👩‍🏫</span>
            )}
          </div>
          <span className="hidden md:inline text-sm font-semibold text-slate-text-primary group-hover:text-primary transition-colors">
            {teacherName}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-text-secondary group-hover:text-slate-text-primary transition-colors hidden sm:inline" />
        </div>
      </div>
    </header>
  );
};
