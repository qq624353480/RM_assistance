import React, { useState, useEffect } from 'react';
import AgentDashboard from './components/AgentDashboard';
import AgentOrchestrator from './components/AgentOrchestrator';
import { AgentSummary } from './types';
import { INITIAL_AGENT_LIST } from './constants';

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
          avatarColor: 'bg-gray-500' // Default
      };
      setAgents([newAgent, ...agents]);
      // Optional: Auto-select newly created agent
      // setSelectedAgentId(newAgent.id); 
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定要删除这个智能体吗？所有相关配置和知识库将被永久删除。')) {
          setAgents(prev => prev.filter(a => a.id !== id));
          // Clean up local storage for that agent
          localStorage.removeItem(`rm_agent_data_${id}`);
      }
  };

  const handleSelectAgent = (id: string) => {
      setSelectedAgentId(id);
  };

  const handleBackToDashboard = () => {
      setSelectedAgentId(null);
      // Refresh list timestamp for the agent we just edited
      if (selectedAgentId) {
          setAgents(prev => prev.map(a => 
              a.id === selectedAgentId ? { ...a, updatedAt: Date.now() } : a
          ));
      }
  };

  // Render Logic
  if (selectedAgentId) {
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      if (!selectedAgent) {
          setSelectedAgentId(null); // Fallback if agent not found
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
      <AgentDashboard 
          agents={agents}
          onCreateAgent={handleCreateAgent}
          onSelectAgent={handleSelectAgent}
          onDeleteAgent={handleDeleteAgent}
      />
  );
};

export default App;
