import React, { useState } from 'react';
import { InquiryCase, QuoteVersion, UserRole } from '../types/inquiry';
import { Printer, X, CheckCircle2, AlertCircle, FileText, Send, Building2 } from 'lucide-react';

interface FormalQuotationModalProps {
  inquiry: InquiryCase;
  quote: QuoteVersion;
  currentRole: UserRole;
  onClose: () => void;
  onUpdateFeedback: (result: 'accepted' | 'negotiating' | 'revision_requested' | 'suspended' | 'rejected', comment: string, offeredTargetPrice?: number) => void;
}

export const FormalQuotationModal: React.FC<FormalQuotationModalProps> = ({
  inquiry,
  quote,
  currentRole,
  onClose,
  onUpdateFeedback,
}) => {
  const [feedbackResult, setFeedbackResult] = useState<'accepted' | 'negotiating' | 'revision_requested' | 'suspended' | 'rejected'>(
    quote.clientFeedback?.result || 'accepted'
  );
  const [feedbackComment, setFeedbackComment] = useState<string>(quote.clientFeedback?.comment || '');
  const [targetPrice, setTargetPrice] = useState<string>(quote.clientFeedback?.offeredTargetPrice?.toString() || '');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const boundSpec = inquiry.specVersions.find((s) => s.versionId === quote.specVersionRef) || inquiry.specVersions[0];

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFeedback(
      feedbackResult,
      feedbackComment,
      targetPrice ? parseFloat(targetPrice) : undefined
    );
    setShowFeedbackForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">正式報價單檢視 (Formal Quotation Document)</span>
            <span className="text-slate-400 text-xs">· 綁定規格版本：{quote.specVersionRef}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 輸出 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Quotation Sheet */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    AP
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    APEX 尖端印刷與工業材料製造股份有限公司
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  APEX Advanced Printing & Material Technology Corp.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  新竹科學園區創新一路12號 · TEL: 03-578-9000 · FAX: 03-578-9001 · Unified ID: 84920311
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-100 text-slate-800 font-bold px-3 py-1 text-sm rounded mb-2 border border-slate-300">
                  正 式 報 價 單 (QUOTATION)
                </span>
                <p className="text-xs text-slate-500 font-mono">單號: {quote.quoteId}</p>
                <p className="text-xs text-slate-500 font-mono">日期: {quote.createdAt.split(' ')[0]}</p>
                <p className="text-xs text-slate-500 font-mono">關聯案件: {inquiry.id}</p>
                <p className="text-xs text-blue-700 font-semibold font-mono">規格定版: {quote.specVersionRef}</p>
              </div>
            </div>
          </div>

          {/* Customer & Commercial Info Block */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                客戶與受文者資訊
              </h3>
              <p className="font-semibold text-slate-900 text-sm mb-1">{inquiry.client.company}</p>
              <p className="text-slate-600">聯絡窗口：{inquiry.client.contactPerson}</p>
              <p className="text-slate-600">聯絡電話：{inquiry.client.phone}</p>
              <p className="text-slate-600">電子信箱：{inquiry.client.email}</p>
              <p className="text-slate-600">產業領域：{inquiry.client.industry}</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase mb-2 border-b border-slate-200 pb-1">
                業務承辦人資訊
              </h3>
              <p className="font-semibold text-slate-900 text-sm mb-1">{inquiry.salesRep}</p>
              <p className="text-slate-600">承辦部門：業務一部</p>
              <p className="text-slate-600">電子郵件：{inquiry.salesRepEmail}</p>
              <p className="text-slate-600">有效期限：<span className="font-semibold text-slate-900">{quote.conditions.validUntil}</span></p>
              <p className="text-slate-600">核准狀態：
                <span className="text-emerald-700 font-semibold">
                  {quote.status === 'approved' ? '主管核定完成 (正式效力)' : '待核准草稿'}
                </span>
              </p>
            </div>
          </div>

          {/* Product & Technical Specification Summary */}
          <div className="mb-6 text-xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              一、產品名稱與確認技術規格 (依規格書 {quote.specVersionRef})
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-600 w-1/5">品項名稱</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 w-2/5">{inquiry.productName}</td>
                    <td className="py-2 px-3 font-medium text-slate-600 w-1/5">尺寸與形狀</td>
                    <td className="py-2 px-3 text-slate-800 w-1/5 tabular-nums">
                      {boundSpec.dimensions.widthMm} × {boundSpec.dimensions.heightMm} mm ({boundSpec.dimensions.shape})
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-medium text-slate-600">基材種類 (膜/紙)</td>
                    <td className="py-2 px-3 text-slate-800">{boundSpec.substrateType}</td>
                    <td className="py-2 px-3 font-medium text-slate-600">厚度或克重</td>
                    <td className="py-2 px-3 text-slate-800 tabular-nums">{boundSpec.thicknessWeight}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-600">油墨配方</td>
                    <td className="py-2 px-3 text-slate-800">{boundSpec.inkType}</td>
                    <td className="py-2 px-3 font-medium text-slate-600">油墨覆蓋率</td>
                    <td className="py-2 px-3 text-slate-800">{boundSpec.inkCoverage}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-medium text-slate-600">表面處理</td>
                    <td className="py-2 px-3 text-slate-800">{boundSpec.surfaceFinishing.join('、') || '無'}</td>
                    <td className="py-2 px-3 font-medium text-slate-600">特殊增值製程</td>
                    <td className="py-2 px-3 text-slate-800">{boundSpec.specialProcesses.join('、') || '無'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-600">出貨包裝形式</td>
                    <td colSpan={3} className="py-2 px-3 text-slate-800">{boundSpec.packagingRequirement}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Table (Client Facing: NO COST, NO MARGIN RATE) */}
          <div className="mb-6 text-xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              二、報價級距與交期明細 (新台幣 NTD，未稅)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-4 text-left">數量級距 (張 / PCS)</th>
                    <th className="py-2.5 px-4 text-right">含稅/未稅 單價 (NT$)</th>
                    <th className="py-2.5 px-4 text-right">總金額 (NT$)</th>
                    <th className="py-2.5 px-4 text-right">生產交期 (工作天)</th>
                    <th className="py-2.5 px-4 text-center">備註</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quote.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {item.tierQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700 tabular-nums text-sm">
                        NT$ {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                        NT$ {item.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 tabular-nums">
                        校稿核定後 {item.leadTimeDays} 天
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {idx === 0 ? '首批標準量' : '量大優惠階梯'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial Conditions & Remarks */}
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase">三、商務條件與備註說明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-700">
              <p>• <span className="font-semibold">開版／刀模費用：</span>
                {quote.conditions.toolingFee > 0 
                  ? `NT$ ${quote.conditions.toolingFee.toLocaleString()} (首批一次性計收)` 
                  : '免收 (共用現有公模尺寸)'}
              </p>
              <p>• <span className="font-semibold">付款條件：</span>{quote.conditions.paymentTerms}</p>
              <p>• <span className="font-semibold">交貨方式：</span>{quote.conditions.deliveryAssumptions}</p>
              <p>• <span className="font-semibold">報價有效期限：</span>{quote.conditions.validUntil} (逾期需重新核算原物料成本)</p>
            </div>
            {quote.conditions.unconfirmedNotes && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600">
                <span className="font-semibold text-slate-800">特別條件備註：</span>
                {quote.conditions.unconfirmedNotes}
              </div>
            )}
          </div>

          {/* Signature & Seal Block */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
            <div className="border border-slate-200 p-4 rounded-lg flex flex-col justify-between h-32 relative">
              <span className="font-semibold text-slate-800">報價方用印 (APEX Manufacturing Corp.)</span>
              <div className="absolute right-6 top-6 w-20 h-20 border-2 border-rose-600 rounded-full flex flex-col items-center justify-center text-rose-600 transform rotate-12 opacity-80 pointer-events-none">
                <span className="text-[10px] font-bold">尖端製造</span>
                <span className="text-[9px]">報價專用章</span>
                <span className="text-[8px] font-mono">APPROVED</span>
              </div>
              <div className="flex justify-between items-end text-slate-500 text-[11px]">
                <span>承辦人：{inquiry.salesRep}</span>
                <span>主管核准：{quote.approvalRecord?.approverName || '李振祥'}</span>
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-800">客戶回簽用印確認 (Client Sign-Off)</span>
                <span className="text-[10px] text-slate-400">請簽名用印後掃描回傳</span>
              </div>
              <div className="border-b border-dashed border-slate-300 h-10"></div>
              <div className="flex justify-between items-end text-slate-500 text-[11px]">
                <span>經辦確認簽章：____________</span>
                <span>日期：____年__月__日</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client / Sales Feedback Bar (No Print) */}
        <div className="no-print p-4 bg-slate-100 border-t border-slate-200">
          {!showFeedbackForm ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">目前客戶反饋狀態：</span>
                {quote.clientFeedback ? (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-medium rounded">
                    {quote.clientFeedback.result === 'accepted' && '已接受成交'}
                    {quote.clientFeedback.result === 'negotiating' && '議價洽談中'}
                    {quote.clientFeedback.result === 'revision_requested' && '要求規格/價格改版'}
                    {quote.clientFeedback.result === 'suspended' && '專案暫緩'}
                    {quote.clientFeedback.result === 'rejected' && '未成交'}
                  </span>
                ) : (
                  <span className="text-slate-500">尚待客戶回覆</span>
                )}
                {quote.clientFeedback?.comment && (
                  <span className="text-slate-600 truncate max-w-md">（{quote.clientFeedback.comment}）</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {currentRole === 'client' ? '回覆報價意向 (接受 / 議價 / 改版)' : '記錄客戶反饋結果 (FR-24)'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="bg-white p-4 rounded-lg border border-slate-300 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">
                  {currentRole === 'client' ? '提交您的回覆意向' : '記錄客戶商務反饋結果 (FR-24)'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  取消
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">回覆結果</label>
                  <select
                    value={feedbackResult}
                    onChange={(e: any) => setFeedbackResult(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800"
                  >
                    <option value="accepted">接受報價 (正式成交)</option>
                    <option value="negotiating">提出議價 (尋求目標價格)</option>
                    <option value="revision_requested">要求修改規格或交期</option>
                    <option value="suspended">專案暫緩 (保留報價)</option>
                    <option value="rejected">未成交 (結案不承作)</option>
                  </select>
                </div>

                {feedbackResult === 'negotiating' && (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">期望目標單價 (NT$)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="例如: 1.45"
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium text-xs mb-1">反饋具體說明 / 意見備註</label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="請輸入具體說明、交期或採購合約需求..."
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                >
                  儲存回覆結果
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
