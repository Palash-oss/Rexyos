
import React, { useState, useRef, useEffect } from 'react';
import { AgentState } from '../types';

interface Props {
  onCommand: (cmd: string) => void;
  state: AgentState;
  isCompact?: boolean;
}

const FRAMEWORKS = [
  { name: 'React', icon: '⚛️' },
  { name: 'Vue', icon: '🖖' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Three.js', icon: '🧊' },
  { name: 'Express', icon: '🚂' }
];

const SUGGESTIONS = [
  "Build a 3D orbital space sim",
  "Hand-gesture controlled particles",
  "Cyber-security dashboard",
];

export const Terminal: React.FC<Props> = ({ onCommand, state, isCompact }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === AgentState.THINKING) return;
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
  };

  const addFramework = (fw: string) => {
    setInput(prev => {
      const base = prev.trim();
      if (!base) return `Build a ${fw} project that...`;
      return `${base} using ${fw}`;
    });
    textareaRef.current?.focus();
  };

  return (
    <div className={`border border-[#00ffcc33] bg-black/90 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 backdrop-blur-md ${isCompact ? 'flex-1' : 'h-full'}`}>
      <div className="px-5 py-3 border-b border-[#00ffcc11] bg-[#00ffcc08] flex items-center justify-between">
         <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]/40 border border-[#ff3b30]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]/40 border border-[#ffcc00]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#4cd964]/40 border border-[#4cd964]" />
         </div>
         <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#00ffcc66]">Neural Interface</span>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
           {FRAMEWORKS.map(fw => (
             <button 
               key={fw.name}
               onClick={() => addFramework(fw.name)}
               className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-[#00ffcc66] hover:text-[#00ffcc] hover:border-[#00ffcc] transition-all flex items-center gap-1.5"
             >
               <span>{fw.icon}</span> {fw.name}
             </button>
           ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
           <div className="flex items-start gap-4">
              <span className="text-[#00ffcc] font-black animate-pulse text-sm mt-1">❯</span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={state === AgentState.THINKING}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={isCompact ? "Refine build stack..." : "Awaiting architectural directive..."}
                className="flex-1 bg-transparent border-none outline-none resize-none text-white text-[13px] font-mono leading-relaxed placeholder:text-[#00ffcc11] custom-scrollbar"
                rows={isCompact ? 3 : 8}
              />
           </div>
           
           <div className="flex flex-col gap-4 mt-auto pt-5 border-t border-[#00ffcc0a]">
              <div className="flex flex-wrap gap-2">
                {!isCompact && SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => onCommand(s)}
                    className="text-[8px] font-black uppercase tracking-tight bg-[#00ffcc05] border border-[#00ffcc22] px-3 py-1.5 rounded-lg hover:bg-[#00ffcc11] hover:border-[#00ffcc] transition-all text-[#00ffcc44] hover:text-[#00ffcc]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${state === AgentState.THINKING ? 'bg-purple-500 animate-ping' : 'bg-[#00ffcc66]'}`} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                     {state === AgentState.THINKING ? 'Core Processing...' : 'Ready'}
                   </span>
                 </div>
                 <button 
                  type="submit"
                  disabled={state === AgentState.THINKING || !input.trim()}
                  className="px-6 py-2 bg-[#00ffcc] text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-30"
                >
                  EXECUTE CMD
                </button>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
};
