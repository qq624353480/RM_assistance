import React from 'react';
import { AgentSummary } from '../types';
import { PlusIcon, UserGroupIcon, ClockIcon, MoreVerticalIcon, DatabaseIcon, TrashIcon } from './Icons';

interface AgentDashboardProps {
  agents: AgentSummary[];
  onCreateAgent: () => void;
  onSelectAgent: (id: string) => void;
  onDeleteAgent: (id: string, e: React.MouseEvent) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ 
  agents, 
  onCreateAgent, 
  onSelectAgent,
  onDeleteAgent
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
             <UserGroupIcon />
          </div>
          <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">RM小助智能体平台</h1>
              <span className="text-[10px] text-gray-500 font-medium">RM AI AGENT PLATFORM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-700">总行财富平台部</div>
                <div className="text-[10px] text-gray-400">Admin</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">我的智能体</h2>
                <p className="text-sm text-slate-500">
                    已创建 {agents.length} 个智能体，{agents.filter(a => a.status === 'published').length} 个已发布
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="搜索智能体..." 
                        className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 shadow-sm"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <select className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer">
                    <option>所有状态</option>
                    <option>已发布</option>
                    <option>草稿</option>
                </select>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Create New Card */}
            <div 
                onClick={onCreateAgent}
                className="group h-[240px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-200"
            >
                <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-500 flex items-center justify-center mb-4 transition-colors">
                    <PlusIcon />
                </div>
                <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">新建智能体</span>
                <span className="text-xs text-gray-400 mt-1">从零开始或基于模板</span>
            </div>

            {/* Agent Cards */}
            {agents.map(agent => (
                <div 
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className="h-[240px] bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col cursor-pointer relative group"
                >
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        agent.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {agent.status === 'published' ? '已发布' : '草稿'}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className={`w-12 h-12 rounded-lg ${agent.avatarColor} text-white flex items-center justify-center text-lg font-bold mb-4 shadow-sm`}>
                            {agent.name.charAt(0)}
                        </div>
                        
                        <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1" title={agent.name}>
                            {agent.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                            {agent.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {agent.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded border border-gray-200">
                                    {tag}
                                </span>
                            ))}
                            {agent.tags.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100">
                                    +{agent.tags.length - 2}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="h-12 border-t border-gray-100 px-6 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <ClockIcon />
                            <span>{new Date(agent.updatedAt).toLocaleDateString()} 更新</span>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => onDeleteAgent(agent.id, e)}
                                className="p-1.5 hover:bg-white hover:text-red-500 text-gray-400 rounded transition-colors shadow-sm hover:shadow"
                                title="删除"
                             >
                                 <TrashIcon />
                             </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;