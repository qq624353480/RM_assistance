import React, { useState } from 'react';
import { AgentConfig, Skill } from '../types';
import { LoaderIcon, CodeIcon, ChevronDownIcon } from './Icons';

interface AgentConfigPanelProps {
  config: AgentConfig;
  skills?: Skill[]; 
  onChange: (key: keyof AgentConfig, value: string) => void;
  onSkillUpdate?: (skillId: string, updates: Partial<Skill>) => void;
}

const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({ config, skills = [], onChange, onSkillUpdate }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'logic'>('config');
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const activeSkill = skills.find(s => s.id === selectedSkillId) || skills[0];

  // Logic to "silently" extract relevant instruction from global instructions
  const getExtractedInstruction = () => {
    if (!activeSkill) return '';
    const fullText = config.instructions;
    const skillName = activeSkill.name.split(' (')[0]; // Handle names like "持仓分析 (Holdings Analysis)"
    
    // Split by common separators in the Answer Framework
    const scenes = fullText.split(/场景[一二三四五六七八九十\d]：/);
    const matchedScene = scenes.find(s => s.includes(skillName));
    
    if (matchedScene) {
        return `## 自动拆解结果 [来自主回答框架]：\n\n${matchedScene.trim().split('#')[0]}`;
    }
    return '未在回答框架中找到匹配的场景描述。系统将使用全局通用指令。';
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
        setIsCompiling(false);
        alert(`Skill "${activeSkill?.name}" SOP 脚本已根据最新逻辑更新。`);
    }, 1000);
  };

  const handleCopy = () => {
    if (activeSkill?.sopLogic) {
        navigator.clipboard.writeText(activeSkill.sopLogic);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Tab Header */}
      <div className="flex items-center border-b border-gray-200 px-4 pt-4 shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'config' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            回答框架配置
            {activeTab === 'config' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`pb-3 px-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'logic' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            逻辑引擎调试 (Debug)
            {activeTab === 'logic' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
      </div>

      <div className="flex-1 min-h-0 p-4">
        {activeTab === 'config' ? (
             <div className="flex flex-col h-full space-y-4">
                <div className="shrink-0">
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    智能体名称 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    value={config.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                </div>

                <div className="shrink-0">
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    智能体描述
                </label>
                <textarea
                    value={config.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    rows={2}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none transition-colors resize-none leading-relaxed"
                />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <label className="flex items-center text-sm font-semibold text-slate-700">
                            回答框架 (Answer Framework) <span className="text-red-500 ml-1">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400">平台将自动根据场景拆解指令</span>
                    </div>
                    <textarea
                        value={config.instructions}
                        onChange={(e) => onChange('instructions', e.target.value)}
                        className="w-full h-full p-4 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none font-sans text-slate-700 bg-white leading-relaxed"
                        placeholder="请输入完整的人设、框架与格式要求..."
                    />
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full space-y-4">
                {/* Skill Selector */}
                <div className="space-y-2 shrink-0">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        选择调试技能 (Skill)
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedSkillId}
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                            className="w-full p-2.5 pr-8 text-sm bg-white border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none font-medium text-slate-700"
                        >
                            {skills.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col min-h-0 gap-4">
                    {/* 1. Skill Prompt - READ ONLY PREVIEW */}
                    <div className="flex-1 flex flex-col min-h-0">
                         <div className="flex justify-between items-center mb-1 shrink-0">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                自动拆解提示词 (Extracted Prompt)
                            </label>
                            <span className="text-[10px] text-blue-500 bg-blue-50 px-1 rounded border border-blue-100">AI Powered</span>
                        </div>
                        <div className="flex-1 w-full p-3 text-xs border border-gray-200 rounded font-mono text-slate-500 bg-gray-50 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {getExtractedInstruction()}
                        </div>
                    </div>

                    {/* 2. SOP Code Editor */}
                    <div className="flex-1 flex flex-col min-h-0 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center shrink-0">
                             <div className="flex items-center gap-2">
                                 <CodeIcon />
                                 <span className="text-xs font-mono text-slate-600 font-bold">{activeSkill ? `${activeSkill.name}_SOP.js` : 'select_skill.js'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="text-[10px] bg-white border border-gray-300 hover:text-blue-600 px-3 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    {copyFeedback ? '已复制' : '复制脚本'}
                                </button>
                                <button 
                                    onClick={handleCompile}
                                    className="text-[10px] bg-white border border-gray-300 hover:text-blue-600 px-3 py-1 rounded transition-colors"
                                >
                                    手动重置
                                </button>
                             </div>
                        </div>
                        <div className="flex-1 bg-white p-1 relative overflow-hidden">
                            <textarea
                                value={activeSkill?.sopLogic || '// Select a skill to edit SOP'}
                                onChange={(e) => onSkillUpdate && activeSkill && onSkillUpdate(activeSkill.id, { sopLogic: e.target.value })}
                                className="w-full h-full bg-transparent text-xs font-mono text-slate-700 p-4 outline-none resize-none leading-relaxed"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfigPanel;