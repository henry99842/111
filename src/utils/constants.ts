import { CaseStatus, UserRole, RoleInfo, FeasibilityStatus, SpecVersion, Attachment, MissingItem } from '../types/inquiry';

export const USER_ROLES: RoleInfo[] = [
  {
    id: 'sales',
    name: '承辦業務',
    department: '業務部',
    userName: '陳建宏 (業務副理)',
    description: '負責案件接單、缺漏盤點、協調跨部門評估、報價送核及回覆客戶',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: false,
    canEditQuote: true,
    canEditTechSpec: true,
  },
  {
    id: 'client',
    name: '客戶 / 詢價者',
    department: '外部客戶',
    userName: '林佳樺 (誠光生醫 採購經理)',
    description: '提報詢價需求、補齊圖稿規格、檢視公開進度、查看已核准報價單與確認成交',
    canViewCost: false, // CRITICAL: 嚴格遮蔽內部成本與利潤
    canViewInternalDiscussion: false, // 遮蔽內部研發對話
    canApproveQuote: false,
    canEditQuote: false,
    canEditTechSpec: false,
  },
  {
    id: 'rd',
    name: '研發／工程部',
    department: '研發工程處',
    userName: '張晉瑋 (資深研發工程師)',
    description: '確認油墨種類、膜紙材質可行性、評估特殊製程與技術風險、提出材料建議',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: false,
    canEditQuote: false,
    canEditTechSpec: true,
  },
  {
    id: 'production',
    name: '生產／製程部',
    department: '製程技術處',
    userName: '黃俊傑 (廠長)',
    description: '確認生產設備、機台產能、最少開機米數與製程條件設定',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: false,
    canEditQuote: false,
    canEditTechSpec: false,
  },
  {
    id: 'procurement',
    name: '採購部',
    department: '資材處採購課',
    userName: '周佩萱 (資深採購)',
    description: '確認特殊基材與油墨市價、供應商供貨現況、MOQ與原料備料交期',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: false,
    canEditQuote: false,
    canEditTechSpec: false,
  },
  {
    id: 'qc',
    name: '品管部',
    department: '品質保證處',
    userName: '蔡明輝 (品管組長)',
    description: '確認外觀允收標準、附著力/耐磨測試規範與出貨檢驗報告需求',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: false,
    canEditQuote: false,
    canEditTechSpec: false,
  },
  {
    id: 'approver',
    name: '主管／核價人',
    department: '營運管理處',
    userName: '李振祥 (營運副總 / 核價主管)',
    description: '審核報價成本、毛利率、交期風險與特別合約條款，執行核准或退回',
    canViewCost: true,
    canViewInternalDiscussion: true,
    canApproveQuote: true,
    canEditQuote: true,
    canEditTechSpec: true,
  },
];

export const STATUS_CONFIG: Record<CaseStatus, { label: string; textClass: string; bgClass: string; borderClass: string; step: number }> = {
  new: {
    label: '新建',
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-200',
    step: 1,
  },
  pending_info: {
    label: '待補資料',
    textClass: 'text-amber-800',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    step: 2,
  },
  tech_evaluating: {
    label: '技術評估中',
    textClass: 'text-blue-800',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    step: 3,
  },
  pending_costing: {
    label: '待核價',
    textClass: 'text-indigo-800',
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    step: 4,
  },
  pending_approval: {
    label: '待主管核准',
    textClass: 'text-purple-800',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    step: 5,
  },
  quoted: {
    label: '已正式報價',
    textClass: 'text-teal-800',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
    step: 6,
  },
  client_reviewing: {
    label: '客戶確認中',
    textClass: 'text-sky-800',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    step: 7,
  },
  closed_won: {
    label: '已結案 (成交)',
    textClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    step: 8,
  },
  closed_lost: {
    label: '已結案 (未成交)',
    textClass: 'text-rose-800',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    step: 8,
  },
  closed_suspended: {
    label: '已結案 (暫緩)',
    textClass: 'text-stone-700',
    bgClass: 'bg-stone-100',
    borderClass: 'border-stone-200',
    step: 8,
  },
};

export const FEASIBILITY_CONFIG: Record<FeasibilityStatus, { label: string; textClass: string; bgClass: string }> = {
  pending: {
    label: '待評估',
    textClass: 'text-slate-600',
    bgClass: 'bg-slate-100',
  },
  feasible: {
    label: '技術可行',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
  },
  conditionally_feasible: {
    label: '條件可行 (需調整)',
    textClass: 'text-amber-800',
    bgClass: 'bg-amber-50',
  },
  infeasible: {
    label: '技術不可行 / 需開新模',
    textClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
  },
};

export const WORKFLOW_STEPS = [
  { id: 'step-1', name: '1. 建立詢價', desc: '客戶需求與初審' },
  { id: 'step-2', name: '2. 缺漏防錯', desc: '規格與圖稿齊備' },
  { id: 'step-3', name: '3. 跨部門確認', desc: '研發/生產/採購/品管' },
  { id: 'step-4', name: '4. 成本與核價', desc: '報價草稿與主管審核' },
  { id: 'step-5', name: '5. 正式報價', desc: '規格綁定與客戶反饋' },
];

