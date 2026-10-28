import React, { useState } from 'react';
import { SpecVersion } from '../types/inquiry';
import { X, GitCompare, ArrowRight, Check } from 'lucide-react';

interface SpecDiffModalProps {
  specVersions: SpecVersion[];
  onClose: () => void;
  initialBaseId?: string;
  initialTargetId?: string;
}

export const SpecDiffModal: React.FC<SpecDiffModalProps> = ({
  specVersions,
  onClose,
  initialBaseId,
  initialTargetId,
}) => {
  const [baseVersionId, setBaseVersionId] = useState<string>(
    initialBaseId || (specVersions.length > 1 ? specVersions[0].versionId : specVersions[0]?.versionId || '')
  );
  const [targetVersionId, setTargetVersionId] = useState<string>(
    initialTargetId || specVersions[specVersions.length - 1]?.versionId || ''
  );

  const baseSpec = specVersions.find((s) => s.versionId === baseVersionId) || specVersions[0];
  const targetSpec = specVersions.find((s) => s.versionId === targetVersionId) || specVersions[specVersions.length - 1];

  if (!baseSpec || !targetSpec) return null;

  interface ComparisonField {
    label: string;
    key: string;
    renderBase: () => string;
    renderTarget: () => string;
    isDifferent: boolean;
  }

  const baseDims = `${baseSpec.dimensions.widthMm} x ${baseSpec.dimensions.heightMm} mm (${baseSpec.dimensions.shape}${baseSpec.dimensions.radiusMm ? `, R${baseSpec.dimensions.radiusMm}` : ''})`;
  const targetDims = `${targetSpec.dimensions.widthMm} x ${targetSpec.dimensions.heightMm} mm (${targetSpec.dimensions.shape}${targetSpec.dimensions.radiusMm ? `, R${targetSpec.dimensions.radiusMm}` : ''})`;

  const fields: ComparisonField[] = [
    {
      label: '產品外觀尺寸與形狀',
      key: 'dimensions',
      renderBase: () => baseDims,
      renderTarget: () => targetDims,
      isDifferent: baseDims !== targetDims,
    },
    {
      label: '油墨種類',
      key: 'inkType',
      renderBase: () => baseSpec.inkType,
      renderTarget: () => targetSpec.inkType,
      isDifferent: baseSpec.inkType !== targetSpec.inkType,
    },
    {
      label: '膜／紙材質種類 (基材)',
      key: 'substrateType',
      renderBase: () => baseSpec.substrateType,
      renderTarget: () => targetSpec.substrateType,
      isDifferent: baseSpec.substrateType !== targetSpec.substrateType,
    },
    {
      label: '厚度或克重',
      key: 'thicknessWeight',
      renderBase: () => baseSpec.thicknessWeight,
      renderTarget: () => targetSpec.thicknessWeight,
      isDifferent: baseSpec.thicknessWeight !== targetSpec.thicknessWeight,
    },
    {
      label: '預估油墨覆蓋率',
      key: 'inkCoverage',
      renderBase: () => baseSpec.inkCoverage,
      renderTarget: () => targetSpec.inkCoverage,
      isDifferent: baseSpec.inkCoverage !== targetSpec.inkCoverage,
    },
    {
      label: '表面處理工藝',
      key: 'surfaceFinishing',
      renderBase: () => baseSpec.surfaceFinishing.join('、') || '無',
      renderTarget: () => targetSpec.surfaceFinishing.join('、') || '無',
      isDifferent: JSON.stringify(baseSpec.surfaceFinishing) !== JSON.stringify(targetSpec.surfaceFinishing),
    },
    {
      label: '特殊製程工藝',
      key: 'specialProcesses',
      renderBase: () => baseSpec.specialProcesses.join('、') || '無',
      renderTarget: () => targetSpec.specialProcesses.join('、') || '無',
      isDifferent: JSON.stringify(baseSpec.specialProcesses) !== JSON.stringify(targetSpec.specialProcesses),
    },
    {
      label: '出貨包裝形式',
      key: 'packagingRequirement',
      renderBase: () => baseSpec.packagingRequirement || '未指定',
      renderTarget: () => targetSpec.packagingRequirement || '未指定',
      isDifferent: baseSpec.packagingRequirement !== targetSpec.packagingRequirement,
    },
    {
      label: '應用與環境規範',
      key: 'environmentRequirement',
      renderBase: () => baseSpec.environmentRequirement || '常規',
      renderTarget: () => targetSpec.environmentRequirement || '常規',
      isDifferent: baseSpec.environmentRequirement !== targetSpec.environmentRequirement,
    },
  ];

  const changedCount = fields.filter((f) => f.isDifferent).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">規格版本差異比對 (Spec Version Diff)</h2>
              <p className="text-xs text-slate-500">
                追蹤材料、製程與尺寸從初版到工程確認後的具體變更歷程
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">基準版本：</span>
            <select
              value={baseVersionId}
              onChange={(e) => setBaseVersionId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
            >
              {specVersions.map((v) => (
                <option key={v.versionId} value={v.versionId}>
                  {v.versionId} ({v.createdAt.split(' ')[0]} - {v.createdByName})
                </option>
              ))}
            </select>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            <span className="text-slate-500 font-medium">比對新版本：</span>
            <select
              value={targetVersionId}
              onChange={(e) => setTargetVersionId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
            >
              {specVersions.map((v) => (
                <option key={v.versionId} value={v.versionId}>
                  {v.versionId} ({v.createdAt.split(' ')[0]} - {v.createdByName})
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-600 font-medium">
            共檢測出 <span className="text-blue-700 font-bold tabular-nums">{changedCount}</span> 項規格異動
          </div>
        </div>

        {/* Change Notes Banner */}
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 text-xs text-blue-900 flex items-start gap-2">
          <span className="font-semibold shrink-0">【{targetSpec.versionId} 修訂重點】</span>
          <span>{targetSpec.changeSummary || '無版本修訂說明'}</span>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-4 font-semibold w-1/4">規格技術欄位</th>
                  <th className="py-2.5 px-4 font-semibold w-[37.5%]">
                    基準版 ({baseSpec.versionId})
                  </th>
                  <th className="py-2.5 px-4 font-semibold w-[37.5%]">
                    新修訂版 ({targetSpec.versionId})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fields.map((field) => {
                  const baseVal = field.renderBase();
                  const targetVal = field.renderTarget();

                  return (
                    <tr
                      key={field.key}
                      className={field.isDifferent ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'}
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {field.isDifferent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                          <span>{field.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className={field.isDifferent && baseVal === '待確認' ? 'text-rose-500 font-medium' : ''}>
                          {baseVal}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {field.isDifferent ? (
                          <div className="text-blue-950 font-medium bg-blue-100/50 p-1.5 rounded border border-blue-200/60">
                            {targetVal}
                          </div>
                        ) : (
                          <span className="text-slate-600">{targetVal}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            規格修改均保留完整版本編號與操作日誌，報價單將綁定指定核准版本。
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
