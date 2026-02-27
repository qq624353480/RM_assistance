import React, { useRef, useState } from 'react';
import { FileItem, DataField, Skill, EnvConfig } from '../types';
import { WordIcon, ExcelIcon, PdfIcon, TxtIcon, CheckCircleIcon, LoaderIcon, TrashIcon, EditIcon, ChevronDownIcon, SettingsIcon, PlusIcon, CodeIcon, TableIcon, EyeIcon } from './Icons';
import DataSelectorModal from './DataSelectorModal';
import { ZODIAC_KNOWLEDGE_BASE } from '../knowledge_data';

interface KnowledgePanelProps {
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
}

const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ 
  files, onUpload, onDelete,
  dataFields, onRemoveDataField, onAddDataField,
  skills, onToggleSkill,
  envConfig, onUpdateEnvConfig
}) => {
  const tabs = ['上传知识', '引用数据', '嵌入插件', '环境感知', '高级配置'];
  const [activeTab, setActiveTab] = useState('上传知识');
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
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-700">环境感知配置</h3>
            </div>
            
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
        
        {activeTab === '高级配置' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <div className="p-4 bg-gray-50 rounded-full mb-3">
               <SettingsIcon /> 
             </div>
             <p className="text-sm">高级参数配置开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgePanel;