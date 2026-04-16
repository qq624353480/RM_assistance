import React, { useRef, useState } from 'react';
import { FileItem, DataField, Skill, EnvConfig, AgentConfig, AssociatedItem } from '../types';
import { WordIcon, ExcelIcon, PdfIcon, TxtIcon, CheckCircleIcon, LoaderIcon, TrashIcon, EditIcon, ChevronDownIcon, SettingsIcon, PlusIcon, CodeIcon, TableIcon, EyeIcon, ChevronUpIcon } from './Icons';
import DataSelectorModal from './DataSelectorModal';
import { ZODIAC_KNOWLEDGE_BASE } from '../knowledge_data';

interface KnowledgePanelProps {
  config: AgentConfig;
  files: FileItem[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  
  dataFields: DataField[];
  onRemoveDataField?: (id: string) => void; // Added remove handler
  onAddDataField?: (field: DataField) => void; // Added add handler
  
  skills: Skill[];
  onToggleSkill: (id: string) => void;
  
  envConfig: EnvConfig;
  onUpdateEnvConfig: (key: keyof EnvConfig, value: string) => void;
  onUpdateConfig?: (key: keyof AgentConfig, value: any) => void; // Added to update placement logic
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PathFlow: React.FC<{ entry: string; action: string; target: string; colorClass: string }> = ({ entry, action, target, colorClass }) => (
  <div className="flex items-center gap-2 py-2">
    <div className="flex flex-col items-center min-w-[80px]">
      <div className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-slate-600 shadow-sm">
        {entry}
      </div>
    </div>
    <div className="flex-1 flex items-center gap-1">
      <div className={`h-[1px] flex-1 bg-gradient-to-r from-gray-200 via-${colorClass.split('-')[1]}-400 to-gray-200 relative`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] text-gray-400 whitespace-nowrap border border-gray-100 rounded-full">
          {action}
        </div>
      </div>
      <svg className={`w-3 h-3 text-${colorClass.split('-')[1]}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
      </svg>
    </div>
    <div className="flex flex-col items-center min-w-[80px]">
      <div className={`px-2 py-1 bg-${colorClass.split('-')[1]}-600 text-white rounded text-[10px] font-bold shadow-sm`}>
        {target}
      </div>
    </div>
  </div>
);

const PathPreviewPlaceholder: React.FC<{ title: string; label?: string; className?: string; contentClassName?: string }> = ({ title, label, className = "mt-2", contentClassName = "mt-2" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className={className}>
      <button 
        onClick={() => setShow(!show)}
        className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <EyeIcon className="w-3 h-3" />
        {show ? (label ? `收起${label}` : '收起路径示例') : (label || '查看路径示例')}
      </button>
      
      {show && (
        <div className={contentClassName}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">路径预览：{title}</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          </div>
          <div className="aspect-video bg-white rounded border border-gray-200 flex flex-col items-center justify-center relative group cursor-zoom-in">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="w-full h-4 bg-gray-50 border-b border-gray-100 flex items-center px-2 gap-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded" />
              <div className="w-8 h-1.5 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 w-full flex">
              <div className="w-12 border-r border-gray-100 bg-gray-50/50 p-1 space-y-1">
                <div className="w-full h-1 bg-gray-200 rounded" />
                <div className="w-full h-1 bg-blue-400 rounded" />
                <div className="w-full h-1 bg-gray-200 rounded" />
              </div>
              <div className="flex-1 p-2 relative">
                <div className="w-2/3 h-2 bg-gray-100 rounded mb-2" />
                <div className="w-full h-12 border border-blue-200 rounded bg-blue-50/30 flex items-center justify-center">
                   <div className="text-[10px] text-blue-400 font-bold">W+ 系统截图示意</div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-blue-600 shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 text-white">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MonthDayPicker: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [m, d] = (value || '01-01').split('-');
  
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <div className="flex items-center gap-1">
      <select 
        value={m} 
        onChange={(e) => onChange(`${e.target.value}-${d}`)}
        className="p-1 text-[10px] border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
      >
        {months.map(mon => <option key={mon} value={mon}>{mon}月</option>)}
      </select>
      <select 
        value={d} 
        onChange={(e) => onChange(`${m}-${e.target.value}`)}
        className="p-1 text-[10px] border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
      >
        {days.map(day => <option key={day} value={day}>{day}日</option>)}
      </select>
    </div>
  );
};

const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ 
  config,
  files, onUpload, onDelete,
  dataFields, onRemoveDataField, onAddDataField,
  skills, onToggleSkill,
  envConfig, onUpdateEnvConfig,
  onUpdateConfig,
  activeTab, setActiveTab
}) => {
  const tabs = ['上传知识', '引用数据', '嵌入插件', '环境感知', '高级配置'];
  const [envSubTab, setEnvSubTab] = useState<'example' | 'guess' | 'transaction'>('example');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-switch to transaction sub-tab if we jump here from elsewhere
  React.useEffect(() => {
    if (activeTab === '环境感知') {
      setEnvSubTab('transaction');
    }
  }, [activeTab]);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'excel': return <ExcelIcon />;
      case 'pdf': return <PdfIcon />;
      case 'txt': return <TxtIcon />;
      case 'word': default: return <WordIcon />;
    }
  };

  // Group data fields by category (using the string category from DataField)
  const groupedData = dataFields.reduce((acc, field) => {
    const cat = field.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(field);
    return acc;
  }, {} as Record<string, DataField[]>);

  const updateTagValue = (tagId: string, updates: Partial<AssociatedItem>) => {
    if (!config.associatedItems || !onUpdateConfig) return;
    const newItems = config.associatedItems.map(item => 
      item.id === tagId ? { ...item, ...updates } : item
    );
    onUpdateConfig('associatedItems', newItems);
  };

  const [enabledTransactions, setEnabledTransactions] = useState<Record<string, boolean>>({});

  const toggleTransaction = (id: string) => {
    setEnabledTransactions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isTransactionEnabled = (id: string, defaultVal: boolean) => {
    return enabledTransactions[id] ?? defaultVal;
  };

  const getTagConditionText = (item: AssociatedItem) => {
    if (item.valueType === 'category') {
      const vals = item.selectedValues || [];
      return vals.length > 0 ? `值为 ${vals.join(', ')}` : '未配置取值';
    } else if (item.valueType === 'date') {
      const opMap: Record<string, string> = { '=': '等于', '>': '大于', '<': '小于', 'between': '在区间' };
      const opText = opMap[item.operator || '='] || '=';
      if (item.operator === 'between') {
        return item.threshold && item.thresholdEnd ? `在 ${item.threshold} 至 ${item.thresholdEnd} 之间` : '未配置区间';
      }
      return item.threshold !== undefined ? `${opText} ${item.threshold}` : '未配置日期';
    } else {
      const opMap: Record<string, string> = { '=': '等于', '>': '大于', '<': '小于', '>=': '大于等于', '<=': '小于等于', 'between': '区间' };
      if (item.operator === 'between') {
        return item.threshold !== undefined && item.thresholdEnd !== undefined ? `${item.threshold} 至 ${item.thresholdEnd} 区间` : '未配置区间';
      }
      const opText = opMap[item.operator || '>'] || '大于';
      return item.threshold !== undefined ? `${opText} ${item.threshold}` : '未配置阈值';
    }
  };

  // Auto-generate transactions based on associated items
  const renderTransactions = () => {
    if (!config.associatedItems || config.associatedItems.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-lg">
          <p className="text-sm text-gray-400">请先在左侧关联专案/商机/标签</p>
        </div>
      );
    }

    const tags = config.associatedItems.filter(i => i.type === 'tag');
    const projects = config.associatedItems.filter(i => i.type === 'project');
    const opportunities = config.associatedItems.filter(i => i.type === 'opportunity');
    const activities = config.associatedItems.filter(i => i.type === 'activity');
    const databases = config.associatedItems.filter(i => i.type === 'database');

    // Unified Blue Theme for all items
    const containerClass = "border border-blue-100 rounded-lg overflow-hidden bg-white shadow-sm transition-all";
    const headerClass = "bg-slate-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center cursor-pointer hover:bg-blue-50/50 transition-colors";
    const tagBadgeClass = "px-2 py-0.5 rounded text-[10px] font-bold text-white bg-blue-600";
    
    return (
      <div className="space-y-4">
        {/* 1. Project/Opportunity/Activity/Database Groups */}
        {[...projects, ...opportunities, ...activities, ...databases].map(item => {
          const isExpanded = expandedGroups[item.id];
          
          const typeLabel = item.type === 'project' ? '专案' : 
                           item.type === 'opportunity' ? '商机' : 
                           item.type === 'activity' ? '活动' : '数据库';

          return (
            <div key={item.id} className={containerClass}>
              <div 
                onClick={() => toggleGroup(item.id)}
                className={headerClass}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={tagBadgeClass}>
                    {typeLabel}
                  </span>
                  <span className="text-sm font-bold text-slate-800 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    已生成 5 个自动唤起规则
                  </span>
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Scenario 1-4: Standard Click Transactions */}
                  {[
                    { id: 1, entry: `W+${typeLabel}客户列表`, target: '客户洞察页', action: `点击${typeLabel}客户进入` },
                    { id: 2, entry: `W+${typeLabel}客户列表`, target: '电访面板页', action: `点击${typeLabel}客户进入` },
                    { id: 3, entry: 'W+商机中心', target: '客户洞察页', action: `点击${typeLabel}客户进入` },
                    { id: 4, entry: 'W+商机中心', target: '电访面板页', action: `点击${typeLabel}客户进入` },
                  ].map((scenario) => {
                    const transId = `${item.id}-scenario-${scenario.id}`;
                    const isEnabled = isTransactionEnabled(transId, true);
                    return (
                      <div key={scenario.id} className={`space-y-3 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-2 flex-1 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{scenario.id}</div>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-700 leading-snug">
                                客户经理在{scenario.entry}，{scenario.action}{scenario.target}，将自动回答：
                              </div>
                              <input 
                                type="text" 
                                defaultValue="请结合客户情况，提供分析" 
                                className="w-full p-2 text-xs border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <PathPreviewPlaceholder title={`${scenario.entry} -> ${scenario.target}`} label="示例" className="" contentClassName="mt-2 col-span-full" />
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleTransaction(transId); }}
                                className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        </div>
                        <div className="h-px bg-gray-100" />
                      </div>
                    );
                  })}

                  {/* Scenario 5: Placement Transaction (Default Closed) */}
                  {(() => {
                    const transId = `${item.id}-scenario-5`;
                    const isEnabled = isTransactionEnabled(transId, false);
                    return (
                      <div className="space-y-3 transition-opacity">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</div>
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-700 leading-snug">
                                  客户经理在W+打开客户洞察时，如果客户命中{typeLabel}客群，将自动回答：
                                </div>
                                <input 
                                  type="text" 
                                  defaultValue="请结合客户情况，提供分析" 
                                  className="w-full p-2 text-xs border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <PathPreviewPlaceholder title="智能投放触发" label="示例" className="" contentClassName="mt-2 col-span-full" />
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{isEnabled ? '已开启' : '未开启'}</span>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); toggleTransaction(transId); }}
                                        className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}

        {/* 2. Tag Groups */}
        {tags.map(item => {
           const isExpanded = expandedGroups[item.id];
           
           return (
            <div key={item.id} className={containerClass}>
              <div 
                onClick={() => toggleGroup(item.id)}
                className={headerClass}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={tagBadgeClass}>
                    标签
                  </span>
                  <span className="text-sm font-bold text-slate-800 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {item.isConfiguredInInsight ? '已生成 2 个自动唤起规则' : '已生成 1 个自动唤起规则'}
                  </span>
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Scenario 1: Click (Only if configured) */}
                  {(() => {
                    const transId = `${item.id}-scenario-1`;
                    const isEnabled = isTransactionEnabled(transId, true);
                    return (
                      <div className={`space-y-3 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-700 leading-snug">
                                  客户经理在W+客户洞察页，点击客户标签，将自动回答：
                                </div>
                                {item.isConfiguredInInsight ? (
                                  <input 
                                      type="text" 
                                      defaultValue={`请帮我解读${item.name}标签`} 
                                      className="w-full p-2 text-xs border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                     <span>
                                       客户洞察未配置该标签，如需点击触发请先
                                       <button className="text-blue-600 hover:underline ml-1">前往WE配置标签</button>
                                     </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <PathPreviewPlaceholder title={`点击标签 ${item.name}`} label="示例" className="" contentClassName="mt-2 col-span-full" />
                                {item.isConfiguredInInsight && (
                                  <div 
                                      onClick={(e) => { e.stopPropagation(); toggleTransaction(transId); }}
                                      className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </div>
                                )}
                            </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="h-px bg-gray-100" />

                  {/* Scenario 2: Placement (Default Closed) */}
                  {(() => {
                    const transId = `${item.id}-scenario-2`;
                    const isEnabled = isTransactionEnabled(transId, false);
                    return (
                      <div className="space-y-3 transition-opacity">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-700 leading-snug flex flex-wrap items-center gap-1.5">
                                  <span>客户经理在W+打开客户洞察时，如果客户符合</span>
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-100">{item.name}</span>
                                  
                                  {/* Logic Operator Selector */}
                                  <select 
                                      value={item.operator || (item.valueType === 'category' ? '值为' : item.valueType === 'date' ? '=' : '>')}
                                      onChange={(e) => updateTagValue(item.id, { operator: e.target.value as any })}
                                      className="bg-transparent text-blue-600 font-bold outline-none cursor-pointer hover:bg-blue-50 rounded px-1"
                                  >
                                      {item.valueType === 'category' ? (
                                          <option value="值为">值为</option>
                                      ) : item.valueType === 'date' ? (
                                          <>
                                              <option value="=">等于</option>
                                              <option value=">">大于</option>
                                              <option value="<">小于</option>
                                              <option value="between">在区间</option>
                                          </>
                                      ) : (
                                          <>
                                              <option value=">">大于</option>
                                              <option value="<">小于</option>
                                              <option value="=">等于</option>
                                              <option value="between">在区间</option>
                                          </>
                                      )}
                                  </select>

                                  {/* Value Inputs based on type */}
                                  {item.valueType === 'category' ? (
                                      <div className="flex flex-wrap gap-1 items-center">
                                          {item.values?.map(v => (
                                              <button
                                                  key={v}
                                                  onClick={() => {
                                                      const current = item.selectedValues || [];
                                                      const next = current.includes(v) 
                                                          ? current.filter(x => x !== v)
                                                          : [...current, v];
                                                      updateTagValue(item.id, { selectedValues: next });
                                                  }}
                                                  className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                                                      item.selectedValues?.includes(v)
                                                          ? 'bg-blue-600 text-white border-blue-600'
                                                          : 'bg-white text-slate-400 border-gray-200 hover:border-blue-300'
                                                  }`}
                                              >
                                                  {v}
                                              </button>
                                          ))}
                                      </div>
                                  ) : item.valueType === 'date' ? (
                                      <div className="flex items-center gap-1">
                                          {item.dateType === 'MM-DD' ? (
                                              <>
                                                  <MonthDayPicker 
                                                      value={item.threshold as string || '01-01'} 
                                                      onChange={(val) => updateTagValue(item.id, { threshold: val })} 
                                                  />
                                                  {item.operator === 'between' && (
                                                      <>
                                                          <span className="text-[10px] text-gray-400">至</span>
                                                          <MonthDayPicker 
                                                              value={item.thresholdEnd as string || '12-31'} 
                                                              onChange={(val) => updateTagValue(item.id, { thresholdEnd: val })} 
                                                          />
                                                      </>
                                                  )}
                                              </>
                                          ) : (
                                              <>
                                                  <input 
                                                      type="date"
                                                      value={item.threshold || ''}
                                                      onChange={(e) => updateTagValue(item.id, { threshold: e.target.value })}
                                                      className="p-0.5 text-[10px] border-b border-gray-200 bg-transparent outline-none focus:border-blue-500 w-24"
                                                  />
                                                  {item.operator === 'between' && (
                                                      <>
                                                          <span className="text-[10px] text-gray-400">至</span>
                                                          <input 
                                                              type="date"
                                                              value={item.thresholdEnd || ''}
                                                              onChange={(e) => updateTagValue(item.id, { thresholdEnd: e.target.value })}
                                                              className="p-0.5 text-[10px] border-b border-gray-200 bg-transparent outline-none focus:border-blue-500 w-24"
                                                          />
                                                      </>
                                                  )}
                                              </>
                                          )}
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1">
                                          <input 
                                              type="number"
                                              value={item.threshold || ''}
                                              onChange={(e) => updateTagValue(item.id, { threshold: Number(e.target.value) })}
                                              className="p-0.5 text-[10px] border-b border-gray-200 bg-transparent outline-none focus:border-blue-500 w-16 text-center"
                                          />
                                          {item.operator === 'between' && (
                                              <>
                                                  <span className="text-[10px] text-gray-400">至</span>
                                                  <input 
                                                      type="number"
                                                      value={item.thresholdEnd || ''}
                                                      onChange={(e) => updateTagValue(item.id, { thresholdEnd: Number(e.target.value) })}
                                                      className="p-0.5 text-[10px] border-b border-gray-200 bg-transparent outline-none focus:border-blue-500 w-16 text-center"
                                                  />
                                              </>
                                          )}
                                      </div>
                                  )}
                                  <span>时，将自动回答：</span>
                                </div>
                                <input 
                                  type="text" 
                                  defaultValue="请结合客户情况，提供分析" 
                                  className="w-full p-2 text-xs border border-gray-200 rounded bg-white outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <PathPreviewPlaceholder title="智能投放触发" label="示例" className="" contentClassName="mt-2 col-span-full" />
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{isEnabled ? '已开启' : '未开启'}</span>
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); toggleTransaction(transId); }}
                                        className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
           );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-border relative">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 px-4 pt-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-slate-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* === K: KNOWLEDGE TAB === */}
        {activeTab === '上传知识' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-700">已上传知识 (K)</h3>
                <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 text-xs">深度学习</span>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".doc,.docx,.xls,.xlsx,.pdf,.txt" 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50 transition-colors"
                >
                    本地上传 <ChevronDownIcon />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              AI小助手通过学习知识，可以准确的回答问题。支持 Word、Excel、PDF、TXT 格式。上传后自动进行切片与向量化处理。
            </p>
            <div className="space-y-4">
              {files.map((file) => (
                <div 
                    key={file.id} 
                    className="group flex items-center justify-between p-3 bg-white rounded border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                    title="点击预览文件内容"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="shrink-0 p-2 bg-blue-50 rounded">
                        {getFileIcon(file.type)}
                    </div>
                    <span className="text-sm text-slate-700 truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
                        {file.status === 'learning' ? (
                            <><LoaderIcon /><span className="text-xs text-blue-600 font-medium animate-pulse">解析中...</span></>
                        ) : (
                            <><CheckCircleIcon /><span className="text-xs text-slate-500">已完成</span></>
                        )}
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} className="text-gray-400 hover:text-blue-500" title="预览">
                             <EyeIcon />
                         </button>
                         <button className="text-gray-400 hover:text-blue-500" onClick={(e) => e.stopPropagation()}><EditIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}><TrashIcon /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
                    <div className="bg-white rounded-lg shadow-2xl w-[600px] h-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50 shrink-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {getFileIcon(previewFile.type)}
                                <span className="font-bold text-slate-700 truncate max-w-[400px]" title={previewFile.name}>{previewFile.name}</span>
                            </div>
                            <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="bg-white p-6 shadow-sm min-h-full rounded-sm border border-gray-200">
                                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                                    {ZODIAC_KNOWLEDGE_BASE[previewFile.id] || "该文件内容预览暂不可用。\n\n(仅支持预览系统预置的星座知识库文件)"}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </>
        )}

        {/* === D: DATA TAB === */}
        {activeTab === '引用数据' && (
          <>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-700">已配置数据源 (D)</h3>
               <button 
                onClick={() => setIsDataModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm transition-colors"
               >
                   <PlusIcon /> 添加数据
               </button>
            </div>
            
            <div className="space-y-6">
                {Object.keys(groupedData).length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-400">暂无引用数据，请点击上方按钮添加</p>
                    </div>
                )}

                {Object.entries(groupedData).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-1 border-l-2 border-blue-400">{category}</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {(items as DataField[]).map(field => (
                                <div key={field.id} className="relative group p-3 rounded border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`shrink-0 p-1.5 rounded mt-0.5 ${field.dataType !== 'value' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {field.dataType !== 'value' ? <CodeIcon /> : <TableIcon />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-800">{field.name}</span>
                                                    {field.dataType !== 'value' && (
                                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded border border-purple-200">
                                                            {field.dataType === 'list' ? 'List列表' : 'Object对象'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono bg-gray-50 px-1 rounded border border-gray-100">
                                                        {field.key}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>{field.sourceName}</span>
                                                </div>
                                                {field.description && (
                                                    <p className="text-xs text-slate-400 mt-1">{field.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        {onRemoveDataField && (
                                            <button 
                                                onClick={() => onRemoveDataField(field.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Modal */}
            <DataSelectorModal 
                isOpen={isDataModalOpen} 
                onClose={() => setIsDataModalOpen(false)}
                onAdd={(field) => {
                    if (onAddDataField) onAddDataField(field);
                }}
            />
          </>
        )}

        {/* === S: SKILL TAB === */}
        {activeTab === '嵌入插件' && (
          <>
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-700">已启用插件 (S)</h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
                插件（Skills）允许智能体调用特定的工具卡片或计算逻辑。
            </p>
            <div className="space-y-3">
                {skills.map(skill => (
                    <div key={skill.id} className={`flex items-center justify-between p-4 rounded border transition-all ${skill.selected ? 'border-blue-500 bg-white shadow-sm ring-1 ring-blue-500/20' : 'border-gray-200 bg-slate-50 opacity-80'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${skill.selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                {skill.iconType === 'chart' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                                {skill.iconType === 'calc' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                                {skill.iconType === 'card' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{skill.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name={`toggle-${skill.id}`} 
                                id={`toggle-${skill.id}`} 
                                checked={skill.selected}
                                onChange={() => onToggleSkill(skill.id)}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-blue-600"
                            />
                            <label htmlFor={`toggle-${skill.id}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${skill.selected ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}

        {/* === ENVIRONMENT TAB === */}
        {activeTab === '环境感知' && (
          <>
            <div className="flex items-center gap-4 mb-6 border-b border-gray-100">
              <button 
                onClick={() => setEnvSubTab('example')}
                className={`pb-2 text-sm font-medium transition-colors relative ${envSubTab === 'example' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                示例问
                {envSubTab === 'example' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setEnvSubTab('guess')}
                className={`pb-2 text-sm font-medium transition-colors relative ${envSubTab === 'guess' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                猜你想问
                {envSubTab === 'guess' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setEnvSubTab('transaction')}
                className={`pb-2 text-sm font-medium transition-colors relative ${envSubTab === 'transaction' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                事务配置
                {envSubTab === 'transaction' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            </div>

            {envSubTab === 'transaction' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs text-gray-400 mb-4">
                  小助可以根据您配置的专案/商机/数据库/标签，感知用户的操作，自动触发回答
                </p>
                {renderTransactions()}
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">什么是环境感知？</h4>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        当客户经理在 W+ 工作台操作时，小助能感知当前所在的页面（如客户全景视图、产品超市）和上下文，从而自动触发并提供辅助。
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">触发页面</label>
                        <select 
                            value={envConfig.triggerPage}
                            onChange={(e) => onUpdateEnvConfig('triggerPage', e.target.value)}
                            className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>W+客户全景视图 (Client 360)</option>
                            <option>W+产品超市 (Wealth Market)</option>
                            <option>W+信贷审批流 (Credit Flow)</option>
                            <option>全局 (Global Sidebar)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">投放栏位</label>
                        <select 
                            value={envConfig.displaySlot}
                            onChange={(e) => onUpdateEnvConfig('displaySlot', e.target.value)}
                            className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>右侧智能助手栏</option>
                            <option>页面浮窗 (Floating Bubble)</option>
                            <option>顶部通知栏 (Top Banner)</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked className="text-blue-600 rounded" readOnly />
                            开启自动唤醒 (当检测到高潜客户时)
                        </label>
                    </div>
                </div>
              </>
            )}
          </>
        )}
        
        {activeTab === '高级配置' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <SettingsIcon />
                  高级模型参数
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                    这些设置将直接影响智能体的回答风格和推理深度。非专业人士建议保持默认。
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">推理模型 (Model)</label>
                    <select 
                        value={config.model || 'gemini-3-flash-preview'}
                        onChange={(e) => onUpdateConfig('model', e.target.value)}
                        className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="gemini-3-flash-preview">Gemini 3 Flash (推荐 - 响应快)</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (深度推理 - 逻辑强)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            温度 (Temperature)
                            <span className="ml-2 text-[10px] text-gray-400 font-normal">{config.temperature ?? 0.7}</span>
                        </label>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1"
                            value={config.temperature ?? 0.7}
                            onChange={(e) => onUpdateConfig('temperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>严谨</span>
                            <span>创造</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            最大长度 (Max Tokens)
                            <span className="ml-2 text-[10px] text-gray-400 font-normal">{config.maxTokens ?? 2048}</span>
                        </label>
                        <select 
                            value={config.maxTokens ?? 2048}
                            onChange={(e) => onUpdateConfig('maxTokens', parseInt(e.target.value))}
                            className="w-full p-2 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={1024}>1024</option>
                            <option value={2048}>2048</option>
                            <option value={4096}>4096</option>
                            <option value={8192}>8192</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Google 搜索增强 (Grounding)</label>
                            <p className="text-[10px] text-gray-400">允许模型访问实时互联网信息以增强回答</p>
                        </div>
                        <div 
                            onClick={() => onUpdateConfig('searchGrounding', !config.searchGrounding)}
                            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${config.searchGrounding ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${config.searchGrounding ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-slate-700">深度思考模式 (Deep Thinking)</label>
                            <p className="text-[10px] text-gray-400">展示模型的推理过程，增加透明度</p>
                        </div>
                        <div className="w-10 h-5 rounded-full p-0.5 bg-blue-600 cursor-not-allowed opacity-50">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm translate-x-5" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePanel;