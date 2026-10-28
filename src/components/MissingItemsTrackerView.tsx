import React from 'react';
import { InquiryCase, UserRole } from '../types/inquiry';
import { AlertCircle, CheckCircle2, ArrowRight, User, Building2 } from 'lucide-react';

interface MissingItemsTrackerViewProps {
  inquiries: InquiryCase[];
  currentRole: UserRole;
  onSelectCase: (caseId: string) => void;
  onResolveMissingItem: (caseId: string, itemId: string) => void;
}

export const MissingItemsTrackerView: React.FC<MissingItemsTrackerViewProps> = ({
  inquiries,
  currentRole,
  onSelectCase,
  onResolveMissingItem,
}) => {
  // Aggregate all missing items with case info
  const allMissing = inquiries.flatMap((inq) =>
    inq.missingItems.map((item) => ({
      ...item,
      caseId: inq.id,
      productName: inq.productName,
      company: inq.client.company,
      contactPerson: inq.client.contactPerson,
      salesRep: inq.salesRep,
    }))
  );

  const pendingItems = allMissing.filter((m) => m.status === 'pending');
  const resolvedItems = allMissing.filter((m) => m.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            待補資料與防錯追蹤中心 (Missing Items Tracker - FR-10, FR-11)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            由系統自動盤點圖稿、基材、厚度及特殊製程缺漏，集中監控客戶與內部回覆進度。
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-amber-50 text-amber-800 font-semibold rounded-lg border border-amber-200">
            待補中：{pendingItems.length} 項
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200">
            已補齊：{resolvedItems.length} 項
          </span>
        </div>
      </div>

      {/* Pending Items Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          待補齊項目清單 ({pendingItems.length})
        </h3>

        {pendingItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            目前無待補資料項目，全系統規格齊備！
          </div>
        ) : (
          pendingItems.map((item) => (
            <div
              key={`${item.caseId}-${item.id}`}
              className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    {item.caseId}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-900">{item.company}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{item.productName}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-950 text-xs">{item.label}</span>
                </div>

                <p className="text-slate-600 text-[11px] pl-6">{item.notes}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-6 pt-0.5">
                  <span>提請者：{item.requestedBy}</span>
                  <span>·</span>
                  <span>提出日期：{item.requestedAt}</span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">
                    責任窗口：{item.assignedToRole === 'client' ? `客戶 (${item.contactPerson})` : item.assignedToRole === 'sales' ? `業務 (${item.salesRep})` : '研發工程處'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => onResolveMissingItem(item.caseId, item.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  標記已補齊
                </button>
                <button
                  onClick={() => onSelectCase(item.caseId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>查看案件</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Items History */}
      {resolvedItems.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
            近期已補齊項目歷程 ({resolvedItems.length})
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {resolvedItems.map((item) => (
              <div
                key={`${item.caseId}-${item.id}`}
                className="p-3.5 flex items-center justify-between text-xs text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-blue-700 font-semibold">{item.caseId}</span>
                  <span className="text-slate-800 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>由 {item.resolvedBy} 補齊</span>
                  <span>·</span>
                  <span>{item.resolvedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
