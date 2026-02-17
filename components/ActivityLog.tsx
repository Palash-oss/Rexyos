
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export const ActivityLog: React.FC<Props> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; 
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'user': return 'text-[#ffffff]';
      case 'agent': return 'text-[#00ffcc]';
      case 'success': return 'text-[#00ff00] font-bold';
      case 'error': return 'text-[#ff3300] font-bold';
      default: return 'text-[#00ffcc66]';
    }
  };

  return (
    <div className="h-full border border-[#00ffcc33] bg-[#000000cc] rounded-lg flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(0,255,204,0.05)]">
      <div className="p-3 border-b border-[#00ffcc33] bg-[#00ffcc11] flex justify-between items-center">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#00ffcc]">System Log Feed</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
          <span className="text-[8px] text-[#00ffcc66] font-bold uppercase tracking-widest">Streaming</span>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-[12px] leading-relaxed custom-scrollbar bg-[#050505]"
      >
        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-400 group">
            <div className="flex items-start gap-3">
              <span className="opacity-20 text-[10px] whitespace-nowrap pt-0.5">[{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <div className="flex flex-col gap-1">
                <span className="opacity-40 font-black uppercase text-[9px] tracking-widest group-hover:opacity-100 transition-opacity">{log.type}</span>
                <span className={`${getLogColor(log.type)} break-words whitespace-pre-wrap`}>
                  {log.message}
                </span>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-20 italic">
            Awaiting system events...
          </div>
        )}
      </div>
    </div>
  );
};
