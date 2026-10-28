import React, { useState } from 'react';
import { InquiryCase, UserRole, SpecVersion, Attachment } from '../types/inquiry';
import { TECH_FIELD_HELP, inspectMissingItems } from '../utils/constants';
import { X, Plus, Upload, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface NewCaseModalProps {
  currentRole: UserRole;
  onClose: () => void;
  onSubmit: (newCase: InquiryCase) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ currentRole, onClose, onSubmit }) => {
  const isClient = currentRole === 'client';

  // Client info
  const [company, setCompany] = useState(isClient ? '誠光生醫科技股份有限公司' : '');
  const [contactPerson, setContactPerson] = useState(isClient ? '林佳樺 (採購經理)' : '');
  const [phone, setPhone] = useState(isClient ? '02-2788-3401 #218' : '');
  const [email, setEmail] = useState(isClient ? 'lin.ch@chengguang-bio.com' : '');
  const [industry, setIndustry] = useState('生技醫療 / 醫藥包裝');

  // Product info
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('醫藥冷鏈高阻隔自黏標籤');
  const [purpose, setPurpose] = useState('');
  const [quantitiesStr, setQuantitiesStr] = useState('10000, 30000, 50000');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [clientNotes, setClientNotes] = useState('');

  // Spec basics
  const [widthMm, setWidthMm] = useState<number>(80);
  const [heightMm, setHeightMm] = useState<number>(50);
  const [shape, setShape] = useState<'常規矩形' | '圓形/橢圓' | '異形軋型' | '連續帶狀' | '立體袋型'>('常規矩形');
  const [inkType, setInkType] = useState('待確認');
  const [substrateType, setSubstrateType] = useState('待確認');
  const [thicknessWeight, setThicknessWeight] = useState('待確認');
  const [inkCoverage, setInkCoverage] = useState('待確認');
  const [surfaceFinishing, setSurfaceFinishing] = useState<string[]>(['上消光霧膜 (Matte)']);
  const [specialProcesses, setSpecialProcesses] = useState<string[]>(['刀模軋型']);

  // Artwork file simulation
  const [hasArtworkUpload, setHasArtworkUpload] = useState(false);
  const [artworkFileName, setArtworkFileName] = useState('');

  const handleToggleFinishing = (item: string) => {
    if (surfaceFinishing.includes(item)) {
      setSurfaceFinishing(surfaceFinishing.filter((f) => f !== item));
    } else {
      setSurfaceFinishing([...surfaceFinishing, item]);
    }
  };

  const handleToggleProcess = (item: string) => {
    if (specialProcesses.includes(item)) {
      setSpecialProcesses(specialProcesses.filter((p) => p !== item));
    } else {
      setSpecialProcesses([...specialProcesses, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !company.trim()) return;

    const parsedQuantities = quantitiesStr
      .split(',')
      .map((q) => parseInt(q.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const generatedId = `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialSpec: SpecVersion = {
      versionId: 'v1.0',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdByName: isClient ? `${contactPerson} (客戶提報)` : '陳建宏 (業務初建)',
      changeSummary: '初次建立詢價規格需求',
      dimensions: {
        widthMm: Number(widthMm) || 0,
        heightMm: Number(heightMm) || 0,
        shape,
      },
      inkType,
      substrateType,
      thicknessWeight,
      inkCoverage,
      surfaceFinishing,
      specialProcesses,
      packagingRequirement: '標準平箱裝箱或捲裝出貨',
    };

    const initialAttachments: Attachment[] = [];
    if (hasArtworkUpload && artworkFileName) {
      initialAttachments.push({
        id: `att-${Date.now()}`,
        fileName: artworkFileName,
        fileType: 'artwork',
        fileSize: '5.6 MB',
        version: 'v1.0',
        uploadedBy: contactPerson || '客戶/業務',
        uploadedRole: currentRole,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        notes: '初版刀模完稿線檔案',
        isClientVisible: true,
      });
    }

    // Inspect for missing items
    const missing = inspectMissingItems(initialSpec, initialAttachments);
    const initialStatus = missing.length > 0 ? 'pending_info' : 'tech_evaluating';

    const newCase: InquiryCase = {
      id: generatedId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: initialStatus,
      client: {
        company,
        contactPerson,
        phone,
        email,
        industry,
      },
      salesRep: '陳建宏 (業務副理)',
      salesRepEmail: 'ken.chen@apex-pack.com',
      productCategory,
      productName,
      purpose: purpose || '尚未填寫詳細用途',
      quantities: parsedQuantities.length > 0 ? parsedQuantities : [10000],
      targetDate,
      clientNotes,
      currentSpecVersionId: 'v1.0',
      specVersions: [initialSpec],
      attachments: initialAttachments,
      missingItems: missing,
      deptTasks: [],
      questions: [],
      quotes: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          operator: contactPerson || '承辦業務',
          operatorRole: currentRole,
          actionType: 'create',
          summary: `建立新詢價案件 ${generatedId}，規格版本 v1.0`,
          details: missing.length > 0 ? `防錯系統標記 ${missing.length} 項待補項目` : '必要規格齊全',
          isInternalOnly: false,
        },
      ],
    };

    onSubmit(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isClient ? '提交新產品詢價需求 (Request for Quotation)' : '建立詢價案件 (FR-01 ~ FR-04)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              系統將自動啟動必要欄位防錯檢查，建立唯一案件編號並指派規格版本 v1.0
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Customer Profile */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              一、客戶與基本聯絡資料
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">客戶公司全稱 *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="例如: 誠光生醫科技股份有限公司"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">聯絡窗口姓名 / 職稱 *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="例如: 林佳樺 (採購經理)"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">電話 / 分機</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="02-2788-3401 #218"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">電子信箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Commercial Requirements */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              二、產品名稱與需求參數
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">產品名稱 *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="例如: BioFreeze 疫苗專用低溫防撕耐刮自黏標籤"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">產品品類</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 bg-white"
                >
                  <option value="醫藥冷鏈高阻隔自黏標籤">醫藥冷鏈高阻隔自黏標籤</option>
                  <option value="儀表消光抗刮PC面版銘板">儀表消光抗刮PC面版銘板</option>
                  <option value="食品級立體自立夾鏈鋁箔複合袋">食品級立體自立夾鏈鋁箔複合袋</option>
                  <option value="高級紋理特種酒標">高級紋理特種酒標</option>
                  <option value="電子高耐熱絕緣膜片">電子高耐熱絕緣膜片</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">期望到貨日期 (Target Date)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  詢價採購數量級距 (以逗號隔開) *
                </label>
                <input
                  type="text"
                  value={quantitiesStr}
                  onChange={(e) => setQuantitiesStr(e.target.value)}
                  placeholder="例如: 10000, 30000, 50000"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  系統將針對各數量級距試算開機損耗與單價階梯
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">產品用途與作業環境說明</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="例如: 需耐 -80°C 急凍、防酒精擦拭、在淨室常溫貼標後進超低溫冷凍庫。"
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specifications & Field Assistance (FR-07, FR-08, FR-09) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                三、初期技術與材料規格 (可選擇「待確認」由工程評估)
              </h3>
              <span className="text-[11px] text-blue-600 font-medium">支援技術欄位防錯與輔助說明</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">外觀寬度 (mm) *</label>
                <input
                  type="number"
                  value={widthMm}
                  onChange={(e) => setWidthMm(parseFloat(e.target.value))}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">外觀長度/高度 (mm) *</label>
                <input
                  type="number"
                  value={heightMm}
                  onChange={(e) => setHeightMm(parseFloat(e.target.value))}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">幾何形狀</label>
                <select
                  value={shape}
                  onChange={(e: any) => setShape(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 bg-white"
                >
                  <option value="常規矩形">常規矩形</option>
                  <option value="圓形/橢圓">圓形/橢圓</option>
                  <option value="異形軋型">異形軋型</option>
                  <option value="立體袋型">立體袋型</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  膜／紙基材種類
                  <span className="text-slate-400 font-normal ml-1">(FR-07)</span>
                </label>
                <select
                  value={substrateType}
                  onChange={(e) => setSubstrateType(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 bg-white"
                >
                  {TECH_FIELD_HELP.substrateType.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  油墨種類配方
                  <span className="text-slate-400 font-normal ml-1">(FR-07)</span>
                </label>
                <select
                  value={inkType}
                  onChange={(e) => setInkType(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 bg-white"
                >
                  {TECH_FIELD_HELP.inkType.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">基材厚度或克重</label>
                <select
                  value={thicknessWeight}
                  onChange={(e) => setThicknessWeight(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 bg-white"
                >
                  {TECH_FIELD_HELP.thicknessWeight.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special finishes & processes multi-select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">表面處理選項 (可多選)</label>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_FIELD_HELP.surfaceFinishing.options.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleToggleFinishing(item)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        surfaceFinishing.includes(item)
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">特殊製程要求 (可多選)</label>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_FIELD_HELP.specialProcesses.options.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleToggleProcess(item)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        specialProcesses.includes(item)
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Initial Attachment / Artwork Upload (FR-04) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              四、附件與工程圖稿 (FR-04)
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50/50 text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="hasArtwork"
                  checked={hasArtworkUpload}
                  onChange={(e) => {
                    setHasArtworkUpload(e.target.checked);
                    if (e.target.checked && !artworkFileName) {
                      setArtworkFileName('Product_Artwork_Engineering_v1.0.ai');
                    }
                  }}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="hasArtwork" className="font-medium text-slate-800 cursor-pointer">
                  同步附上工程向量完稿線與刀模檔案 (AI / PDF / DWG)
                </label>
              </div>

              {hasArtworkUpload ? (
                <div className="mt-3 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={artworkFileName}
                    onChange={(e) => setArtworkFileName(e.target.value)}
                    placeholder="輸入檔案名稱..."
                    className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 bg-white"
                  />
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    ✓ 系統將記錄上傳者、版本 v1.0 與時間戳記
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 mt-2">
                  提示：若暫不上傳圖稿，系統將標記「缺少工程向量圖稿」待補項目，並由業務發起追蹤。
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            送出後將立即建立唯一案件編號 (如 INQ-2026-XXXX) 並開啟全流程協作。
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              建立案件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
