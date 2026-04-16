import React, { useState, useEffect } from 'react';
import { AgentConfig, ChatMessage, FileItem, Skill, EvaluationResult, EnvConfig, DataField } from '../types';
import { calculateStaticScore, evaluateAgentDynamic } from '../services/evaluationService';
import { LoaderIcon } from './Icons';

interface AgentReadinessIndicatorProps {
  config: AgentConfig;
  files: FileItem[];
  skills: Skill[];
  envConfig: EnvConfig;
  dataFields: DataField[];
  chatHistory: ChatMessage[];
  evaluationResult?: EvaluationResult;
  onEvaluationComplete: (result: EvaluationResult) => void;
  onShowReport: () => void;
}

const AgentReadinessIndicator: React.FC<AgentReadinessIndicatorProps> = ({
  config,
  files,
  skills,
  envConfig,
  dataFields,
  chatHistory,
  evaluationResult,
  onEvaluationComplete,
  onShowReport,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [staticScore, setStaticScore] = useState(0);
  const [staticTips, setStaticTips] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  // Calculate static score whenever config changes
  useEffect(() => {
    const { score, tips } = calculateStaticScore(config, files, skills, envConfig, dataFields);
    setStaticScore(score);
    setStaticTips(tips);
  }, [config, files, skills, envConfig, dataFields]);

  // Trigger dynamic evaluation when chat history reaches 6 messages (3 turns)
  useEffect(() => {
    const userMessages = chatHistory.filter((m) => m.role === 'user');
    const assistantMessages = chatHistory.filter((m) => m.role === 'assistant');
    
    // Check if we have at least 3 full turns (user + assistant)
    if (userMessages.length >= 3 && assistantMessages.length >= 3) {
      // Check if we already evaluated this exact state or recently
      // For simplicity, we trigger if there's no result, or if the last evaluation was more than 5 mins ago
      // Or we can just trigger once per session when it hits exactly 3 turns.
      if (!evaluationResult && !isEvaluating) {
        triggerEvaluation();
      } else if (evaluationResult && userMessages.length > 3 && userMessages.length % 3 === 0) {
        // Re-evaluate every 3 turns
        const timeSinceLastEval = Date.now() - (evaluationResult.lastEvaluatedAt || 0);
        if (timeSinceLastEval > 60000 && !isEvaluating) {
          triggerEvaluation();
        }
      }
    }
  }, [chatHistory]);

  const triggerEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const { dynamicScore, dimensions, suggestions } = await evaluateAgentDynamic(config, chatHistory);
      const totalScore = staticScore + dynamicScore;
      
      const newResult: EvaluationResult = {
        totalScore,
        staticScore,
        dynamicScore,
        dimensions,
        suggestions,
        lastEvaluatedAt: Date.now(),
      };
      
      onEvaluationComplete(newResult);
      setShowBanner(true);
      
      // Auto-hide banner after 8 seconds
      setTimeout(() => setShowBanner(false), 8000);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentScore = evaluationResult ? evaluationResult.totalScore : staticScore;
  const maxScore = 100; // Always show out of 100 to encourage testing
  const isReady = !!evaluationResult;
  
  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (ratio >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const scoreStyle = getScoreColor(currentScore, maxScore);

  return (
    <div className="relative flex items-center group">
      {/* Indicator Badge */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm cursor-pointer transition-all hover:shadow-md ${scoreStyle}`}
        onClick={onShowReport}
        title="点击查看详细评测报告与提升指引"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">
            成熟度
          </span>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm font-black">{currentScore}</span>
            <span className="text-[10px] opacity-70">/{maxScore}</span>
          </div>
        </div>
        
        {isEvaluating ? (
          <div className="w-5 h-5 flex items-center justify-center animate-spin opacity-70">
            <LoaderIcon />
          </div>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center">
            {isReady ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )}
          </div>
        )}
      </div>

      {/* Banner (After Evaluation) */}
      {showBanner && evaluationResult && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-emerald-100 p-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800 mb-1">🎉 评测完成！</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                您的智能体获得了 <strong className="text-emerald-600">{evaluationResult.totalScore}分</strong>。
                {evaluationResult.suggestions.length > 0 && (
                  <span className="block mt-1 text-gray-500 italic">
                    💡 建议: {evaluationResult.suggestions[0]}
                  </span>
                )}
              </p>
              <button 
                onClick={() => {
                  setShowBanner(false);
                  onShowReport();
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                查看详细报告 &rarr;
              </button>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentReadinessIndicator;
