import React from 'react';
import { XIcon, ExternalLinkIcon, LayersIcon, CpuIcon, DatabaseIcon, LayoutIcon, CodeIcon } from './Icons';

interface TechFrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechFrameworkModal: React.FC<TechFrameworkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner">
              <LayersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">系统技术方案框架</h2>
              <p className="text-xs text-slate-500">RM小助智能体平台架构设计与实现</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://gemini.google.com/share/f701edd9f3ab" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <ExternalLinkIcon className="w-3.5 h-3.5" />
              查看原始会话
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* 1. Architecture Diagram */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <LayoutIcon className="w-4 h-4 text-blue-500" />
                系统架构图 (Architecture Diagram)
              </h3>
              <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-x-auto min-w-[800px]">
                
                {/* Top Level: Applications */}
                <div className="border border-blue-200 rounded-lg p-2 bg-blue-50/30">
                  <div className="text-center font-bold text-blue-800 mb-2">RM小助</div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">财富助手</div>
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">营销助手</div>
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">投顾助手</div>
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">洞察助手</div>
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">办公助手</div>
                    <div className="border border-blue-200 bg-white text-center py-1 text-sm text-blue-700">研发助手</div>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </div>

                {/* Middle Section */}
                <div className="flex gap-4">
                  {/* Left Column (Dev + Knowledge) */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Dev Center */}
                    <div className="border border-dashed border-blue-300 rounded-lg p-3 relative flex">
                      <div className="w-8 flex items-center justify-center border-r border-dashed border-blue-300 mr-3">
                        <div className="font-bold text-blue-800 tracking-widest" style={{ writingMode: 'vertical-rl' }}>开发中心</div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        {/* 集成 */}
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-12 text-right">集成</div>
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">IM集成: 企微 | APP</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">业务系统集成: W+ | CRM</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">终端集成: PC | Pad</div>
                          </div>
                        </div>
                        {/* 开发工具 */}
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-12 text-right">开发<br/>工具</div>
                          <div className="flex-1 border border-gray-200 text-center py-1.5 text-xs text-gray-700 flex items-center justify-center gap-1">
                            <span className="font-bold text-blue-700 mr-2">智能体开发:</span>
                            快捷配置 &rarr; 场景编排 &rarr; 知识关联 &rarr; 插件赋能 &rarr; 提示工程 &rarr; 在线调试 &rarr; 批量评估
                          </div>
                        </div>
                        {/* 场景模板 */}
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-12 text-right">场景<br/>模板</div>
                          <div className="flex-1 grid grid-cols-6 gap-2">
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">知识问答</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">财富分析</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">营销话术</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">客户洞察</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">流程类任务</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">智能投放</div>
                          </div>
                        </div>
                        {/* 原子能力 */}
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-12 text-right">原子<br/>能力</div>
                          <div className="flex-1 grid grid-cols-6 gap-2">
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">意图理解</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">标签提取</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">知识检索</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">资产分析</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">长短期记忆</div>
                            <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">工具使用</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Knowledge Center */}
                    <div className="border border-dashed border-blue-300 rounded-lg p-3 relative flex">
                      <div className="w-8 flex items-center justify-center border-r border-dashed border-blue-300 mr-3">
                        <div className="font-bold text-blue-800 tracking-widest" style={{ writingMode: 'vertical-rl' }}>知识中心</div>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1 flex flex-col gap-2">
                            {/* 索引 */}
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500 w-12 text-right">索引</div>
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">API接口</div>
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">知识库</div>
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">语义模型</div>
                              </div>
                            </div>
                            {/* 加工 */}
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500 w-12 text-right">加工</div>
                              <div className="flex-1 border border-gray-200 text-center py-1.5 text-xs text-gray-700 flex items-center justify-center gap-1">
                                <span className="font-bold text-blue-700 mr-2">知识加工:</span>
                                多模态对齐 &rarr; 知识理解 &rarr; 知识清洗 &rarr; 知识提取 &rarr; 知识切片 &rarr; 构建索引
                              </div>
                            </div>
                            {/* 采集 */}
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500 w-12 text-right">采集</div>
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">业务系统: API</div>
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">金融知识: 文档</div>
                                <div className="border border-gray-200 text-center py-1 text-xs text-gray-700">客户数据: 数据库</div>
                              </div>
                            </div>
                        </div>
                        {/* Loop Side */}
                        <div className="w-32 flex items-center justify-center relative">
                            <div className="border-2 border-blue-400 rounded-lg p-2 text-center bg-blue-50 z-10">
                              <div className="text-xs font-bold text-blue-800">金融核心<br/>知识库</div>
                              <div className="text-[10px] text-gray-600 mt-1">专家标注<br/>主动收集</div>
                            </div>
                            {/* Arrows for loop - simplified with text */}
                            <div className="absolute left-0 top-1/4 -translate-x-full text-[10px] text-gray-500 flex flex-col items-center">
                              <span>沉淀</span>
                              <span>&rarr;</span>
                            </div>
                            <div className="absolute left-0 bottom-1/4 -translate-x-full text-[10px] text-gray-500 flex flex-col items-center">
                              <span>&larr;</span>
                              <span>回流</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Ops Center) */}
                  <div className="w-48 border border-dashed border-blue-300 rounded-lg p-3 flex flex-col">
                    <div className="text-center font-bold text-blue-800 mb-2">运营中心</div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      {/* 共享复用 */}
                      <div className="flex border border-gray-200 rounded">
                        <div className="w-6 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                          <div className="text-[10px] text-gray-500" style={{ writingMode: 'vertical-rl' }}>共享复用</div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 p-1">
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">智能体商店</div>
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">插件商店</div>
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">订阅审批</div>
                        </div>
                      </div>

                      {/* 安全管控 */}
                      <div className="flex border border-gray-200 rounded">
                        <div className="w-6 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                          <div className="text-[10px] text-gray-500" style={{ writingMode: 'vertical-rl' }}>安全管控</div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 p-1">
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">敏感词管理</div>
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">内容过滤</div>
                        </div>
                      </div>

                      {/* 统计分析 */}
                      <div className="flex border border-gray-200 rounded">
                        <div className="w-6 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                          <div className="text-[10px] text-gray-500" style={{ writingMode: 'vertical-rl' }}>统计分析</div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 p-1">
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">请求日志</div>
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">调用分析</div>
                          <div className="bg-white border border-gray-100 text-center py-1 text-xs text-gray-700">用户反馈</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </div>

                {/* Bottom Level: Models */}
                <div className="border border-blue-200 rounded-lg p-2 bg-blue-50/30">
                  <div className="text-center font-bold text-blue-800 mb-2">模型接入</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-500 text-white text-center py-2 rounded shadow-sm text-sm font-medium">金融大模型</div>
                    <div className="bg-blue-400 text-white text-center py-2 rounded shadow-sm text-sm font-medium">DeepSeek</div>
                    <div className="bg-blue-400 text-white text-center py-2 rounded shadow-sm text-sm font-medium">内部大模型</div>
                    <div className="bg-blue-300 text-white text-center py-2 rounded shadow-sm text-sm font-medium">其它开源模型</div>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. Core Technical Solutions */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CpuIcon className="w-4 h-4 text-blue-500" />
                核心技术方案 (Core Technical Solutions)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">自然语言规则引擎 (Natural Language Rules)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    将复杂的逻辑条件（如：标签取值、操作符、阈值）转化为自然语言填空式的 UI 配置。例如将 <code>AUM &gt; 100W</code> 转化为“如果客户符合 [AUM] [大于] [1000000] 时”。提升了业务人员的配置体验，降低了理解门槛。
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">动态场景联动 (Dynamic Scenarios)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <code>AgentConfigPanel</code> 中配置的关联项（专案、商机、标签）会实时同步至 <code>KnowledgePanel</code>，并根据关联项的类型自动生成对应的触发场景（如：点击触发、智能投放触发），实现了配置的模块化与高内聚。
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">沉浸式配置体验 (Immersive UX)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    摒弃了传统的表单堆砌，采用微型徽章、无边框输入、内联下拉框等极简 UI 元素。在有限的空间内（最多3行）展示完整的“条件+动作”配置，视觉清爽且信息密度高。
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                    <span className="font-bold text-sm">4</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">本地化状态持久化 (Local Persistence)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    利用 <code>localStorage</code> 实现智能体列表和详细配置的本地持久化存储。通过 <code>useEffect</code> 钩子在状态变更时自动同步，确保用户刷新页面后配置不丢失，提供类似桌面应用的流畅体验。
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TechFrameworkModal;
