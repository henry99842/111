import React from 'react';
import { UserRole } from '../types/inquiry';
import { USER_ROLES } from '../utils/constants';
import { ShieldAlert, UserCheck, Eye, EyeOff } from 'lucide-react';

interface RoleSwitcherBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ currentRole, onRoleChange }) => {
  const activeRoleInfo = USER_ROLES.find(r => r.id === currentRole) || USER_ROLES[0];

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          體驗視角切換：
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {USER_ROLES.map((role) => {
            const isActive = role.id === currentRole;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                title={role.description}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 text-slate-400 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-medium">{activeRoleInfo.userName}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{activeRoleInfo.department}</span>
        </div>

        {currentRole === 'client' ? (
          <div className="flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
            <EyeOff className="w-3 h-3 text-amber-400 shrink-0" />
            <span>客戶權限：內部成本、研發討論與核價日誌已嚴格隱藏</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-400">
            <Eye className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>內部權限：可查閱完整工程參數與成本毛利</span>
          </div>
        )}
      </div>
    </div>
  );
};
