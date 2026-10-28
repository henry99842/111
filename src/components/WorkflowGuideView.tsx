import React from 'react';
import { USER_ROLES } from '../utils/constants';
import { Check, ShieldCheck, FileCheck, Layers, Award, AlertCircle } from 'lucide-react';

export const WorkflowGuideView: React.FC = () => {
  return (
    <div className="space-y-6 text-xs text-slate-800">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
        <h2 className="text-base font-bold text-slate-900">
          詢價與跨部門技術確認標準作業程序 (SOP Guide)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          建立一套端到端的防錯協同架構，串聯客戶、業務、研發、生產、採購、品管及核價主管，避免資訊落差、重工與報價延遲。
        </p>
      </div>

      {/* 8-Stage Flow Cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">一、八階標準作業流程 (8-Stage Workflow)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: '需求提報與建案',
              desc: '業務接單或客戶線上提交產品名稱、尺寸、用途、數量級距與初始附件，產生唯一案號。',
              badge: 'FR-01 ~ FR-04',
            },
            {
              step: '02',
              title: '防錯與缺漏盤點',
              desc: '系統自動比對向量刀模圖、材料厚度、油墨配方等必要欄位，標記待補項目並分派追蹤。',
              badge: 'FR-10, FR-11',
            },
            {
              step: '03',
              title: '規格版本管理',
              desc: '圖稿或基材更新時建立新版 (v1.0 -> v1.1)，完整保留歷史差異與修訂原因，支援雙向比對。',
              badge: 'FR-12',
            },
            {
              step: '04',
              title: '跨部門技術評估',
              desc: '研發、生產、採購、品管評估技術可行性、機台排程、單價庫存與驗收標準，標註潛在風險。',
              badge: 'FR-13 ~ FR-15',
            },
            {
              step: '05',
              title: '問題澄清 (RFI)',
              desc: '將疑問明確區分「內部研討」與「需客戶確認」，客戶無法檢視內部工程機密與技術對話。',
              badge: 'FR-16, FR-17',
            },
            {
              step: '06',
              title: '成本試算與核價',
              desc: '業務依確認規格編制報價草稿，送呈核價主管審核毛利率與交期風險，執行核准或退回。',
              badge: 'FR-19 ~ FR-21',
            },
            {
              step: '07',
              title: '正式報價單輸出',
              desc: '核定後產生標準正式報價單，強制綁定定版規格 (如 v1.1) 與商務條件，支援列印與簽章。',
              badge: 'FR-22, FR-23',
            },
            {
              step: '08',
              title: '客戶結果回饋',
              desc: '即時記錄客戶回簽接受、目標議價、改版或暫緩，完整留存結案歷程作為後續數據分析。',
              badge: 'FR-24',
            },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-blue-600">{item.step}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                  {item.badge}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permission Matrix (Section 6) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">二、各角色職責與資料權限控管矩陣 (Role & Security)</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">使用角色</th>
                <th className="py-2.5 px-4">主要職責</th>
                <th className="py-2.5 px-4 text-center">內部成本/利潤</th>
                <th className="py-2.5 px-4 text-center">研發內部對話</th>
                <th className="py-2.5 px-4 text-center">主管核價審核</th>
                <th className="py-2.5 px-4 text-center">規格維護</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {USER_ROLES.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{r.name}</div>
                    <span className="text-[10px] font-normal text-slate-500">{r.department}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{r.description}</td>
                  <td className="py-3 px-4 text-center">
                    {r.canViewCost ? (
                      <span className="text-emerald-700 font-semibold">可查閱</span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">嚴格遮蔽</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.canViewInternalDiscussion ? (
                      <span className="text-emerald-700 font-semibold">可查閱</span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">嚴格遮蔽</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.canApproveQuote ? (
                      <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">審核准駁權</span>
                    ) : (
                      <span className="text-slate-400">無權限</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.canEditTechSpec ? (
                      <span className="text-blue-700 font-semibold">可編輯新版</span>
                    ) : (
                      <span className="text-slate-400">僅檢視</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
