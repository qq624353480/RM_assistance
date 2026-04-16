import React, { useState, useEffect } from 'react';
import AgentDashboard from './components/AgentDashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import TechFrameworkModal from './components/TechFrameworkModal';
import { AgentSummary } from './types';
import { INITIAL_AGENT_LIST } from './constants';
import { LayersIcon } from './components/Icons';

const GLOBAL_LIST_KEY = 'rm_agent_global_list';

const App: React.FC = () => {
  // === Global State: List of Agents ===
  const [agents, setAgents] = useState<AgentSummary[]>(() => {
      try {
          const saved = localStorage.getItem(GLOBAL_LIST_KEY);
          return saved ? JSON.parse(saved) : INITIAL_AGENT_LIST;
      } catch (e) {
          return INITIAL_AGENT_LIST;
      }
  });

  // === Routing State ===
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // === Modal State ===
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);

  // Persistence for Agent List
  useEffect(() => {
      localStorage.setItem(GLOBAL_LIST_KEY, JSON.stringify(agents));
  }, [agents]);

  // Handlers
  const handleCreateAgent = () => {
      const newAgent: AgentSummary = {
          id: `agent_${Date.now()}`,
          name: '未命名智能体',
          description: '这是一个全新的智能体，请配置它的能力...',
          updatedAt: Date.now(),
          status: 'draft',
          tags: ['新创建'],
          avatarColor: 'bg-gray-500',
          ownerId: 'default_user'
      };
      setAgents([newAgent, ...agents]);
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定要删除这个智能体吗？所有相关配置和知识库将被永久删除。')) {
          setAgents(prev => prev.filter(a => a.id !== id));
          localStorage.removeItem(`rm_agent_data_${id}`);
      }
  };

  const handleSelectAgent = (id: string) => {
      setSelectedAgentId(id);
  };

  const handleBackToDashboard = () => {
      setSelectedAgentId(null);
      if (selectedAgentId) {
          setAgents(prev => prev.map(a => 
              a.id === selectedAgentId ? { ...a, updatedAt: Date.now() } : a
          ));
      }
  };

  if (selectedAgentId) {
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      if (!selectedAgent) {
          setSelectedAgentId(null); 
          return null;
      }
      return (
          <AgentOrchestrator 
              agentId={selectedAgent.id} 
              agentName={selectedAgent.name}
              onBack={handleBackToDashboard} 
          />
      );
  }

  return (
      <div className="relative">
          <AgentDashboard 
              agents={agents}
              userProfile={{ uid: 'default_user', role: 'USER', status: 'approved' }}
              onCreateAgent={handleCreateAgent}
              onSelectAgent={handleSelectAgent}
              onDeleteAgent={handleDeleteAgent}
          />

          {/* Floating Button (Only on Dashboard) */}
          <button
              onClick={() => setIsFrameworkModalOpen(true)}
              className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
              <LayersIcon className="w-5 h-5" />
              <span className="font-medium text-sm">技术方案框架</span>
          </button>

          {/* Framework Modal */}
          <TechFrameworkModal 
              isOpen={isFrameworkModalOpen} 
              onClose={() => setIsFrameworkModalOpen(false)} 
          />
      </div>
  );
};

export default App;
