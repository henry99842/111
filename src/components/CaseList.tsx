import React, { useState } from 'react';
import { InquiryCase, UserRole, CaseStatus } from '../types/inquiry';
import { STATUS_CONFIG, USER_ROLES } from '../utils/constants';
import { Search, Filter, AlertCircle, CheckCircle, Clock, Eye, Layers, ArrowUpRight, Plus } from 'lucide-react';

interface CaseListProps {
  inquiries: InquiryCase[];
  currentRole: UserRole;
  onSelectCase: (caseId: string) => void;
  onOpenNewCase: () => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  inquiries,
  currentRole,
  onSelectCase,
  onOpenNewCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter inquiries based on role (Client only sees own cases)
  const roleFiltered = currentRole === 'client'
    ? inquiries.filter((c) => c.client.company.includes('誠光生醫'))
    : inquiries;

  const filteredInquiries = roleFiltered.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salesRep.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending_info') return item.status === 'pending_info';
    if (statusFilter === 'evaluating') return item.status === 'tech_evaluating';
    if (statusFilter === 'approval') return item.status === 'pending_approval' || item.status === 'pending_costing';
    if (statusFilter === 'quoted') return item.status === 'quoted' || item.status === 'client_reviewing';
    if (statusFilter === 'closed') return item.status.startsWith('closed');

    return true;
  });

  // Calculate high-level KPIs
  const totalCount = roleFiltered.length;
  const pendingInfoCount = roleFiltered.filter((c) => c.status === 'pending_info').length;
  const evaluatingCount = roleFiltered.filter((c) => c.status === 'tech_evaluating').length;
  const pendingApprovalCount = roleFiltered.filter((c) => c.status === 'pending_approval' || c.status === 'pending_costing').length;
  const wonCount = roleFiltered.filter((c) => c.status === 'closed_won').length;

  return (
    <div className="space-y-6">
      {/* Top Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">總詢價案件數</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 tabular-nums">{totalCount}</span>
            <span className="text-xs text-slate-400">案</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-amber-700 font-medium">待補資料與防錯</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-700 tabular-nums">{pendingInfoCount}</span>
            <span className="text-xs text-amber-600">案待補件</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-blue-700 font-medium">跨部門技術評估中</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-blue-700 tabular-nums">{evaluatingCount}</span>
            <span className="text-xs text-blue-600">案進行中</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-purple-700 font-medium">報價草稿待核准</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-purple-700 tabular-nums">{pendingApprovalCount}</span>
            <span className="text-xs text-purple-600">案待簽核</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-emerald-700 font-medium">已成交結案數</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700 tabular-nums">{wonCount}</span>
            <span className="text-xs text-emerald-600">案成案</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋案件編號、客戶名稱、產品品名或承辦業務..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
            </input>
          </div>

          {/* New case quick button */}
          <button
            onClick={onOpenNewCase}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{currentRole === 'client' ? '提出新詢價' : '建立新詢價案件'}</span>
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-400 mr-1 font-medium">狀態篩選：</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部案件 ({roleFiltered.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_info')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'pending_info'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            待補資料 ({roleFiltered.filter((c) => c.status === 'pending_info').length})
          </button>
          <button
            onClick={() => setStatusFilter('evaluating')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'evaluating'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            技術評估中 ({roleFiltered.filter((c) => c.status === 'tech_evaluating').length})
          </button>
          <button
            onClick={() => setStatusFilter('approval')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'approval'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            待核價 / 核准 ({pendingApprovalCount})
          </button>
          <button
            onClick={() => setStatusFilter('quoted')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'quoted'
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            已報價 / 客戶確認 ({roleFiltered.filter((c) => c.status === 'quoted' || c.status === 'client_reviewing').length})
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'closed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            已結案 ({roleFiltered.filter((c) => c.status.startsWith('closed')).length})
          </button>
        </div>
      </div>

      {/* Main High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4 w-32">案件編號</th>
                <th className="py-3 px-4 w-52">客戶名稱 / 承辦業務</th>
                <th className="py-3 px-4 min-w-[200px]">產品名稱 / 規格定版</th>
                <th className="py-3 px-4 w-36 text-center">缺漏防錯指標</th>
                <th className="py-3 px-4 w-44 text-center">跨部門確認進度</th>
                <th className="py-3 px-4 w-32 text-center">案件狀態</th>
                <th className="py-3 px-4 w-28 text-right">建立日期</th>
                <th className="py-3 px-4 w-24 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    無符合篩選條件的詢價案件。
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => {
                  const statusInfo = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;
                  const pendingMissing = inq.missingItems.filter((m) => m.status === 'pending');
                  const completedTasks = inq.deptTasks.filter((t) => t.status === 'completed');

                  return (
                    <tr
                      key={inq.id}
                      onClick={() => onSelectCase(inq.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Case ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 tabular-nums">
                          {inq.id}
                        </span>
                      </td>

                      {/* Customer / Sales */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[190px]">
                          {inq.client.company}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{inq.client.contactPerson}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600">{inq.salesRep.split(' ')[0]}</span>
                        </div>
                      </td>

                      {/* Product Name & Spec Version */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 leading-snug">
                          {inq.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                            定版 {inq.currentSpecVersionId}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-600 truncate max-w-[200px]">
                            {inq.productCategory}
                          </span>
                        </div>
                      </td>

                      {/* Missing items indicator (FR-10, FR-11) */}
                      <td className="py-3 px-4 text-center">
                        {pendingMissing.length > 0 ? (
                          <div className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>待補 {pendingMissing.length} 項</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>規格齊全</span>
                          </div>
                        )}
                      </td>

                      {/* Department confirmation progress */}
                      <td className="py-3 px-4 text-center">
                        {inq.deptTasks.length > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-medium text-slate-700 tabular-nums">
                              已回覆 {completedTasks.length} / {inq.deptTasks.length} 部門
                            </span>
                            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{
                                  width: `${(completedTasks.length / inq.deptTasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">尚未指派任務</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px] tabular-nums">
                        {inq.createdAt}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(inq.id);
                          }}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>查看</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