// Technical specifications dictionary & tooltips (FR-09)
export const TECH_FIELD_HELP: Record<string, { title: string; desc: string; options: string[]; example: string }> = {
  inkType: {
    title: '油墨種類',
    desc: '依耐光性、低遷移性、食品接觸及印刷機台選擇對應油墨配方。',
    options: ['UV柔印油墨', '低氣味低遷移LED油墨', '水性無毒油墨', '電子油墨 (數位印刷)', '抗化學溶劑油墨', '待確認'],
    example: '如醫藥或食品包裝需註明「低氣味無遷移油墨」',
  },
  substrateType: {
    title: '膜／紙種類 (基材)',
    desc: '直接影響產品抗撕裂性、透明度、耐溫防潮及表面印刷附著性。',
    options: ['BOPP消光白膜', 'PET透明防靜電薄膜', '80g高階銅版紙', '鋁箔複合防潮層 (PET/AL/PE)', '合成珠光紙', '牛皮紙複合', '待確認'],
    example: '如冷凍冷藏標籤推薦「BOPP合成白膜」配耐低溫膠水',
  },
  thicknessWeight: {
    title: '厚度或克重',
    desc: '薄膜以微米(um/μm)標示，紙張以每平方米克重(gsm)標示。',
    options: ['50 um', '75 um', '100 um', '120 um', '80 gsm', '105 gsm', '150 gsm', '待確認'],
    example: '常規自黏標籤面紙多為 50~80um，複合袋總厚度多在 80~120um',
  },
  inkCoverage: {
    title: '油墨覆蓋率',
    desc: '總墨量覆蓋率影響油墨耗用量、乾燥速度及印刷成本計算。',
    options: ['滿版雙面 (>180%)', '滿版單面 (100%~140%)', '常規四色套印 (50%~80%)', '簡易文字商標 (15%~30%)', '待確認'],
    example: '若有大面積深色底色，覆蓋率通常在 120%~160% 之間',
  },
  surfaceFinishing: {
    title: '表面處理',
    desc: '提升視覺質感、抗刮耐磨或防水保護。',
    options: ['上亮光保護膜 (Gloss)', '上消光霧膜 (Matte)', '抗刮耐磨專用紙膜', '防偽全像雷射膜', '局部水性凡立水光油', '無表面覆膜'],
    example: '化妝品與酒標多採用消光霧膜呈現典雅質感',
  },
  specialProcesses: {
    title: '特殊製程',
    desc: '增值特殊加工工序，需評估機台刀模、套準精度與開版費用。',
    options: ['冷燙金 (箔膜冷貼)', '熱燙霧金/銀', '局部立體厚光 (Screen UV)', '背面印刷 (背膠顯字)', '圓刀連續軋型', '齒刀易撕虛線', '數位防偽可變QR碼'],
    example: '高級禮盒標籤常見「冷燙消光金 + 局部立體網印」',
  },
};

/**
 * FR-10: 缺漏檢查防錯引擎
 * 依案件資料檢查必要欄位及附件，自動列出缺漏項目
 */
export function inspectMissingItems(spec: SpecVersion, attachments: Attachment[]): MissingItem[] {
  const missing: MissingItem[] = [];

  // 1. 檢查圖稿/刀模圖附件
  const hasArtwork = attachments.some(a => a.fileType === 'artwork');
  if (!hasArtwork) {
    missing.push({
      id: 'missing-artwork',
      fieldKey: 'attachment_artwork',
      label: '工程向量圖稿 / 刀模標註線 (AI / PDF 格式)',
      category: 'attachment',
      assignedToRole: 'client',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '缺少完稿或刀模線，無法精確計算拼版模數、出墨量與開模尺寸。',
    });
  }

  // 2. 檢查尺寸
  if (!spec.dimensions.widthMm || !spec.dimensions.heightMm) {
    missing.push({
      id: 'missing-dimensions',
      fieldKey: 'dimensions',
      label: '產品精確尺寸 (寬 x 高 mm)',
      category: 'essential_spec',
      assignedToRole: 'client',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '需提供長寬數據以利刀模選配與排版試算。',
    });
  }

  // 3. 檢查油墨種類
  if (!spec.inkType || spec.inkType === '待確認') {
    missing.push({
      id: 'missing-inkType',
      fieldKey: 'inkType',
      label: '油墨種類與安全規範 (例如：食品級低遷移/UV/水性)',
      category: 'essential_spec',
      assignedToRole: 'rd',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '油墨種類尚未敲定，研發需與客戶確認使用環境與接觸規範。',
    });
  }

  // 4. 檢查膜/紙基材種類
  if (!spec.substrateType || spec.substrateType === '待確認') {
    missing.push({
      id: 'missing-substrateType',
      fieldKey: 'substrateType',
      label: '膜／紙材質種類與特定基材品牌',
      category: 'essential_spec',
      assignedToRole: 'sales',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '基材為成本最大宗項目，需業務向客戶索取樣品或鎖定型號。',
    });
  }

  // 5. 檢查厚度或克重
  if (!spec.thicknessWeight || spec.thicknessWeight === '待確認') {
    missing.push({
      id: 'missing-thickness',
      fieldKey: 'thicknessWeight',
      label: '基材厚度 (um) 或紙張克重 (gsm)',
      category: 'essential_spec',
      assignedToRole: 'sales',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '厚度影響自動貼標機相容性與材料成本。',
    });
  }

  // 6. 檢查出貨形式 (若有特殊製程如冷燙金或背印，需確認覆蓋率)
  if (!spec.inkCoverage || spec.inkCoverage === '待確認') {
    missing.push({
      id: 'missing-coverage',
      fieldKey: 'inkCoverage',
      label: '預估油墨覆蓋率與印刷色數',
      category: 'process_detail',
      assignedToRole: 'rd',
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
      requestedBy: '系統自動檢查 (FR-10)',
      notes: '研發須檢視圖稿計算四色與專色總墨量百分比。',
    });
  }

  return missing;
}
