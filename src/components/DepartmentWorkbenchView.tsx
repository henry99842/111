import React, { useState } from 'react';
import { InquiryCase, DepartmentType, UserRole } from '../types/inquiry';
import { FEASIBILITY_CONFIG } from '../utils/constants';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Filter, Building2, User } from 'lucide-react';

interface DepartmentWorkbenchViewProps {
  inquiries: InquiryCase[];
  currentRole: UserRole;
  onSelectCase: (caseId: string) => void;
}

export const DepartmentWorkbenchView: React.FC<DepartmentWorkbenchViewProps> = ({
  inquiries,
  currentRole,
  onSelectCase,
}) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentType | 'all'>('all');

  // Flatten all department tasks with case context
  const allTasks = inquiries.flatMap((inq) =>
    inq.deptTasks.map((task) => ({
      ...task,
      caseId: inq.id,
      caseName: inq.productName,
      clientCompany: inq.client.company,
      targetDate: inq.targetDate,
      salesRep: inq.salesRep,
    }))
  );

  const filteredTasks = allTasks.filter((t) => {
    if (selectedDept === 'all') return true;
    return t.dept === selectedDept;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            跨部門技術確認工作台 (Department Engineering Workbench)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            由研發、生產、採購與品管部門共用，同步確認材料可行性、機台排程、單價庫存與驗收標準。
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedDept === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            全部部門 ({allTasks.length})
          </button>
          <button
            onClick={() => setSelectedDept('rd')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedDept === 'rd'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            研發／工程部 ({allTasks.filter((t) => t.dept === 'rd').length})
          </button>
          <button
            onClick={() => setSelectedDept('production')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedDept === 'production'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            生產／製程部 ({allTasks.filter((t) => t.dept === 'production').length})
          </button>
          <button
            onClick={() => setSelectedDept('procurement')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedDept === 'procurement'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            資材採購部 ({allTasks.filter((t) => t.dept === 'procurement').length})
          </button>
          <button
            onClick={() => setSelectedDept('qc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedDept === 'qc'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            品質保證部 ({allTasks.filter((t) => t.dept === 'qc').length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            該部門目前無指派確認任務。
          </div>
        ) : (
          filteredTasks.map((task) => {
            const feasConfig = FEASIBILITY_CONFIG[task.feasibility] || FEASIBILITY_CONFIG.pending;

            return (
              <div
                key={task.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 tabular-nums">
                          {task.caseId}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-700">{task.deptName}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h3>
                      <p className="text-xs text-slate-500">{task.caseName}（{task.clientCompany}）</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${feasConfig.bgClass} ${feasConfig.textClass}`}>
                        {feasConfig.label}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        回覆日：{task.dueDate}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 mt-3">
                    <p><strong className="text-slate-800">材料建議：</strong>{task.materialSuggestions || '尚待評估'}</p>
                    <p><strong className="text-slate-800">製程條件：</strong>{task.processSuggestions || '尚待評估'}</p>
                    <p><strong className="text-slate-800">成本/交期：</strong>{task.estimatedCostOrTime || '尚待評估'}</p>
                    {task.risks && (
                      <p className="text-amber-900 bg-amber-50 p-2 rounded border border-amber-200/50">
                        <strong>潛在技術風險：</strong>{task.risks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>指派負責人：{task.assignedTo}</span>
                  </div>

                  <button
                    onClick={() => onSelectCase(task.caseId)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    <span>開啟案件細節</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
