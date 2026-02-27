
import React, { useState, useEffect } from 'react';
import AgentConfigPanel from './AgentConfigPanel';
import KnowledgePanel from './KnowledgePanel';
import PreviewChat from './PreviewChat';
import VersionSelector from './VersionSelector';
import AgentReadinessIndicator from './AgentReadinessIndicator';
import EvaluationReportModal from './EvaluationReportModal';
import { AgentConfig, FileItem, DataField, Skill, EnvConfig, Version, AppState, ChatMessage, EvaluationResult } from '../types';
import { LoaderIcon, TrashIcon, ArrowLeftIcon } from './Icons';
import { INITIAL_CONFIG, MOCK_FILES, MOCK_CHAT_HISTORY, INITIAL_DATA_FIELDS, INITIAL_SKILLS, INITIAL_ENV_CONFIG } from '../constants';
import { calculateStaticScore } from '../services/evaluationService';

// Props for the Orchestrator
interface AgentOrchestratorProps {
    agentId: string;
    agentName: string; // Passed from dashboard for display
    onBack: () => void; // Function to go back to dashboard
}

const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ agentId, agentName, onBack }) => {
  // Key for local storage specific to this agent
  const STORAGE_KEY = `rm_agent_data_${agentId}`;

  // Helper to load initial state or default to constants
  const loadInitialState = (): AppState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
    return null;
  };

  const savedState = loadInitialState();

  // Initialize state with saved data OR default constants
  // Note: We override the name in INITIAL_CONFIG with the agentName passed from dashboard if it's a fresh init
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(
      savedState?.agentConfig || { ...INITIAL_CONFIG, name: agentName }
  );
  const [files, setFiles] = useState<FileItem[]>(savedState?.files || MOCK_FILES);
  const [dataFields, setDataFields] = useState<DataField[]>(savedState?.dataFields || INITIAL_DATA_FIELDS);
  const [skills, setSkills] = useState<Skill[]>(savedState?.skills || INITIAL_SKILLS);
  const [envConfig, setEnvConfig] = useState<EnvConfig>(savedState?.envConfig || INITIAL_ENV_CONFIG);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [versions, setVersions] = useState<Version[]>(savedState?.versions || []);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | undefined>(undefined);
  
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [isVersionSelectorOpen, setIsVersionSelectorOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persistence Effect (Do not persist chatHistory or evaluationResult)
  useEffect(() => {
    const stateToSave: AppState = {
      agentConfig,
      files,
      dataFields,
      skills,
      envConfig,
      chatHistory: [], // Never save chat history
      versions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [agentConfig, files, dataFields, skills, envConfig, versions, STORAGE_KEY]);

  // Handlers (Same as before)
  const handleConfigChange = (key: keyof AgentConfig, value: string) => {
    setAgentConfig((prev) => ({ ...prev, [key]: value }));
    if (currentVersionId) setCurrentVersionId(null);
  };

  const handleFileUpload = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: FileItem['type'] = 'word';
    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') type = 'excel';
    else if (extension === 'pdf') type = 'pdf';
    else if (extension === 'txt') type = 'txt';

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type,
      status: 'learning'
    };

    setFiles(prev => [newFile, ...prev]);
    if (currentVersionId) setCurrentVersionId(null);

    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: 'completed' } : f
      ));
    }, 2500);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (currentVersionId) setCurrentVersionId(null);
  };

  const handleAddDataField = (field: DataField) => {
    setDataFields(prev => [...prev, field]);
    if (currentVersionId) setCurrentVersionId(null);
  };

  const handleRemoveDataField = (id: string) => {
    setDataFields(prev => prev.filter(item => item.id !== id));
    if (currentVersionId) setCurrentVersionId(null);
  };

  const toggleSkill = (id: string) => {
    setSkills(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    if (currentVersionId) setCurrentVersionId(null);
  };
  
  const handleSkillUpdate = (skillId: string, updates: Partial<Skill>) => {
    setSkills(prev => prev.map(item => item.id === skillId ? { ...item, ...updates } : item));
    if (currentVersionId) setCurrentVersionId(null);
  };

  const updateEnvConfig = (key: keyof EnvConfig, value: string) => {
    setEnvConfig(prev => ({ ...prev, [key]: value }));
    if (currentVersionId) setCurrentVersionId(null);
  };

  const regenerateSkillsLogic = (currentSkills: Skill[]) => {
    return currentSkills.map(skill => {
        // ... (Logic from App.tsx - Simplified for brevity as logic remains same)
        // In a real app, this logic generator would be a utility function
        let code = `/** SOP: ${skill.name} */\nasync function execute_${skill.id.split('-')[0].replace(/\s+/g,'_').toLowerCase()}(context) {\n`;
        code += `  // Generated logic based on config...\n  return { skill: '${skill.name}', instruction: 'Auto-generated instruction' };\n}`;
        // Note: For this demo, we are keeping existing SOPs unless explicitly changed, 
        // but typically you'd run the full generation logic here.
        // For now, let's just keep the existing logic to prevent overwriting with dummy code
        return skill; 
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // In a real scenario, we might regenerate logic here.
    // For now, we trust the state.
    
    const snapshot: Omit<AppState, 'versions'> = {
        agentConfig,
        files,
        dataFields,
        skills,
        envConfig,
        chatHistory
    };

    setTimeout(() => {
        const newVersion: Version = {
            id: Date.now().toString(),
            label: `v${versions.length + 1}.0`,
            timestamp: Date.now(),
            data: snapshot
        };

        setVersions(prev => [newVersion, ...prev]);
        setCurrentVersionId(newVersion.id);
        setIsSaving(false);
        
        setChatHistory(prev => [...prev, {
             id: Date.now().toString(),
             role: 'assistant',
             content: `版本 v${versions.length + 1}.0 已保存。\n已同步至云端。`
        }]);

    }, 800);
  };

  const handleRestoreVersion = (version: Version) => {
      setAgentConfig(version.data.agentConfig);
      setFiles(version.data.files);
      setDataFields(version.data.dataFields);
      setSkills(version.data.skills);
      setEnvConfig(version.data.envConfig);
      setChatHistory([]); // Clear chat history on restore
      setEvaluationResult(undefined); // Clear evaluation on restore
      setCurrentVersionId(version.id);
      setIsVersionSelectorOpen(false);
  };

  const handleResetData = () => {
    if (confirm('确定要重置当前智能体的所有数据吗？')) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
  };

  const getCurrentVersionLabel = () => {
    if (!currentVersionId) return '草稿版 (自动保存)';
    const v = versions.find(v => v.id === currentVersionId);
    return v ? `${v.label} (已保存)` : '未知版本';
  };

  return (
    <div className="h-screen flex flex-col bg-background text-slate-900 font-sans overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors pr-3 border-r border-gray-200"
          >
             <ArrowLeftIcon />
             <span className="text-sm font-medium">返回列表</span>
          </button>

          <div className="flex items-center text-slate-700 font-bold text-sm">
            {agentConfig.name}
          </div>
          
          <div className="relative">
             <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded transition-colors ${currentVersionId ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {getCurrentVersionLabel()}
                </span>
                <button 
                    onClick={() => setIsVersionSelectorOpen(!isVersionSelectorOpen)}
                    className="text-xs text-blue-600 cursor-pointer hover:underline flex items-center gap-1"
                >
                    版本切换
                    <svg className={`w-3 h-3 transition-transform ${isVersionSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
             </div>
             
             <VersionSelector 
                isOpen={isVersionSelectorOpen}
                onClose={() => setIsVersionSelectorOpen(false)}
                versions={versions}
                currentVersionId={currentVersionId}
                onSelectVersion={handleRestoreVersion}
             />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AgentReadinessIndicator 
            config={agentConfig}
            files={files}
            skills={skills}
            envConfig={envConfig}
            dataFields={dataFields}
            chatHistory={chatHistory}
            evaluationResult={evaluationResult}
            onEvaluationComplete={setEvaluationResult}
            onShowReport={() => setIsReportModalOpen(true)}
          />
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm border border-gray-300 rounded px-4 py-1.5 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2"
          >
            {isSaving ? <LoaderIcon /> : '保存版本'}
          </button>
          <button className="text-sm bg-blue-600 text-white rounded px-4 py-1.5 hover:bg-blue-700 shadow-sm transition-colors shadow-blue-200">发布</button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-12 min-h-0">
        <div className="col-span-4 min-w-[300px] h-full overflow-hidden">
          <AgentConfigPanel 
            config={agentConfig} 
            skills={skills} 
            onChange={handleConfigChange} 
            onSkillUpdate={handleSkillUpdate}
          />
        </div>

        <div className="col-span-4 h-full overflow-hidden">
          <KnowledgePanel 
            files={files} 
            onUpload={handleFileUpload}
            onDelete={handleDeleteFile}
            dataFields={dataFields}
            onRemoveDataField={handleRemoveDataField}
            onAddDataField={handleAddDataField}
            skills={skills}
            onToggleSkill={toggleSkill}
            envConfig={envConfig}
            onUpdateEnvConfig={updateEnvConfig}
          />
        </div>

        <div className="col-span-4 min-w-[350px] h-full overflow-hidden">
           <PreviewChat 
             chatHistory={chatHistory} 
             onUpdateHistory={setChatHistory}
             agentConfig={agentConfig}
             activeFiles={files}
             activeDataFields={dataFields}
             skills={skills} 
           />
        </div>
      </div>

      <EvaluationReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={evaluationResult || null}
        staticScore={calculateStaticScore(agentConfig, files, skills, envConfig, dataFields).score}
        staticTips={calculateStaticScore(agentConfig, files, skills, envConfig, dataFields).tips}
      />
    </div>
  );
};

export default AgentOrchestrator;
