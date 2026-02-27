import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AgentConfig, FileItem, DataField, TraceStep, MockCustomer, Skill } from '../types';
import { BotAvatar, ChevronDownIcon, SendIcon, SettingsIcon, LoaderIcon, TrashIcon } from './Icons';
import { MOCK_CUSTOMERS } from '../constants';
import { ZODIAC_KNOWLEDGE_BASE } from '../knowledge_data';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewChatProps {
  chatHistory: ChatMessage[];
  onUpdateHistory: (newHistory: ChatMessage[]) => void;
  agentConfig?: AgentConfig;
  activeFiles?: FileItem[];
  activeDataFields?: DataField[];
  skills?: Skill[]; 
}

// === Smart Extraction Helper ===
const extractScenarioPrompt = (fullInstructions: string, skillName: string) => {
    if (!fullInstructions) return "";
    const cleanName = skillName.split(' (')[0].trim();
    const rolePart = fullInstructions.split('# Response Frameworks')[0] || "";
    const formatPart = fullInstructions.match(/#\s*Format[\s\S]*/) ? fullInstructions.match(/#\s*Format[\s\S]*/)[0] : "";
    const scenes = fullInstructions.split(/场景[一二三四五六七八九十\d]：/);
    const matchedScene = scenes.find(s => s.includes(cleanName));
    if (matchedScene) {
        const skillOnly = matchedScene.split('# Format')[0].trim();
        return `${rolePart.trim()}\n\n## 当前执行场景要求：\n${skillOnly}\n\n${formatPart.trim()}`;
    }
    return fullInstructions;
};

const TraceDetailModal = ({ isOpen, onClose, title, type, content }: { isOpen: boolean; onClose: () => void; title: string; type: string; content: string }) => {
    if (!isOpen) return null;
    let displayContent = content;
    try { if (content.trim().startsWith('{') || content.trim().startsWith('[')) displayContent = JSON.stringify(JSON.parse(content), null, 2); } catch (e) {}
    const isPrompt = type === 'P';
    const badgeStyle = isPrompt ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200';
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
                <div className="h-12 border-b border-gray-100 flex items-center justify-between px-5 bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono shadow-sm ${badgeStyle}`}>[{type}]</span>
                        <span className="font-bold text-slate-700 text-sm truncate max-w-[400px]">{title}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-white relative"><pre className="p-5 text-xs font-mono text-slate-600 leading-relaxed whitespace-pre-wrap break-all">{displayContent}</pre></div>
            </div>
        </div>
    );
};

const FKDSTraceItem: React.FC<{ type: string; content: string; onClick: () => void }> = ({ type, content, onClick }) => {
    const getLabel = (t: string) => {
        const grayStyle = { color: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:border-gray-300' };
        switch(t) {
            case 'F': return { text: 'Framework', ...grayStyle };
            case 'K': return { text: 'Knowledge', ...grayStyle };
            case 'D': return { text: 'Data', ...grayStyle };
            case 'S': return { text: 'Skill', ...grayStyle };
            case 'P': return { text: 'PROMPT', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' };
            default: return { text: 'Info', ...grayStyle };
        }
    };
    const style = getLabel(type);
    const previewText = content.length > 60 ? content.substring(0, 60).replace(/\n/g, ' ') + "..." : content.replace(/\n/g, ' ');
    return (
        <div className="flex items-center gap-2 mt-1.5 group cursor-pointer" onClick={onClick}>
            <span className={`text-[9px] h-5 px-1.5 flex items-center justify-center rounded border ${style.color} font-mono font-bold shrink-0 min-w-[64px] shadow-sm transition-all`}>{style.text}</span>
            <span className="text-[10px] text-slate-500 font-mono truncate border-b border-transparent group-hover:border-blue-300 group-hover:text-blue-600 transition-all max-w-[280px]">{previewText}</span>
        </div>
    );
}

const PreviewChat: React.FC<PreviewChatProps> = ({ chatHistory, onUpdateHistory, agentConfig, activeFiles = [], activeDataFields = [], skills = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTraceItem, setSelectedTraceItem] = useState<{type: string, content: string, title: string} | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<MockCustomer>(MOCK_CUSTOMERS[0]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chatHistory, isGenerating]); 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) setIsCustomerDropdownOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCustomerData = (key: string) => selectedCustomer.data[key] || '';

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
    const currentHistoryWithUser = [...chatHistory, userMsg];
    onUpdateHistory(currentHistoryWithUser);
    setInputValue('');
    setIsGenerating(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialTraces: TraceStep[] = [
        { title: '意图路由 (Router)', type: 'router', status: 'pending', items: [] },
        { title: '准备阶段 (Preparation)', type: 'code', status: 'pending', items: [] },
        { title: 'LLM 最终生成', type: 'prompt', status: 'pending', items: [] }
    ];
    const botMsg: ChatMessage = { id: botMsgId, role: 'assistant', content: '', thinking: '正在启动思维链...', trace: initialTraces };
    const historyWithBot = [...currentHistoryWithUser, botMsg];
    onUpdateHistory(historyWithBot);

    let localHistory = historyWithBot;
    const updateLocalAndParent = (newHist: ChatMessage[]) => { localHistory = newHist; onUpdateHistory(newHist); };
    const updateBotMsgInLocal = (updates: Partial<ChatMessage>) => { const updated = localHistory.map(m => m.id === botMsgId ? { ...m, ...updates } : m); updateLocalAndParent(updated); };
    const updateTraceInLocal = (stepIdx: number, stepUpdates: Partial<TraceStep>) => {
        const updated = localHistory.map(m => {
            if (m.id !== botMsgId) return m;
            const tr = [...(m.trace || [])];
            if (tr[stepIdx]) tr[stepIdx] = { ...tr[stepIdx], ...stepUpdates };
            return { ...m, trace: tr };
        });
        updateLocalAndParent(updated);
    };

    try {
        const tRouterStart = performance.now();
        updateTraceInLocal(0, { status: 'processing' });
        await new Promise(resolve => setTimeout(resolve, 600)); 

        let matchedSkill = skills.find(s => s.selected && s.triggerKeywords?.some(kw => inputValue.includes(kw)));
        if (!matchedSkill) {
            if (inputValue.includes("推荐") || inputValue.includes("买")) matchedSkill = skills.find(s => s.name.includes("推荐"));
            else if (inputValue.includes("行外") || inputValue.includes("支付宝") || inputValue.includes("微信")) matchedSkill = skills.find(s => s.name.includes("行外") || s.name.includes("吸金"));
        }

        const isGeneralChat = !matchedSkill;
        const skillName = matchedSkill ? matchedSkill.name : '通用对话 (General Chat)';
        updateTraceInLocal(0, { status: 'success', items: [`[D] User Input: "${inputValue}"`, `[S] Routed To: ${skillName}`], cost: `${Math.round(performance.now() - tRouterStart)}ms` });

        updateTraceInLocal(1, { title: isGeneralChat ? 'SOP 跳过' : `准备阶段: ${skillName}`, status: 'processing' });
        updateBotMsgInLocal({ thinking: isGeneralChat ? '未命中特定技能，准备通用回复...' : `调用 Skill [${skillName}] 执行业务逻辑...` });
        await new Promise(resolve => setTimeout(resolve, 800)); 

        let contextLog: string[] = [];
        let assembledContext = {}; 

        if (matchedSkill && matchedSkill.name.includes("持仓分析")) {
             const holdingsRaw = getCustomerData('holdings_list_full');
             const holdingNames: string[] = [];
             const nameRegex = /名称[:"']{1,2}([^"',}]+)/g;
             let match;
             while ((match = nameRegex.exec(holdingsRaw)) !== null) holdingNames.push(match[1]);
             const problemListContent = ZODIAC_KNOWLEDGE_BASE['global_problem_list'] || "";
             const problemChunks = problemListContent.split(/\n\d+\.\s/);
             const hits = problemChunks.filter(chunk => holdingNames.some(name => chunk.includes(name)));
             const matchedRiskInfo = hits.join("\n\n");
             contextLog = [`[D] 引用数据: ${holdingsRaw}`, `[K] 知识检索: ${matchedRiskInfo ? matchedRiskInfo : "无风险命中 (Safe)"}`, `[F] 动态框架: ${hits.length > 0 ? "策略: 风险警示模式" : "策略: 肯定模式"}`];
             assembledContext = { task: 'HOLDINGS_ANALYSIS', data: { risk_count: hits.length, holdings_summary: holdingsRaw }, knowledge: matchedRiskInfo ? `Risk Details:\n${matchedRiskInfo}` : "No risks found." };
        } else if (matchedSkill && matchedSkill.name.includes("推荐")) {
             const riskGrade = getCustomerData('risk_grade');
             const zodiacSign = getCustomerData('zodiac_sign');
             const zodiacId = getCustomerData('zodiac_id');
             const zodiacGuide = ZODIAC_KNOWLEDGE_BASE[zodiacId] || ZODIAC_KNOWLEDGE_BASE['z_capricorn'];
             const productPoolText = ZODIAC_KNOWLEDGE_BASE['product_pool_q3'] || "";
             let allowedRisks = ['R1'];
             if (riskGrade.includes('A2') || riskGrade.includes('稳健')) allowedRisks = ['R1', 'R2'];
             if (riskGrade.includes('A3') || riskGrade.includes('平衡')) allowedRisks = ['R1', 'R2', 'R3'];
             const lines = productPoolText.split('\n');
             const validProducts = lines.filter(line => { const match = line.match(/\[风险等级: (R\d)\]/); return match ? allowedRisks.includes(match[1]) : false; });
             contextLog = [`[D] 引用数据: 风险等级=${riskGrade}, 星座=${zodiacSign}`, `[K] 知识检索 (话术): 《${zodiacSign}沟通秘籍》...`, `[K] 知识检索 (产品): 筛选出 ${validProducts.length} 个合规产品`, `[F] 动态框架: "必须从 valid_product_list 中推荐..."` ];
             assembledContext = { task: 'PRODUCT_RECOMMENDATION', data: { risk_grade: riskGrade, zodiac: zodiacSign }, knowledge: { valid_product_list: validProducts.join('\n'), communication_style: zodiacGuide } };
        } else {
             contextLog = [`[F] Framework: General Chat Mode`, `[K] Knowledge: None loaded`];
             assembledContext = { task: 'GENERAL_CHAT' };
        }

        updateTraceInLocal(1, { status: 'success', items: contextLog, cost: '42ms' });
        updateTraceInLocal(2, { status: 'processing' });
        updateBotMsgInLocal({ thinking: `平台已自动拆解回答框架，正在调用大模型生成...` });

        const dynamicModularPrompt = extractScenarioPrompt(agentConfig?.instructions || "", skillName);
        const finalPrompt = `
${dynamicModularPrompt}

---
### SOP EXECUTED CONTEXT (Silently injected by Platform)
${JSON.stringify(assembledContext, null, 2)}

---
### USER INPUT
${inputValue}

**Instruction:** 1. Think in <thinking> tags. 2. Final response outside tags.
`;
        
        updateTraceInLocal(2, { items: [`[P] ${finalPrompt}`] });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseStream = await ai.models.generateContentStream({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ text: finalPrompt }] }], });

        let fullText = '';
        for await (const chunk of responseStream) {
            fullText += chunk.text || "";
            let thinkingPart = '', contentPart = '';
            const thinkingMatch = fullText.match(/<thinking>([\s\S]*?)<\/thinking>/i);
            const thinkingEndIndex = fullText.indexOf('</thinking>');
            if (thinkingMatch) { thinkingPart = thinkingMatch[1].trim(); if (thinkingEndIndex !== -1) contentPart = fullText.substring(thinkingEndIndex + 11).trim(); }
            else if (fullText.includes('<thinking>')) thinkingPart = fullText.replace('<thinking>', '').trim();
            else contentPart = fullText;
            updateBotMsgInLocal({ content: contentPart, thinking: thinkingPart });
        }
        updateTraceInLocal(2, { status: 'success', cost: '1.2s' });

    } catch (error) { updateBotMsgInLocal({ content: "抱歉，系统生成失败。", thinking: "Error" }); } finally { setIsGenerating(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend(); };
  const getTraceStepStyles = (type: TraceStep['type'], status: TraceStep['status']) => {
    if (type === 'router') return status === 'success' ? { border: 'border-purple-200', dot: 'bg-purple-500', title: 'text-purple-700 font-bold', cost: 'text-gray-400' } : { border: 'border-gray-100', dot: 'bg-gray-200', title: 'text-gray-300', cost: 'hidden' };
    if (type === 'code') return status === 'success' ? { border: 'border-emerald-200', dot: 'bg-emerald-500', title: 'text-emerald-700 font-bold', cost: 'text-gray-400' } : { border: 'border-gray-100', dot: 'bg-gray-200', title: 'text-gray-300', cost: 'hidden' };
    return status === 'success' ? { border: 'border-blue-200', dot: 'bg-blue-500', title: 'text-blue-700 font-bold', cost: 'text-gray-400' } : { border: 'border-blue-100', dot: 'bg-blue-500 animate-pulse', title: 'text-blue-600', cost: '' };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {selectedTraceItem && <TraceDetailModal isOpen={!!selectedTraceItem} onClose={() => setSelectedTraceItem(null)} title={selectedTraceItem.title} type={selectedTraceItem.type} content={selectedTraceItem.content}/>}
      
      {/* Top Header */}
      <div className="h-12 border-b border-border bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>调试预览</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </div>
        <button onClick={() => onUpdateHistory([])} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all" title="清空聊天">
            <TrashIcon />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar" ref={scrollRef}>
        <div className="flex justify-center">
            <div className="bg-white/70 px-4 py-1.5 rounded-full text-[11px] text-gray-500 flex items-center gap-2 border border-gray-100 shadow-sm backdrop-blur-sm">
                当前模拟客户：<span className="font-bold text-slate-700">{selectedCustomer.name}</span>
            </div>
        </div>

        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
            <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[92%] gap-3`}>
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                    {msg.role === 'assistant' ? (
                        <BotAvatar />
                    ) : (
                        <div className={`w-8 h-8 rounded-full ${selectedCustomer.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white`}>
                            {selectedCustomer.name.charAt(0)}
                        </div>
                    )}
                </div>
                
                {/* Bubble Container */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className={`
                        relative px-4 py-3 rounded-2xl shadow-sm text-[14px] leading-relaxed break-words
                        ${msg.role === 'user' 
                            ? 'bg-[#1677ff] text-white rounded-tr-none shadow-blue-100' 
                            : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none shadow-card'}
                    `}>
                        {/* FKDS Trace (Inside Bot Bubble) */}
                        {msg.role === 'assistant' && msg.trace && (
                            <div className="mb-4 bg-slate-50/50 rounded-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gray-100/50 px-3 py-1.5 text-[10px] font-bold text-slate-500 border-b border-gray-100 flex justify-between uppercase tracking-wider">
                                    <span>Execution Trace</span>
                                    <span className="font-mono text-gray-400">{msg.trace.every(t => t.status !== 'processing') ? 'Success' : 'Processing...'}</span>
                                </div>
                                <div className="p-3 space-y-4">
                                    {msg.trace.map((step, idx) => {
                                        const styles = getTraceStepStyles(step.type, step.status);
                                        return (
                                            <div key={idx} className={`relative pl-4 border-l-2 transition-colors duration-300 ${styles.border}`}>
                                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-2 transition-all duration-300 ${styles.dot}`}></div>
                                                <div className="flex justify-between items-start mb-1"><span className={`text-[11px] ${styles.title}`}>{step.title}</span>{step.cost && <span className="text-[10px] font-mono text-gray-400">{step.cost}</span>}</div>
                                                {step.items.map((item, i) => {
                                                    const typeMatch = item.match(/^\[([FKDSP])\]\s*([\s\S]*)/); 
                                                    if (typeMatch) return <FKDSTraceItem key={i} type={typeMatch[1]} content={typeMatch[2]} onClick={() => setSelectedTraceItem({ type: typeMatch[1], content: typeMatch[2], title: `${step.title} > [${typeMatch[1]}]` })}/>;
                                                    return <div key={i} className="text-[10px] text-gray-400 pl-2 border-l border-gray-100 truncate">{item}</div>;
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Thinking (Inside Bot Bubble) */}
                        {msg.role === 'assistant' && msg.thinking && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors" onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isThinkingExpanded ? 'rotate-180' : ''}`}/>
                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Chain of Thought</span>
                                </div>
                                {isThinkingExpanded && <div className="mt-2 pl-3 border-l-2 border-gray-100"><div className="text-[12px] text-gray-400 font-mono italic whitespace-pre-line leading-relaxed">{msg.thinking}</div></div>}
                            </div>
                        )}

                        {/* Final Content */}
                        <div className={`markdown-body ${msg.role === 'user' ? '!text-white' : ''}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                            </ReactMarkdown>
                            {isGenerating && msg.id === chatHistory[chatHistory.length-1].id && !msg.content && (
                                <span className="inline-flex gap-1 items-center px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-400 animate-pulse">
                                    <LoaderIcon /> 组织语言中...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-end gap-3 max-w-2xl mx-auto">
            {/* Customer Toggle */}
            <div className="relative shrink-0" ref={customerDropdownRef}>
                <button 
                    onClick={() => !isGenerating && setIsCustomerDropdownOpen(!isCustomerDropdownOpen)} 
                    className={`py-3 flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 rounded-xl transition-all hover:bg-white hover:border-blue-500 shadow-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`w-5 h-5 rounded-md ${selectedCustomer.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {selectedCustomer.name.charAt(0)}
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>
                
                {isCustomerDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-2 animate-in slide-in-from-bottom-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">切换模拟场景</div>
                        {MOCK_CUSTOMERS.map(cust => (
                            <div 
                                key={cust.id} 
                                onClick={() => { setSelectedCustomer(cust); setIsCustomerDropdownOpen(false); }} 
                                className={`px-4 py-3 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition-colors ${selectedCustomer.id === cust.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg ${cust.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{cust.name.charAt(0)}</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">{cust.name}</span>
                                    <span className="text-[10px] text-gray-500">{cust.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Input */}
            <div className="relative flex-1">
                <textarea 
                    rows={1}
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                    disabled={isGenerating} 
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400 disabled:opacity-50 resize-none max-h-32 overflow-y-auto" 
                    placeholder={isGenerating ? "系统生成中..." : "向智能体提问 (如：推荐理财)"}
                />
                <button 
                    onClick={handleSend} 
                    disabled={isGenerating || !inputValue.trim()} 
                    className={`absolute right-[7px] bottom-[7px] p-2 rounded-lg transition-all ${isGenerating || !inputValue.trim() ? 'text-gray-300 bg-transparent' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700'}`}
                >
                    {isGenerating ? <LoaderIcon /> : <SendIcon />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewChat;