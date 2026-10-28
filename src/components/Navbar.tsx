import React from 'react';
import { UserRole } from '../types/inquiry';
import { Bell, Plus, Layers, FileSpreadsheet, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenNewCase: () => void;
  activeNavTab: 'cases' | 'departments' | 'quotations' | 'missing_items' | 'workflow_guide';
  onNavTabChange: (tab: 'cases' | 'departments' | 'quotations' | 'missing_items' | 'workflow_guide') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  unreadCount,
  onOpenNotifications,
  onOpenNewCase,
  activeNavTab,
  onNavTabChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div 
          onClick={() => onNavTabChange('cases')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AP
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            APEX 詢價與技術確認協同平台
          </span>
        </div>

        {/* Zone 2: 4–5 nav links, 1–2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavTabChange('cases')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeNavTab === 'cases'
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            詢價案件總覽
          </button>

          {currentRole !== 'client' && (
            <button
              onClick={() => onNavTabChange('departments')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                activeNavTab === 'departments'
                  ? 'text-blue-600 border-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              技術確認工作台
            </button>
          )}

          <button
            onClick={() => onNavTabChange('quotations')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeNavTab === 'quotations'
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            報價與核價紀錄
          </button>

          <button
            onClick={() => onNavTabChange('missing_items')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeNavTab === 'missing_items'
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            待補資料追蹤
          </button>

          <button
            onClick={() => onNavTabChange('workflow_guide')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeNavTab === 'workflow_guide'
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            八階流程規範
          </button>
        </nav>

        {/* Zone 3: 1 primary action + notification button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="通知中心"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={onOpenNewCase}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{currentRole === 'client' ? '提交詢價需求' : '建立詢價案件'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
