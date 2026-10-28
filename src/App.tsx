import React, { useState, useEffect } from 'react';
import { InquiryCase, NotificationItem, UserRole, QuoteVersion } from './types/inquiry';
import { INITIAL_INQUIRIES, INITIAL_NOTIFICATIONS } from './data/mockInquiries';
import { Navbar } from './components/Navbar';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { CaseList } from './components/CaseList';
import { CaseDetail } from './components/CaseDetail';
import { DepartmentWorkbenchView } from './components/DepartmentWorkbenchView';
import { QuotationsView } from './components/QuotationsView';
import { MissingItemsTrackerView } from './components/MissingItemsTrackerView';
import { WorkflowGuideView } from './components/WorkflowGuideView';
import { NewCaseModal } from './components/NewCaseModal';
import { SpecDiffModal } from './components/SpecDiffModal';
import { FormalQuotationModal } from './components/FormalQuotationModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

export default function App() {
  const [inquiries, setInquiries] = useState<InquiryCase[]>(() => {
    try {
      const saved = localStorage.getItem('apex_inquiry_cases');
      return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_inquiry_notifs');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('sales');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<'cases' | 'departments' | 'quotations' | 'missing_items' | 'workflow_guide'>('cases');

  // Modals state
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [diffModalConfig, setDiffModalConfig] = useState<{
    isOpen: boolean;
    inquiry?: InquiryCase;
    baseId?: string;
    targetId?: string;
  }>({ isOpen: false });

  const [formalQuoteConfig, setFormalQuoteConfig] = useState<{
    isOpen: boolean;
    inquiry?: InquiryCase;
    quote?: QuoteVersion;
  }>({ isOpen: false });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('apex_inquiry_cases', JSON.stringify(inquiries));
    } catch (e) {
      console.error(e);
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_inquiry_notifs', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Handle case update
  const handleUpdateInquiry = (updatedCase: InquiryCase) => {
    setInquiries((prev) => prev.map((item) => (item.id === updatedCase.id ? updatedCase : item)));
  };

  // Handle creating a new case
  const handleCreateNewCase = (newCase: InquiryCase) => {
    setInquiries((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setActiveNavTab('cases');

    // Create a notification for sales
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      caseId: newCase.id,
      caseTitle: newCase.productName,
      title: `【新詢價案件】${newCase.client.company}`,
      content: `已成功建立案件 ${newCase.id}，共 ${newCase.missingItems.length} 項缺漏待盤點。`,
      recipientRole: 'sales',
      recipientName: '陳建宏',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      type: newCase.missingItems.length > 0 ? 'data_missing' : 'task_assigned',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handle resolving a missing item from central tracker
  const handleResolveMissingItem = (caseId: string, itemId: string) => {
    setInquiries((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedMissing = c.missingItems.map((m) =>
            m.id === itemId
              ? {
                  ...m,
                  status: 'resolved' as const,
                  resolvedAt: new Date().toISOString().split('T')[0],
                  resolvedBy: currentRole === 'client' ? c.client.contactPerson : '承辦業務',
                }
              : m
          );

          return {
            ...c,
            missingItems: updatedMissing,
            status:
              c.status === 'pending_info' && updatedMissing.every((m) => m.status === 'resolved')
                ? 'tech_evaluating'
                : c.status,
            updatedAt: new Date().toISOString().split('T')[0],
            auditLogs: [
              ...c.auditLogs,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                operator: '管理人員',
                operatorRole: currentRole,
                actionType: 'spec_update',
                summary: '於待補中心標記資料已補齊',
                isInternalOnly: false,
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Handle updating feedback on quotation
  const handleUpdateQuoteFeedback = (
    result: 'accepted' | 'negotiating' | 'revision_requested' | 'suspended' | 'rejected',
    comment: string,
    offeredTargetPrice?: number
  ) => {
    if (!formalQuoteConfig.inquiry || !formalQuoteConfig.quote) return;

    const caseId = formalQuoteConfig.inquiry.id;
    const quoteId = formalQuoteConfig.quote.quoteId;

    const updatedCase = {
      ...formalQuoteConfig.inquiry,
      status: result === 'accepted' ? ('closed_won' as const) : result === 'rejected' ? ('closed_lost' as const) : ('client_reviewing' as const),
      quotes: formalQuoteConfig.inquiry.quotes.map((q) =>
        q.quoteId === quoteId
          ? {
              ...q,
              clientFeedback: {
                result,
                comment,
                updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                offeredTargetPrice,
              },
            }
          : q
      ),
      auditLogs: [
        ...formalQuoteConfig.inquiry.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          operator: currentRole === 'client' ? formalQuoteConfig.inquiry.client.contactPerson : '業務陳建宏',
          operatorRole: currentRole,
          actionType: 'client_reply' as const,
          summary: `記錄報價反饋：${result === 'accepted' ? '客戶確認接受報價 (成交)' : result === 'negotiating' ? '提出目標價議價' : '提出修改需求'}`,
          details: comment,
          isInternalOnly: false,
        },
      ],
    };

    handleUpdateInquiry(updatedCase);
    setFormalQuoteConfig((prev) => ({
      ...prev,
      inquiry: updatedCase,
      quote: updatedCase.quotes.find((q) => q.quoteId === quoteId),
    }));

    // Trigger notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      caseId,
      caseTitle: formalQuoteConfig.inquiry.productName,
      title: `【報價反饋】客戶回覆：${result === 'accepted' ? '接受報價' : '提出議價/修改'}`,
      content: comment || '客戶已於正式報價單檢視視窗回簽反饋。',
      recipientRole: 'sales',
      recipientName: '陳建宏',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      type: 'client_reply',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Open diff modal for a case
  const handleOpenDiff = (inquiry: InquiryCase, baseId?: string, targetId?: string) => {
    setDiffModalConfig({
      isOpen: true,
      inquiry,
      baseId,
      targetId,
    });
  };

  // Open formal quote modal
  const handleOpenFormalQuote = (inquiry: InquiryCase, quote: QuoteVersion) => {
    setFormalQuoteConfig({
      isOpen: true,
      inquiry,
      quote,
    });
  };

  const selectedCase = inquiries.find((c) => c.id === selectedCaseId);
  const unreadCount = notifications.filter(
    (n) => !n.read && (n.recipientRole === currentRole || currentRole === 'sales' || currentRole === 'admin')
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Top Role Simulator Switcher Bar */}
      <RoleSwitcherBar currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* 2. Primary Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenNewCase={() => setShowNewCaseModal(true)}
        activeNavTab={activeNavTab}
        onNavTabChange={(tab) => {
          setActiveNavTab(tab);
          setSelectedCaseId(null);
        }}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedCase ? (
          <CaseDetail
            inquiry={selectedCase}
            currentRole={currentRole}
            onBack={() => setSelectedCaseId(null)}
            onUpdateInquiry={handleUpdateInquiry}
            onOpenDiff={(baseId, targetId) => handleOpenDiff(selectedCase, baseId, targetId)}
            onOpenFormalQuote={(quote) => handleOpenFormalQuote(selectedCase, quote)}
          />
        ) : (
          <>
            {activeNavTab === 'cases' && (
              <CaseList
                inquiries={inquiries}
                currentRole={currentRole}
                onSelectCase={(id) => setSelectedCaseId(id)}
                onOpenNewCase={() => setShowNewCaseModal(true)}
              />
            )}

            {activeNavTab === 'departments' && (
              <DepartmentWorkbenchView
                inquiries={inquiries}
                currentRole={currentRole}
                onSelectCase={(id) => setSelectedCaseId(id)}
              />
            )}

            {activeNavTab === 'quotations' && (
              <QuotationsView
                inquiries={inquiries}
                currentRole={currentRole}
                onSelectCase={(id) => setSelectedCaseId(id)}
                onOpenFormalQuote={(inq, q) => handleOpenFormalQuote(inq, q)}
              />
            )}

            {activeNavTab === 'missing_items' && (
              <MissingItemsTrackerView
                inquiries={inquiries}
                currentRole={currentRole}
                onSelectCase={(id) => setSelectedCaseId(id)}
                onResolveMissingItem={handleResolveMissingItem}
              />
            )}

            {activeNavTab === 'workflow_guide' && <WorkflowGuideView />}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">APEX 詢價與技術確認協同平台</span>
            <span>·</span>
            <span>符合 ISO 9001 跨部門品質規格管理與精準核價規範</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>案件管理</span>
            <span>·</span>
            <span>規格版本控制</span>
            <span>·</span>
            <span>缺漏防錯引擎</span>
            <span>·</span>
            <span>主管核價簽核</span>
          </div>
        </div>
      </footer>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <NewCaseModal
          currentRole={currentRole}
          onClose={() => setShowNewCaseModal(false)}
          onSubmit={handleCreateNewCase}
        />
      )}

      {/* Spec Diff Modal */}
      {diffModalConfig.isOpen && diffModalConfig.inquiry && (
        <SpecDiffModal
          specVersions={diffModalConfig.inquiry.specVersions}
          initialBaseId={diffModalConfig.baseId}
          initialTargetId={diffModalConfig.targetId}
          onClose={() => setDiffModalConfig({ isOpen: false })}
        />
      )}

      {/* Formal Quotation Modal */}
      {formalQuoteConfig.isOpen && formalQuoteConfig.inquiry && formalQuoteConfig.quote && (
        <FormalQuotationModal
          inquiry={formalQuoteConfig.inquiry}
          quote={formalQuoteConfig.quote}
          currentRole={currentRole}
          onClose={() => setFormalQuoteConfig({ isOpen: false })}
          onUpdateFeedback={handleUpdateQuoteFeedback}
        />
      )}

      {/* Notification Center Modal */}
      {showNotificationModal && (
        <NotificationCenterModal
          notifications={notifications}
          currentRole={currentRole}
          onClose={() => setShowNotificationModal(false)}
          onSelectCase={(caseId) => {
            setSelectedCaseId(caseId);
            setActiveNavTab('cases');
          }}
          onMarkAsRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
          onMarkAllAsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
        />
      )}
    </div>
  );
}
