import React from 'react';
import { InquiryCase, UserRole, QuoteVersion } from '../types/inquiry';
import { DollarSign, Printer, CheckCircle, ArrowRight, Clock, Building2 } from 'lucide-react';

interface QuotationsViewProps {
  inquiries: InquiryCase[];
  currentRole: UserRole;
  onSelectCase: (caseId: string) => void;
  onOpenFormalQuote: (inquiry: InquiryCase, quote: QuoteVersion) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  inquiries,
  currentRole,
  onSelectCase,
  onOpenFormalQuote,
}) => {
  const isClient = currentRole === 'client';

  // Get all quotations with case context
  const allQuotes = inquiries.flatMap((inq) =>
    inq.quotes.map((quote) => ({
      ...quote,
      inquiry: inq,
      caseId: inq.id,
      productName: inq.productName,
      company: inq.client.company,
      salesRep: inq.salesRep,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            報價與主管核價管理中心 (Quotation & Approvals)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            統整各案件之歷次報價版本、毛利試算、主管審核進度與客戶成交/議價回饋。
          </p>
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <th className="py-3 px-4">報價單號 / 案件編號</th>
              <th className="py-3 px-4">客戶公司 / 產品品名</th>
              <th className="py-3 px-4">規格版本</th>
              <th className="py-3 px-4 text-center">報價狀態</th>
              <th className="py-3 px-4 text-right">首批梯次單價</th>
              <th className="py-3 px-4 text-right">總金額 (未稅)</th>
              <th className="py-3 px-4 text-center">客戶反饋結果</th>
              <th className="py-3 px-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allQuotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  尚無建立的報價單據。
                </td>
              </tr>
            ) : (
              allQuotes.map((q) => {
                const firstTier = q.items[0];

                return (
                  <tr key={q.quoteId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{q.quoteId}</div>
                      <div className="text-[11px] font-mono text-blue-700">{q.caseId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{q.company}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{q.productName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {q.specVersionRef}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                        q.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {q.status === 'approved' ? '主管已核准' : '待主管審核'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-blue-700 tabular-nums text-sm">
                      NT$ {firstTier.unitPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                      NT$ {firstTier.totalAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {q.clientFeedback ? (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-medium text-[11px]">
                          {q.clientFeedback.result === 'accepted' && '已接受成交'}
                          {q.clientFeedback.result === 'negotiating' && '議價中'}
                          {q.clientFeedback.result === 'revision_requested' && '要求修改'}
                          {q.clientFeedback.result === 'suspended' && '暫緩'}
                          {q.clientFeedback.result === 'rejected' && '未成交'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">待回覆</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenFormalQuote(q.inquiry, q)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>報價單</span>
                        </button>
                        <button
                          onClick={() => onSelectCase(q.caseId)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="開啟案件"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
