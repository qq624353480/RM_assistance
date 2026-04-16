import React from 'react';

interface EvaluationLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EvaluationLogicModal: React.FC<EvaluationLogicModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-slate-50 shrink-0">
          <h3 className="text-base font-bold text-slate-800">AI 智能评测逻辑说明</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-sm text-slate-700 leading-relaxed">
          <div className="prose prose-sm max-w-none prose-slate">
            <p className="mb-4 text-slate-500">
              我们的评测体系采用 <strong>规则引擎 + 大模型语义分析</strong> 双重校验，旨在为您提供严谨、客观的配置建议。以下是详细的评测规则：
            </p>

            <h4 className="text-slate-900 font-bold mb-2 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              框架逻辑清晰度 (10分)
            </h4>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
              <li><strong>评测目标：</strong>检查提示词结构是否完整、逻辑是否自洽。</li>
              <li><strong>实现方式：</strong>大模型语义分析 (LLM Prompt)</li>
              <li><strong>评分标准：</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-xs text-slate-500">
                  <li>[角色设定] (2分)：是否明确定义了 AI 的身份？</li>
                  <li>[核心任务] (3分)：是否清晰描述了 AI 需要解决的具体问题？</li>
                  <li>[约束条件] (2分)：是否规定了 AI 的行为边界？</li>
                  <li>[工作流程] (3分)：是否给出了清晰的思考或行动步骤？</li>
                </ul>
              </li>
            </ul>

            <h4 className="text-slate-900 font-bold mb-2 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs">2</span>
              数据引用一致性 (10分)
            </h4>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
              <li><strong>评测目标：</strong>提示词中要求 AI 使用的客户信息，是否真的在“业务数据”中配置了对应字段。</li>
              <li><strong>实现方式：</strong>代码预处理 + 大模型比对</li>
              <li><strong>评分标准：</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-xs text-slate-500">
                  <li>10分：提示词中提到的所有数据需求，都有对应的字段支持。</li>
                  <li>6-9分：大部分需求有字段支持，但缺少个别非关键字段。</li>
                  <li>0-5分：提示词强依赖某些数据（如“根据余额”），但字段列表中完全缺失。</li>
                </ul>
              </li>
            </ul>

            <h4 className="text-slate-900 font-bold mb-2 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs">3</span>
              知识库覆盖度 (10分)
            </h4>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
              <li><strong>评测目标：</strong>提示词中要求 AI 回答的业务知识，是否在“知识库”中上传了对应文档。</li>
              <li><strong>实现方式：</strong>代码预处理 + 大模型比对</li>
              <li><strong>评分标准：</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-xs text-slate-500">
                  <li>10分：提示词提到的知识点，文件名均能对应上。</li>
                  <li>5-9分：部分知识点看起来有文件支持，但不够明确。</li>
                  <li>0分：提示词明确要求“根据附件回答”，但文件列表为空。</li>
                </ul>
              </li>
            </ul>

            <h4 className="text-slate-900 font-bold mb-2 mt-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">4</span>
              环境感知配置 (10分)
            </h4>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
              <li><strong>评测目标：</strong>是否配置了自动触发，且触发条件是否合理。</li>
              <li><strong>实现方式：</strong>纯代码逻辑判断</li>
              <li><strong>评分标准：</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1 text-xs text-slate-500">
                  <li>10分：触发页面和展示位置均已填写。</li>
                  <li>5分：仅填写了其中一项。</li>
                  <li>0分：均未填写。</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="h-14 border-t border-gray-100 bg-gray-50 flex items-center justify-end px-6 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationLogicModal;
