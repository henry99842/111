import React, { useState } from 'react';
import {
  InquiryCase,
  UserRole,
  SpecVersion,
  DepartmentTask,
  InquiryQuestion,
  QuoteVersion,
  AuditLogEntry,
  Attachment,
} from '../types/inquiry';
import { STATUS_CONFIG, FEASIBILITY_CONFIG, TECH_FIELD_HELP, inspectMissingItems } from '../utils/constants';
import {
  ArrowLeft,
  GitCompare,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Upload,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Info,
  DollarSign,
  Printer,
  Edit3,
  Calendar,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface CaseDetailProps {
  inquiry: InquiryCase;
  currentRole: UserRole;
  onBack: () => void;
  onUpdateInquiry: (updated: InquiryCase) => void;
  onOpenDiff: (baseId?: string, targetId?: string) => void;
  onOpenFormalQuote: (quote: QuoteVersion) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({
  inquiry,
  currentRole,
  onBack,
  onUpdateInquiry,
  onOpenDiff,
  onOpenFormalQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'tasks' | 'questions' | 'attachments' | 'quote' | 'logs'>('specs');
  const [selectedSpecVersionId, setSelectedSpecVersionId] = useState<string>(inquiry.currentSpecVersionId);

  // Modals inside detail
  const [showNewSpecModal, setShowNewSpecModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);

  // Selected spec
  const currentSpec = inquiry.specVersions.find((s) => s.versionId === selectedSpecVersionId) || inquiry.specVersions[0];
  const isClient = currentRole === 'client';

  // State for adding a new question
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionTarget, setNewQuestionTarget] = useState<'client' | 'internal'>('client');
  const [replyingQId, setReplyingQId] = useState<string | null>(null);
  const [replyAnswerText, setReplyAnswerText] = useState('');

  // Missing items
  const pendingMissingItems = inquiry.missingItems.filter((m) => m.status === 'pending');

  // Handle resolving a missing item
  const handleResolveMissingItem = (id: string, notes?: string) => {
    const updatedMissing = inquiry.missingItems.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString().split('T')[0],
          resolvedBy: isClient ? inquiry.client.contactPerson : '承辦業務',
          notes: notes || m.notes,
        };
      }
      return m;
    });

    const newLogs: AuditLogEntry[] = [
      ...inquiry.auditLogs,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        operator: isClient ? inquiry.client.contactPerson : '承辦業務',
        operatorRole: currentRole,
        actionType: 'spec_update',
        summary: `已補齊項目：${inquiry.missingItems.find((m) => m.id === id)?.label}`,
        isInternalOnly: false,
      },
    ];

    // If all missing items resolved and status was pending_info, advance to tech_evaluating
    const stillPending = updatedMissing.filter((m) => m.status === 'pending');
    let nextStatus = inquiry.status;
    if (stillPending.length === 0 && inquiry.status === 'pending_info') {
      nextStatus = 'tech_evaluating';
    }

    onUpdateInquiry({
      ...inquiry,
      status: nextStatus,
      missingItems: updatedMissing,
      auditLogs: newLogs,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  // Handle submitting a new question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: InquiryQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      askedBy: isClient ? inquiry.client.contactPerson : '內部人員',
      askedRole: currentRole,
      askedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      target: isClient ? 'client' : newQuestionTarget,
      assignedTo: isClient ? inquiry.salesRep : '客戶/負責人',
      status: 'open',
    };

    onUpdateInquiry({
      ...inquiry,
      questions: [newQ, ...inquiry.questions],
      auditLogs: [
        ...inquiry.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          operator: isClient ? inquiry.client.contactPerson : '業務/研發',
          operatorRole: currentRole,
          actionType: 'spec_update',
          summary: `提出問題：${newQuestionText.slice(0, 30)}...`,
          isInternalOnly: newQuestionTarget === 'internal' && !isClient,
        },
      ],
    });

    setNewQuestionText('');
  };

  // Handle replying to question
  const handleReplyQuestion = (qId: string) => {
    if (!replyAnswerText.trim()) return;

    const updatedQuestions = inquiry.questions.map((q) => {
      if (q.id === qId) {
        return {
          ...q,
          status: 'answered' as const,
          answer: replyAnswerText.trim(),
          answeredBy: isClient ? inquiry.client.contactPerson : '承辦人員',
          answeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return q;
    });

    onUpdateInquiry({
      ...inquiry,
      questions: updatedQuestions,
      auditLogs: [
        ...inquiry.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          operator: isClient ? inquiry.client.contactPerson : '經辦人',
          operatorRole: currentRole,
          actionType: 'client_reply',
          summary: `回覆問題：${replyAnswerText.slice(0, 30)}...`,
          isInternalOnly: false,
        },
      ],
    });

    setReplyingQId(null);
    setReplyAnswerText('');
  };

  // Handle department evaluation response update
  const handleUpdateTask = (
    taskId: string,
    feasibility: 'feasible' | 'conditionally_feasible' | 'infeasible',
    suggestions: string,
    risks: string
  ) => {
    const updatedTasks = inquiry.deptTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: new Date().toISOString().split('T')[0],
          feasibility,
          materialSuggestions: suggestions,
          risks,
          updatedBy: currentRole,
        };
      }
      return t;
    });

    onUpdateInquiry({
      ...inquiry,
      deptTasks: updatedTasks,
      auditLogs: [
        ...inquiry.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          operator: '評估工程師',
          operatorRole: currentRole,
          actionType: 'eval_submit',
          summary: `完成部門技術評估：${feasibility === 'feasible' ? '技術可行' : '條件可行'}`,
          isInternalOnly: true,
        },
      ],
    });
  };

  const statusConfig = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.new;

  return (
    <div className="space-y-6">
      {/* Back and Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-xl border border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回案件清單</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-700 tabular-nums">
              {inquiry.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-slate-400">·</span>
            <h1 className="text-base font-bold text-slate-900">{inquiry.productName}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>客戶：<strong className="text-slate-800">{inquiry.client.company}</strong> ({inquiry.client.contactPerson})</span>
            <span>·</span>
            <span>承辦業務：<strong className="text-slate-800">{inquiry.salesRep}</strong></span>
            <span>·</span>
            <span>期望交期：<strong className="text-slate-800 tabular-nums">{inquiry.targetDate}</strong></span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {inquiry.specVersions.length > 1 && (
            <button
              onClick={() => onOpenDiff(inquiry.specVersions[0].versionId, inquiry.currentSpecVersionId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="版本差異比對 (FR-12)"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600" />
              <span>版本差異比對</span>
            </button>
          )}

          {currentRole !== 'client' && (
            <button
              onClick={() => setShowNewSpecModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>建立新規格版 (vX.X)</span>
            </button>
          )}

          {inquiry.quotes.length > 0 && (
            <button
              onClick={() => onOpenFormalQuote(inquiry.quotes[0])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>檢視正式報價單 (FR-23)</span>
            </button>
          )}
        </div>
      </div>

      {/* 8-Stage Workflow Progress Stepper (FR-05 & Sec 3) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            案件生命週期流程階段
          </span>
          <span className="text-xs text-slate-500">
            目前階段：<strong className="text-blue-700 font-semibold">{statusConfig.label}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center text-xs">
          {[
            { id: 'new', label: '1. 新建需求', step: 1 },
            { id: 'pending_info', label: '2. 待補防錯', step: 2 },
            { id: 'tech_evaluating', label: '3. 技術評估', step: 3 },
            { id: 'pending_costing', label: '4. 待核價', step: 4 },
            { id: 'pending_approval', label: '5. 主管核准', step: 5 },
            { id: 'quoted', label: '6. 已正式報價', step: 6 },
            { id: 'client_reviewing', label: '7. 客戶確認', step: 7 },
            { id: 'closed', label: '8. 結案成交', step: 8 },
          ].map((s) => {
            const currentStepNum = statusConfig.step;
            const isCurrent = s.step === currentStepNum;
            const isPast = s.step < currentStepNum;

            return (
              <div
                key={s.id}
                className={`p-2 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                    : isPast
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[11px] leading-tight">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-medium bg-white px-4 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('specs')}
          className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'specs'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>規格與完整度檢查</span>
          {pendingMissingItems.length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {pendingMissingItems.length}
            </span>
          )}
        </button>

        {currentRole !== 'client' && (
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>跨部門技術確認</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {inquiry.deptTasks.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'questions'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>待確認問題 (RFI)</span>
          {inquiry.questions.filter((q) => q.status === 'open').length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {inquiry.questions.filter((q) => q.status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attachments')}
          className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'attachments'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>圖稿與附件檔案</span>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
            {inquiry.attachments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quote')}
          className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quote'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>報價與主管核價</span>
          {inquiry.quotes.length > 0 && (
            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {inquiry.quotes[0].version}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3.5 px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>確認紀錄與稽核 (FR-17)</span>
        </button>
      </div>

      {/* Tab 1: Specs & Completeness Checker */}
      {activeTab === 'specs' && (
        <div className="space-y-6">
          {/* FR-10 & FR-11: Completeness & Missing Items Engine Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>資料齊備度與缺漏防錯檢查 (FR-10, FR-11)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  系統依製程規則自動比對必要工程欄位與圖稿，防止規格未定即進入錯誤開模或盲目報價。
                </p>
              </div>

              <div className="text-xs">
                {pendingMissingItems.length === 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    所有必要資料與附件已齊備
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-3 py-1 rounded-full font-semibold border border-amber-200">
                    尚有 {pendingMissingItems.length} 項待補項目
                  </span>
                )}
              </div>
            </div>

            {/* Missing items list */}
            <div className="space-y-2">
              {inquiry.missingItems.length === 0 ? (
                <div className="p-4 bg-emerald-50/50 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>系統檢查通過：本案件尺寸、材料、油墨及刀模圖均符合初審齊備度標準。</span>
                </div>
              ) : (
                inquiry.missingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      item.status === 'pending'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.status === 'pending' ? 'text-amber-900' : 'text-slate-700 line-through'}`}>
                          {item.label}
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] text-slate-600 font-medium">
                          負責單位：{item.assignedToRole === 'client' ? '客戶窗口' : item.assignedToRole === 'sales' ? '承辦業務' : '研發工程'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.status === 'pending' ? 'bg-amber-200/60 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status === 'pending' ? '待補中' : '已補齊'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{item.notes}</p>
                    </div>

                    {item.status === 'pending' && (
                      <div className="shrink-0 flex items-center gap-2">
                        {isClient && item.assignedToRole === 'client' ? (
                          <button
                            onClick={() => handleResolveMissingItem(item.id, '客戶已補充規格說明並確認更新')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-2xs transition-colors cursor-pointer"
                          >
                            立即回覆並標記已補齊
                          </button>
                        ) : !isClient ? (
                          <button
                            onClick={() => handleResolveMissingItem(item.id, '業務已向客戶確認並補正齊備')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium transition-colors cursor-pointer"
                          >
                            標記為已補齊 (Resolve)
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Technical Spec Matrix (FR-06, FR-07, FR-08, FR-09) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">技術確認規格表 (Technical Specification)</span>
                {/* Version switcher */}
                <div className="flex items-center gap-1 ml-2 bg-slate-100 p-1 rounded-lg">
                  {inquiry.specVersions.map((v) => (
                    <button
                      key={v.versionId}
                      onClick={() => setSelectedSpecVersionId(v.versionId)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                        selectedSpecVersionId === v.versionId
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v.versionId}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {inquiry.specVersions.length > 1 && (
                  <button
                    onClick={() => onOpenDiff(inquiry.specVersions[0].versionId, currentSpec.versionId)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>比對與前版本差異</span>
                  </button>
                )}
              </div>
            </div>

            {/* Version Metadata banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">版本備註：</span>
                <span>{currentSpec.changeSummary}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                建立者：{currentSpec.createdByName} · 時間：{currentSpec.createdAt}
              </div>
            </div>

            {/* Technical Spec Parameter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Dimensions */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. 產品尺寸與形狀</span>
                  <span className="text-[11px] text-slate-400">FR-06</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 tabular-nums">
                  {currentSpec.dimensions.widthMm} × {currentSpec.dimensions.heightMm} mm
                </p>
                <p className="text-slate-600">
                  幾何形狀：{currentSpec.dimensions.shape}
                  {currentSpec.dimensions.radiusMm ? ` (倒角 R${currentSpec.dimensions.radiusMm}mm)` : ''}
                </p>
              </div>

              {/* Ink Type */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">2. 油墨種類配方</span>
                  <span className="text-[11px] text-slate-400">FR-07</span>
                </div>
                <p className={`text-sm font-semibold ${currentSpec.inkType === '待確認' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentSpec.inkType}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {TECH_FIELD_HELP.inkType.desc}
                </p>
              </div>

              {/* Substrate Type */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">3. 膜／紙種類 (基材)</span>
                  <span className="text-[11px] text-slate-400">FR-07</span>
                </div>
                <p className={`text-sm font-semibold ${currentSpec.substrateType === '待確認' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentSpec.substrateType}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {TECH_FIELD_HELP.substrateType.desc}
                </p>
              </div>

              {/* Thickness / Weight */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">4. 厚度或克重</span>
                  <span className="text-[11px] text-slate-400">FR-07</span>
                </div>
                <p className={`text-sm font-semibold tabular-nums ${currentSpec.thicknessWeight === '待確認' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentSpec.thicknessWeight}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {TECH_FIELD_HELP.thicknessWeight.example}
                </p>
              </div>

              {/* Ink Coverage */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">5. 油墨覆蓋率</span>
                  <span className="text-[11px] text-slate-400">FR-08</span>
                </div>
                <p className={`text-sm font-semibold ${currentSpec.inkCoverage === '待確認' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentSpec.inkCoverage}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  影響製程開機調墨與油墨耗損成本計算。
                </p>
              </div>

              {/* Surface Finishes */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">6. 表面處理工藝</span>
                  <span className="text-[11px] text-slate-400">FR-08</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {currentSpec.surfaceFinishing.length > 0 ? (
                    currentSpec.surfaceFinishing.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-800 font-medium rounded text-[11px]">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">無特殊表面覆膜</span>
                  )}
                </div>
              </div>

              {/* Special Processes */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">7. 特殊增值製程工藝</span>
                  <span className="text-[11px] text-slate-400">FR-08</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentSpec.specialProcesses.length > 0 ? (
                    currentSpec.specialProcesses.map((p) => (
                      <span key={p} className="px-2.5 py-1 bg-purple-100 text-purple-900 font-medium rounded text-xs">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">常規印刷無特殊工序</span>
                  )}
                </div>
              </div>

              {/* Packaging */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">8. 出貨包裝與收捲規格</span>
                  <span className="text-[11px] text-slate-400">FR-06</span>
                </div>
                <p className="text-xs text-slate-800">{currentSpec.packagingRequirement}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Department Tasks & Collaboration (FR-13 ~ FR-15) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  跨部門技術確認工作板 (Cross-Department Tasks - FR-13~15)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  指派研發、生產、採購及品管部門確認材料可行性、設備排程、單價與驗收標準。
                </p>
              </div>

              {currentRole !== 'client' && (
                <button
                  onClick={() => setShowAssignTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>指派新評估任務</span>
                </button>
              )}
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiry.deptTasks.map((task) => {
                const feasConfig = FEASIBILITY_CONFIG[task.feasibility] || FEASIBILITY_CONFIG.pending;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{task.deptName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 text-xs">{task.assignedTo}</span>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-xs mt-1">{task.title}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${feasConfig.bgClass} ${feasConfig.textClass}`}>
                          {feasConfig.label}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>截止：{task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluations content */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700">材料建議：</span>
                        <span className="text-slate-600 ml-1">{task.materialSuggestions || '尚待填寫'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">製程條件：</span>
                        <span className="text-slate-600 ml-1">{task.processSuggestions || '尚待填寫'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">成本或交期預估：</span>
                        <span className="text-slate-600 ml-1">{task.estimatedCostOrTime || '尚待填寫'}</span>
                      </div>
                      {task.risks && (
                        <div className="p-2 bg-amber-50 rounded border border-amber-200/60 text-amber-900">
                          <span className="font-semibold">技術風險評估：</span>
                          <span className="ml-1">{task.risks}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick update button for engineer */}
                    {task.status !== 'completed' && (
                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => {
                            const note = prompt('請輸入評估結論與材料建議：', task.materialSuggestions);
                            if (note) {
                              handleUpdateTask(task.id, 'feasible', note, '已驗證無重大製程干涉。');
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-medium rounded transition-colors cursor-pointer"
                        >
                          填報評估結果 (完成任務)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Questions & RFI (FR-16) */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  待確認問題與技術澄清 (FR-16 Questions & Clarifications)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  支援區分「需客戶確認」與「內部研討」兩種層級，嚴格保護內部工程機密。
                </p>
              </div>
            </div>

            {/* Submit question box */}
            <form onSubmit={handleAddQuestion} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <span className="font-bold text-slate-800 text-xs block">提出新的待確認問題</span>
              <textarea
                rows={2}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="輸入欲確認的規格疑問，例如：自動貼標電眼間隙要求、耐溫極限、滅菌方式..."
                className="w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-900"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                {!isClient ? (
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600 font-medium">發布對象：</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="target"
                        checked={newQuestionTarget === 'client'}
                        onChange={() => setNewQuestionTarget('client')}
                        className="text-blue-600"
                      />
                      <span className="text-slate-800">需客戶確認 (客戶可見)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="target"
                        checked={newQuestionTarget === 'internal'}
                        onChange={() => setNewQuestionTarget('internal')}
                        className="text-blue-600"
                      />
                      <span className="text-slate-800">內部部門討論 (客戶隱藏)</span>
                    </label>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    您提出的問題將直接轉交承辦業務與研發工程師回覆。
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                >
                  送出問題
                </button>
              </div>
            </form>

            {/* Questions list */}
            <div className="space-y-3">
              {inquiry.questions
                .filter((q) => !isClient || q.target === 'client')
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          q.target === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {q.target === 'client' ? '需客戶確認' : '內部討論'}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          由 {q.askedBy} 於 {q.askedAt} 提出
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        q.status === 'answered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {q.status === 'answered' ? '已回覆' : '待回覆'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 text-xs">{q.question}</p>

                    {q.answer ? (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold text-blue-700">回覆內容：</span>
                          <span>{q.answeredBy} · {q.answeredAt}</span>
                        </div>
                        <p>{q.answer}</p>
                      </div>
                    ) : (
                      <div>
                        {replyingQId === q.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={replyAnswerText}
                              onChange={(e) => setReplyAnswerText(e.target.value)}
                              placeholder="請輸入回覆說明..."
                              className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReplyingQId(null)}
                                className="px-2.5 py-1 text-slate-600 text-xs"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => handleReplyQuestion(q.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                              >
                                送出回覆
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingQId(q.id);
                              setReplyAnswerText('');
                            }}
                            className="mt-1 text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
                          >
                            + 撰寫回覆
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Attachments (FR-04) */}
      {activeTab === 'attachments' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  圖稿與附件檔案管理 (FR-04 Attachments)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  記錄檔案版本、上傳者與時間戳記，支援工程完稿、樣品照片與檢驗測試報告。
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>上傳新附件或新版圖稿</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-4">檔案名稱 / 類別</th>
                    <th className="py-2.5 px-4">規格版本</th>
                    <th className="py-2.5 px-4">檔案大小</th>
                    <th className="py-2.5 px-4">上傳者與時間</th>
                    <th className="py-2.5 px-4">備註說明</th>
                    <th className="py-2.5 px-4 text-center">可見性</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inquiry.attachments
                    .filter((a) => !isClient || a.isClientVisible)
                    .map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold">{att.fileName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{att.version}</td>
                        <td className="py-3 px-4 text-slate-500 tabular-nums">{att.fileSize}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{att.uploadedBy}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{att.uploadedAt}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{att.notes}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            att.isClientVisible ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {att.isClientVisible ? '公開客戶' : '內部機密'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Quotations & Approval (FR-19 ~ FR-24) */}
      {activeTab === 'quote' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  報價管理與主管核價 (FR-19 ~ FR-24)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  支援多階數量級距、成本結構試算、主管核准簽核、歷史版本與客戶反饋紀錄。
                </p>
              </div>

              <div className="flex items-center gap-2">
                {inquiry.quotes.length > 0 && (
                  <button
                    onClick={() => onOpenFormalQuote(inquiry.quotes[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>輸出正式報價單 (Print)</span>
                  </button>
                )}

                {currentRole === 'approver' && inquiry.quotes.length > 0 && inquiry.quotes[0].status === 'pending_approval' && (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>主管執行核價審核</span>
                  </button>
                )}
              </div>
            </div>

            {inquiry.quotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                目前尚未建立報價草稿。業務人員可在技術評估完成後發起草稿。
              </div>
            ) : (
              inquiry.quotes.map((q) => (
                <div key={q.quoteId} className="space-y-4">
                  {/* Quote header banner */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{q.quoteId}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-xs">
                          {q.version}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          q.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {q.status === 'approved' ? '主管已核准' : '待主管核准'}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">
                        規格定版：<strong className="text-slate-700">{q.specVersionRef}</strong> · 建立者：{q.createdByName} · 建立日期：{q.createdAt}
                      </div>
                    </div>

                    {q.approvalRecord && (
                      <div className="text-right text-xs">
                        <span className="text-emerald-700 font-bold">
                          ✓ 核准人：{q.approvalRecord.approverName}
                        </span>
                        <p className="text-slate-500 text-[11px]">{q.approvalRecord.reasons}</p>
                      </div>
                    )}
                  </div>

                  {/* Pricing table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-4">訂單數量 (張/PCS)</th>
                          {!isClient && (
                            <>
                              <th className="py-2.5 px-4 text-right">材料成本</th>
                              <th className="py-2.5 px-4 text-right">製程工費</th>
                              <th className="py-2.5 px-4 text-right">總單位成本</th>
                              <th className="py-2.5 px-4 text-right">毛利率 %</th>
                            </>
                          )}
                          <th className="py-2.5 px-4 text-right font-bold text-slate-900">
                            對外售價單價 (NT$)
                          </th>
                          <th className="py-2.5 px-4 text-right font-bold text-slate-900">
                            預估總金額 (NT$)
                          </th>
                          <th className="py-2.5 px-4 text-right">生產交期</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {q.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                              {item.tierQuantity.toLocaleString()}
                            </td>
                            {!isClient && (
                              <>
                                <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                                  ${item.materialCost.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                                  ${item.processCost.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                                  ${item.totalCost.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                                  {item.marginRate.toFixed(1)}%
                                </td>
                              </>
                            )}
                            <td className="py-3 px-4 text-right font-bold text-blue-700 tabular-nums text-sm">
                              NT$ {item.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                              NT$ {item.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                              約 {item.leadTimeDays} 工作天
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Conditions & Client Feedback */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <span className="font-bold text-slate-800">商務與交期條件：</span>
                      <p className="text-slate-600">• 付款條件：{q.conditions.paymentTerms}</p>
                      <p className="text-slate-600">• 交貨地點：{q.conditions.deliveryAssumptions}</p>
                      <p className="text-slate-600">• 報價效期：{q.conditions.validUntil}</p>
                      <p className="text-slate-600">• 開模費用：NT$ {q.conditions.toolingFee.toLocaleString()}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <span className="font-bold text-slate-800">客戶反饋結果 (FR-24)：</span>
                      {q.clientFeedback ? (
                        <div className="mt-1 space-y-1 text-slate-700">
                          <p>
                            狀態：
                            <span className="font-semibold text-blue-700 ml-1">
                              {q.clientFeedback.result === 'accepted' && '已接受成交'}
                              {q.clientFeedback.result === 'negotiating' && '議價協商中'}
                              {q.clientFeedback.result === 'revision_requested' && '要求修改規格'}
                              {q.clientFeedback.result === 'suspended' && '專案暫緩'}
                              {q.clientFeedback.result === 'rejected' && '未成交'}
                            </span>
                          </p>
                          <p>備註說明：{q.clientFeedback.comment}</p>
                          {q.clientFeedback.offeredTargetPrice && (
                            <p className="text-amber-800 font-semibold">
                              客戶目標價：NT$ {q.clientFeedback.offeredTargetPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 mt-1">尚待客戶回覆</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Audit Logs (FR-17) */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  確認紀錄與歷史稽核歷程 (FR-17 Audit Trail)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  所有規格更動、留言、任務指派、報價與狀態轉變均由系統保留不可抹滅之操作者與時間戳記。
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {inquiry.auditLogs
                .filter((l) => !isClient || !l.isInternalOnly)
                .map((log) => (
                  <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.operator}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{log.summary}</span>
                        {log.isInternalOnly && !isClient && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[10px]">
                            內部專用
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                      )}
                    </div>

                    <span className="text-slate-400 font-mono text-[11px] tabular-nums shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Assign Task Modal */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">指派跨部門確認任務</h3>
            <div>
              <label className="block text-slate-700 font-medium mb-1">指派部門</label>
              <select className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs">
                <option value="rd">研發工程處 (評估油墨、膜紙、耐溫性)</option>
                <option value="production">製程技術處 (評估機台、套色、刀模)</option>
                <option value="procurement">資材採購課 (確認材料交期、MOQ)</option>
                <option value="qc">品質保證處 (制定檢驗標準與公差)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">任務標題</label>
              <input
                type="text"
                defaultValue="新材料低溫耐受性與開版評估"
                className="w-full border border-slate-300 rounded p-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">預計回覆期限 (Due Date)</label>
              <input
                type="date"
                defaultValue="2026-10-31"
                className="w-full border border-slate-300 rounded p-1.5 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignTaskModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const newTask: DepartmentTask = {
                    id: `task-${Date.now()}`,
                    dept: 'rd',
                    deptName: '研發工程處',
                    title: '新材料低溫耐受性與開版評估',
                    assignedTo: '張晉瑋 (資深研發)',
                    dueDate: '2026-10-31',
                    status: 'pending',
                    feasibility: 'pending',
                    materialSuggestions: '',
                    processSuggestions: '',
                    estimatedCostOrTime: '',
                    risks: '',
                    notes: '',
                  };
                  onUpdateInquiry({
                    ...inquiry,
                    deptTasks: [...inquiry.deptTasks, newTask],
                    status: 'tech_evaluating',
                    auditLogs: [
                      ...inquiry.auditLogs,
                      {
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        operator: '承辦業務',
                        operatorRole: currentRole,
                        actionType: 'task_assign',
                        summary: '指派新技術評估任務予研發工程處',
                        isInternalOnly: true,
                      },
                    ],
                  });
                  setShowAssignTaskModal(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
              >
                確認指派
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Supervisor Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">主管核價審核 (Approval / Rejection)</h3>
            <p className="text-slate-600">
              審核單號：{inquiry.quotes[0]?.quoteId}（毛利率：{inquiry.quotes[0]?.items[0]?.marginRate.toFixed(1)}%）
            </p>
            <div>
              <label className="block text-slate-700 font-medium mb-1">審核意見 / 備註</label>
              <textarea
                rows={3}
                defaultValue="毛利與交期評估符合經營方針，核准送交正式報價。"
                id="approvalNotes"
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const updatedQuotes = inquiry.quotes.map((q, idx) => {
                    if (idx === 0) {
                      return {
                        ...q,
                        status: 'approved' as const,
                        approvalRecord: {
                          approverName: '李振祥 (營運副總)',
                          status: 'approved' as const,
                          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                          reasons: '毛利結構合規，核准正式報價。',
                        },
                      };
                    }
                    return q;
                  });

                  onUpdateInquiry({
                    ...inquiry,
                    status: 'quoted',
                    quotes: updatedQuotes,
                    auditLogs: [
                      ...inquiry.auditLogs,
                      {
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        operator: '李振祥 (營運副總)',
                        operatorRole: 'approver',
                        actionType: 'quote_approve',
                        summary: '核准報價單草稿，狀態推進為「已正式報價」',
                        isInternalOnly: true,
                      },
                    ],
                  });
                  setShowApprovalModal(false);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
              >
                核准報價 (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Attachment */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">上傳附件與圖稿 (FR-04)</h3>
            <div>
              <label className="block text-slate-700 font-medium mb-1">檔案名稱</label>
              <input
                type="text"
                defaultValue="Engineering_Die_Line_Spec_v1.2.pdf"
                id="uploadFileName"
                className="w-full border border-slate-300 rounded p-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">附件類別</label>
              <select id="uploadFileType" className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs">
                <option value="artwork">工程向量圖稿 / 刀模線</option>
                <option value="spec_sheet">技術規格書 / 原料物性表</option>
                <option value="sample_photo">樣品照片 / 貼標測試照</option>
                <option value="test_report">檢驗檢測報告 (COA / RoHS)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">版本編號</label>
              <input
                type="text"
                defaultValue={inquiry.currentSpecVersionId}
                id="uploadVersion"
                className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="clientVisibleCheck" defaultChecked className="rounded text-blue-600" />
              <label htmlFor="clientVisibleCheck" className="text-slate-700 font-medium">客戶可見 (Client Visible)</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const inputName = (document.getElementById('uploadFileName') as HTMLInputElement)?.value || 'New_File.pdf';
                  const inputType = (document.getElementById('uploadFileType') as HTMLSelectElement)?.value as any || 'artwork';
                  const inputVer = (document.getElementById('uploadVersion') as HTMLInputElement)?.value || 'v1.0';
                  const isVisible = (document.getElementById('clientVisibleCheck') as HTMLInputElement)?.checked ?? true;

                  const newAtt: Attachment = {
                    id: `att-${Date.now()}`,
                    fileName: inputName,
                    fileType: inputType,
                    fileSize: '4.2 MB',
                    version: inputVer,
                    uploadedBy: isClient ? inquiry.client.contactPerson : '承辦業務',
                    uploadedRole: currentRole,
                    uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    notes: '工程師/業務新上傳之技術附件',
                    isClientVisible: isVisible,
                  };

                  onUpdateInquiry({
                    ...inquiry,
                    attachments: [...inquiry.attachments, newAtt],
                    auditLogs: [
                      ...inquiry.auditLogs,
                      {
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        operator: isClient ? inquiry.client.contactPerson : '承辦業務',
                        operatorRole: currentRole,
                        actionType: 'spec_update',
                        summary: `上傳新附件：${inputName} (版本 ${inputVer})`,
                        isInternalOnly: !isVisible,
                      },
                    ],
                  });
                  setShowUploadModal(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
              >
                儲存上傳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: New Spec Version Creation (FR-12) */}
      {showNewSpecModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">建立規格新版本 (Spec Versioning - FR-12)</h3>
            <p className="text-slate-500">
              系統將保留舊版本歷史記錄，並建立新版本 (例如 v1.2)。
            </p>
            <div>
              <label className="block text-slate-700 font-medium mb-1">版本異動說明 *</label>
              <textarea
                rows={2}
                id="newSpecSummary"
                defaultValue="依研發評估調整基材厚度，追加冷燙金與抗刮凡立水工藝。"
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">更新膜紙種類</label>
                <input
                  type="text"
                  id="newSubstrate"
                  defaultValue="BOPP消光白膜 (含超低溫抗凍壓敏膠)"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">更新油墨種類</label>
                <input
                  type="text"
                  id="newInk"
                  defaultValue="低氣味低遷移LED油墨"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewSpecModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const summary = (document.getElementById('newSpecSummary') as HTMLTextAreaElement)?.value || '更新規格';
                  const nextVersionNum = `v${(parseFloat(currentSpec.versionId.replace('v', '')) + 0.1).toFixed(1)}`;

                  const newVersion: SpecVersion = {
                    ...currentSpec,
                    versionId: nextVersionNum,
                    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    createdByName: '張晉瑋 (研發工程)',
                    changeSummary: summary,
                    substrateType: (document.getElementById('newSubstrate') as HTMLInputElement)?.value || currentSpec.substrateType,
                    inkType: (document.getElementById('newInk') as HTMLInputElement)?.value || currentSpec.inkType,
                  };

                  onUpdateInquiry({
                    ...inquiry,
                    currentSpecVersionId: nextVersionNum,
                    specVersions: [...inquiry.specVersions, newVersion],
                    auditLogs: [
                      ...inquiry.auditLogs,
                      {
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        operator: '研發工程師',
                        operatorRole: currentRole,
                        actionType: 'spec_update',
                        summary: `建立規格新版本 ${nextVersionNum}：${summary}`,
                        isInternalOnly: false,
                      },
                    ],
                  });
                  setSelectedSpecVersionId(nextVersionNum);
                  setShowNewSpecModal(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
              >
                產生並切換新版本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
