import React from 'react';
import { NotificationItem, UserRole } from '../types/inquiry';
import { X, Check, Bell, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

interface NotificationCenterModalProps {
  notifications: NotificationItem[];
  currentRole: UserRole;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  currentRole,
  onClose,
  onSelectCase,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  // Filter notifications for this role or general
  const filtered = notifications.filter(
    (n) => n.recipientRole === currentRole || currentRole === 'admin' || currentRole === 'sales'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">通知與待辦中心 (FR-25 ~ FR-28)</h2>
              <p className="text-xs text-slate-500">
                跨部門任務指派、資料待補提醒、報價待核准與逾期警示
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            >
              全部標為已讀
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              目前沒有未讀通知或待辦提醒。
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg transition-colors mb-2 ${
                  !item.read ? 'bg-blue-50/70 border border-blue-100' : 'bg-slate-50 border border-slate-200/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.type === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : item.type === 'quote_pending' ? (
                      <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    ) : (
                      <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.content}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>關聯案件：{item.caseId}</span>
                        <span>·</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectCase(item.caseId);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      <span>前往案件</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {!item.read && (
                      <button
                        onClick={() => onMarkAsRead(item.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        標為已讀
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>依權限對應業務、研發、生產、採購、品管或核價主管之待辦推播。</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
