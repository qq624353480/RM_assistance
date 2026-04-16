import React, { useState } from 'react';
import { AgentConfig, Skill, AssociatedItem } from '../types';
import { LoaderIcon, CodeIcon, ChevronDownIcon, PlusIcon, TrashIcon } from './Icons';
import { MOCK_ASSOCIATED_ITEMS } from '../constants';

interface AgentConfigPanelProps {
  config: AgentConfig;
  skills?: Skill[]; 
  onChange: (key: keyof AgentConfig, value: any) => void;
  onSkillUpdate?: (skillId: string, updates: Partial<Skill>) => void;
  onJumpToTab?: (tabName: string) => void; // Added for dynamic jump
}

const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({ config, skills = [], onChange, onSkillUpdate, onJumpToTab }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'logic'>('config');
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const activeSkill = skills.find(s => s.id === selectedSkillId) || skills[0];

  const handleAddItem = (item: AssociatedItem) => {
    const currentItems = config.associatedItems || [];
    if (currentItems.find(i => i.id === item.id)) return;
    onChange('associatedItems', [...currentItems, item]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleRemoveItem = (id: string) => {
    const currentItems = config.associatedItems || [];
    onChange('associatedItems', currentItems.filter(i => i.id !== id));
  };

  const handleToggleValue = (itemId: string, value: string) => {
    const currentItems = config.associatedItems || [];
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        const selectedValues = item.selectedValues || [];
        const newSelected = selectedValues.includes(value)
          ? selectedValues.filter(v => v !== value)
          : [...selectedValues, value];
        return { ...item, selectedValues: newSelected };
      }
      return item;
    });
    onChange('associatedItems', updatedItems);
  };

  const handleUpdateCondition = (itemId: string, updates: Partial<AssociatedItem>) => {
    const currentItems = config.associatedItems || [];
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChange('associatedItems', updatedItems);
  };

  const filteredSearchItems = MOCK_ASSOCIATED_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        {activeTab === 'config' ? (
             <div className="flex flex-col space-y-4">
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

                {/* Associated Items Configuration */}
                <div className="shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center text-sm font-semibold text-slate-700">
                      <span className="mr-1">关联专案/商机/标签</span>
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="mb-3">
                    <button 
                      onClick={() => onJumpToTab?.('环境感知')}
                      className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
                    >
                      <span>💡 去配置自动唤起</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {config.associatedItems?.map((item) => (
                      <div key={item.id} className="flex flex-col gap-2 group border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`shrink-0 w-2 h-2 rounded-full ${item.type === 'project' ? 'bg-blue-500' : item.type === 'opportunity' ? 'bg-orange-500' : 'bg-green-500'}`} />
                            <span className="truncate text-sm font-medium text-slate-700">{item.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="输入专案ID/商机ID/标签搜索"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setIsSearching(true);
                            }}
                            onFocus={() => setIsSearching(true)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none transition-colors"
                          />
                          {isSearching && searchQuery && (
                            <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                              {filteredSearchItems.length > 0 ? (
                                filteredSearchItems.map(item => (
                                  <button
                                    key={item.id}
                                    onClick={() => handleAddItem(item)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
                                  >
                                    <span className="truncate">{item.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase">{item.type}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">未找到匹配项</div>
                              )}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => setIsSearching(!isSearching)}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-blue-600"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {isSearching && (
                        <div className="fixed inset-0 z-40" onClick={() => setIsSearching(false)} />
                      )}
                    </div>
                  </div>
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

                <div className="shrink-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center text-sm font-semibold text-slate-700">
                            回答框架 (Answer Framework) <span className="text-red-500 ml-1">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400">平台将自动根据场景拆解指令</span>
                    </div>
                    <textarea
                        value={config.instructions}
                        onChange={(e) => onChange('instructions', e.target.value)}
                        rows={10}
                        className="w-full p-4 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none font-sans text-slate-700 bg-white leading-relaxed"
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