
import React from 'react';
import { AgentState } from '../types';

interface Props {
  state: AgentState;
  isAudioActive: boolean;
  isLocal?: boolean;
}

export const RGBRing: React.FC<Props> = ({ state, isAudioActive, isLocal }) => {
  const getColor = () => {
    if (state === AgentState.ERROR) return '#ff3b30';
    if (isLocal) return '#ff3b30'; 
    switch (state) {
      case AgentState.LISTENING: return '#00ffcc';
      case AgentState.THINKING: return '#ff00ff';
      case AgentState.WORKING: return '#ffcc00';
      case AgentState.SPEAKING: return '#002bff';
      default: return '#00ffcc';
    }
  };

  const ringColor = getColor();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center scale-90 md:scale-100 transition-all duration-700">
      <div 
        className="absolute inset-0 rounded-full border-2 opacity-10 animate-pulse"
        style={{ borderColor: ringColor, boxShadow: `0 0 30px ${ringColor}` }}
      />
      
      <div 
        className={`absolute inset-4 rounded-full border border-dashed transition-all duration-1000 ${state === AgentState.THINKING ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_10s_linear_infinite]'}`}
        style={{ borderColor: ringColor, opacity: 0.3 }}
      />

      <div 
        className={`absolute inset-10 rounded-full border-4 transition-all duration-500`}
        style={{ 
          borderColor: ringColor, 
          boxShadow: `inset 0 0 20px ${ringColor}`,
          transform: state === AgentState.LISTENING ? 'scale(1.1)' : 'scale(1)'
        }}
      />

      <div className="z-10 flex flex-col items-center">
        {isAudioActive && (
          <div className="flex gap-1 mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1 bg-[#00ffcc] animate-bounce" style={{ height: '10px', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
        <span className="font-orbitron font-black text-2xl tracking-tighter" style={{ color: ringColor }}>
          REXY
        </span>
        <span className="text-[8px] mt-1 font-bold opacity-40 tracking-[0.4em] uppercase">
          {isLocal ? 'Hardware Node' : state}
        </span>
      </div>
    </div>
  );
};
