import React, { useEffect, useRef } from 'react';
import { Version } from '../types';
import { CheckCircleIcon, LoaderIcon } from './Icons';

interface VersionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  currentVersionId: string | null;
  onSelectVersion: (version: Version) => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({ 
  isOpen, 
  onClose, 
  versions, 
  currentVersionId, 
  onSelectVersion 
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute top-10 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col max-h-[400px]"
    >
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <span className="text-sm font-bold text-slate-700">版本历史</span>
        <span className="text-xs text-gray-400">共 {versions.length} 个版本</span>
      </div>
      
      <div className="overflow-y-auto p-2 space-y-1">
        {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
                暂无历史版本，点击“保存”创建新版本
            </div>
        ) : (
            versions.map((version) => (
            <div 
                key={version.id}
                onClick={() => {
                    onSelectVersion(version);
                    onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors border ${
                    currentVersionId === version.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                }`}
            >
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${currentVersionId === version.id ? 'text-blue-700' : 'text-slate-700'}`}>
                            {version.label}
                        </span>
                        {currentVersionId === version.id && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded">当前</span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                        {new Date(version.timestamp).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                    </span>
                </div>
                {currentVersionId === version.id && (
                     <CheckCircleIcon />
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default VersionSelector;