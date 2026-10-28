export type UserRole = 
  | 'client'        // 客戶／提出詢價者
  | 'sales'         // 業務
  | 'rd'            // 研發／工程
  | 'production'    // 生產／製程
  | 'procurement'   // 採購
  | 'qc'            // 品管
  | 'approver'      // 主管／核價人員
  | 'admin';        // 系統管理者

export interface RoleInfo {
  id: UserRole;
  name: string;
  department: string;
  userName: string;
  description: string;
  canViewCost: boolean;
  canViewInternalDiscussion: boolean;
  canApproveQuote: boolean;
  canEditQuote: boolean;
  canEditTechSpec: boolean;
}

export type CaseStatus = 
  | 'new'               // 新建
  | 'pending_info'      // 待補資料
  | 'tech_evaluating'   // 技術評估中
  | 'pending_costing'   // 待核價
  | 'pending_approval'  // 待核准
  | 'quoted'            // 已報價
  | 'client_reviewing'  // 客戶確認中
  | 'closed_won'        // 已結案 - 成交
  | 'closed_lost'       // 已結案 - 未成交
  | 'closed_suspended'; // 已結案 - 暫緩

export type DepartmentType = 'rd' | 'production' | 'procurement' | 'qc';

export type FeasibilityStatus = 'feasible' | 'conditionally_feasible' | 'infeasible' | 'pending';

export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'artwork' | 'spec_sheet' | 'sample_photo' | 'test_report' | 'other';
  fileSize: string;
  version: string;
  uploadedBy: string;
  uploadedRole: UserRole;
  uploadedAt: string;
  notes?: string;
  fileUrl?: string;
  previewUrl?: string;
  isClientVisible: boolean;
}

export interface SpecVersion {
  versionId: string;       // e.g. "v1.0", "v1.1"
  createdAt: string;
  createdByName: string;
  changeSummary: string;   // 版本差異說明
  dimensions: {
    widthMm: number;
    heightMm: number;
    shape: '常規矩形' | '圓形/橢圓' | '異形軋型' | '連續帶狀' | '立體袋型';
    radiusMm?: number;
    repeatMm?: number;
  };
  inkType: string;         // 油墨種類 (e.g. UV柔印油墨、大豆無毒油墨、電子油墨、待確認)
  substrateType: string;   // 膜／紙種類 (e.g. BOPP消光白膜、PET透明抗靜電、銅版紙、待確認)
  thicknessWeight: string; // 厚度或克重 (e.g. 50um, 80gsm, 120um)
  inkCoverage: string;     // 油墨覆蓋率 (e.g. 滿版特黑+四色 180%、四色套印約 65%、待確認)
  surfaceFinishing: string[]; // 表面處理 (e.g. 光膜、消光膜、抗刮膜、防偽雷射)
  specialProcesses: string[]; // 特殊製程 (e.g. 冷燙金、局部光油、背膠印刷、壓紋、刀模軋型)
  packagingRequirement: string; // 出貨包裝 (e.g. 捲裝-外出頭、每捲1,000張、紙箱防塵)
  environmentRequirement?: string; // 使用環境 (e.g. -20度C冷凍、耐水防油、常溫乾操)
  technicalHelpNotes?: {
    [field: string]: string;
  };
}

export interface MissingItem {
  id: string;
  fieldKey: string;
  label: string;
  category: 'essential_spec' | 'attachment' | 'process_detail' | 'commercial';
  assignedToRole: 'client' | 'sales' | 'rd';
  status: 'pending' | 'resolved';
  requestedAt: string;
  requestedBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface DepartmentTask {
  id: string;
  dept: DepartmentType;
  deptName: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  feasibility: FeasibilityStatus;
  materialSuggestions: string;
  processSuggestions: string;
  estimatedCostOrTime: string;
  risks: string;
  notes: string;
  updatedBy?: string;
}

export interface InquiryQuestion {
  id: string;
  question: string;
  askedBy: string;
  askedRole: UserRole;
  askedAt: string;
  target: 'internal' | 'client'; // 內部討論 vs 需客戶確認
  assignedTo: string;
  status: 'open' | 'answered';
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
}

export interface QuoteTierItem {
  tierQuantity: number;
  materialCost: number;       // 材料成本 (內部)
  processCost: number;        // 製程/工費 (內部)
  overheadCost: number;       // 管銷攤提 (內部)
  totalCost: number;          // 總單位成本 (內部)
  marginRate: number;         // 毛利率 % (內部)
  unitPrice: number;          // 報價單價 (對外)
  totalAmount: number;        // 報價總額 (對外)
  leadTimeDays: number;       // 生產交期 (天)
}

export interface QuoteVersion {
  quoteId: string;            // e.g. "Q-2026-0812-v1"
  version: string;            // e.g. "v1.0"
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  createdByName: string;
  specVersionRef: string;     // 綁定規格版本，如 "v1.1"
  approvalRecord?: {
    approverName: string;
    status: 'approved' | 'rejected';
    timestamp: string;
    reasons: string;
  };
  items: QuoteTierItem[];
  conditions: {
    validUntil: string;        // 報價有效期限
    deliveryAssumptions: string; // 交期假設
    unconfirmedNotes: string;  // 未確認事項附註
    paymentTerms: string;      // 付款條件
    toolingFee: number;        // 開版/刀模費 (一次性)
  };
  clientFeedback?: {
    result: 'accepted' | 'negotiating' | 'revision_requested' | 'suspended' | 'rejected';
    comment: string;
    updatedAt: string;
    offeredTargetPrice?: number;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  operatorRole: UserRole;
  actionType: 'create' | 'spec_update' | 'task_assign' | 'eval_submit' | 'quote_draft' | 'quote_approve' | 'quote_reject' | 'client_reply' | 'status_change';
  summary: string;
  details?: string;
  isInternalOnly: boolean;
}

export interface NotificationItem {
  id: string;
  caseId: string;
  caseTitle: string;
  title: string;
  content: string;
  recipientRole: UserRole;
  recipientName: string;
  createdAt: string;
  read: boolean;
  type: 'task_assigned' | 'data_missing' | 'eval_done' | 'quote_pending' | 'quote_approved' | 'quote_rejected' | 'client_reply' | 'overdue';
}

export interface InquiryCase {
  id: string;                  // e.g. "INQ-2026-0812"
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  client: {
    company: string;
    contactPerson: string;
    phone: string;
    email: string;
    industry: string;
  };
  salesRep: string;            // 承辦業務
  salesRepEmail: string;
  productCategory: string;     // 產品類別
  productName: string;         // 產品名稱
  purpose: string;             // 產品用途
  quantities: number[];        // 詢價數量級距
  targetDate: string;          // 客戶期望交期
  clientNotes: string;         // 客戶補充需求
  currentSpecVersionId: string;
  specVersions: SpecVersion[];
  attachments: Attachment[];
  missingItems: MissingItem[];
  deptTasks: DepartmentTask[];
  questions: InquiryQuestion[];
  quotes: QuoteVersion[];
  auditLogs: AuditLogEntry[];
}
