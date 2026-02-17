
import React, { useState, useEffect } from 'react';
import { AspectRatio, ImageSize } from '../types';

interface Props {
  onVoiceToggle: () => void;
  isAudioActive: boolean;
  onVisionOpen: () => void;
  onThinkingToggle: (enabled: boolean) => void;
  onTtsToggle: (enabled: boolean) => void;
  onImageConfigChange: (config: { ratio: AspectRatio, size: ImageSize }) => void;
  onLocalConfigChange: (url: string, model: string) => void;
  mode: 'CLOUD' | 'LOCAL';
}

export const ControlPanel: React.FC<Props> = ({ 
  onVoiceToggle, isAudioActive, onVisionOpen, onThinkingToggle, onTtsToggle, onImageConfigChange, onLocalConfigChange, mode 
}) => {
  const [thinking, setThinking] = useState(false);
  const [tts, setTts] = useState(false);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [size, setSize] = useState<ImageSize>('1K');
  const [endpoint, setEndpoint] = useState('http://localhost:11434/api/generate');
  const [localModel, setLocalModel] = useState('codestral');

  const ratios: AspectRatio[] = ['1:1', '4:3', '16:9', '21:9', '9:16'];
  const sizes: ImageSize[] = ['1K', '2K', '4K'];

  useEffect(() => {
    onLocalConfigChange(endpoint, localModel);
  }, [endpoint, localModel, onLocalConfigChange]);

  return (
    <div className="border border-[#00ffcc33] bg-[#000000aa] rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl h-full custom-scrollbar backdrop-blur-md">
      <div className="flex justify-between items-center border-b border-[#00ffcc11] pb-4">
        <h3 className="font-orbitron text-[11px] font-black text-[#00ffcc] uppercase tracking-[0.3em]">
          CORE PARAMETERS
        </h3>
        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${mode === 'LOCAL' ? 'text-red-500 border-red-500/30' : 'text-[#00ffcc] border-[#00ffcc]/30'}`}>
          {mode === 'LOCAL' ? 'HARDWARE BRIDGE' : 'CLOUD NODE'}
        </span>
      </div>

      {mode === 'LOCAL' && (
        <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/20 space-y-4">
          <div>
            <span className="text-[9px] font-black text-red-500 uppercase block mb-2 tracking-widest">Ollama Node Target</span>
            <div className="space-y-3">
              <input 
                type="text" 
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="Endpoint URL"
                className="w-full bg-black border border-red-500/30 rounded-lg p-2.5 text-[10px] font-mono text-white outline-none focus:border-red-500 transition-colors"
              />
              <input 
                type="text" 
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                placeholder="Model Name"
                className="w-full bg-black border border-red-500/30 rounded-lg p-2.5 text-[10px] font-mono text-white outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="pt-3 border-t border-red-500/10">
            <span className="text-[9px] text-red-500 font-bold uppercase block mb-2 italic underline underline-offset-4">Beast Tier Recommendations:</span>
            <div className="grid grid-cols-1 gap-2 mb-4">
               <button onClick={() => setLocalModel('codestral')} className="text-[9px] bg-blue-500/20 border border-blue-500/50 p-2 rounded-lg hover:bg-blue-500/40 uppercase text-blue-400 font-black flex items-center justify-between">
                  <span>CODESTRAL</span>
                  <span className="text-[7px] bg-blue-500 text-white px-1.5 rounded">ULTRA CODE</span>
               </button>
               <button onClick={() => setLocalModel('llama3.3')} className="text-[9px] bg-red-500/20 border border-red-500/50 p-2 rounded-lg hover:bg-red-500/40 uppercase text-red-400 font-black flex items-center justify-between">
                  <span>LLAMA 3.3 (70B)</span>
                  <span className="text-[7px] bg-red-500 text-white px-1.5 rounded">BEAST REASONER</span>
               </button>
               <button onClick={() => setLocalModel('qwen2.5-coder:32b')} className="text-[9px] bg-purple-500/10 border border-purple-500/30 p-2 rounded-lg hover:bg-purple-500/20 uppercase text-purple-400 font-bold flex items-center justify-between">
                  <span>QWEN 2.5 CODER (32B)</span>
                  <span className="text-[7px] border border-purple-500 px-1 rounded">BALANCED</span>
               </button>
            </div>
            <span className="text-[8px] text-white/50 uppercase block mb-1">Critical CORS Fix (Run in Terminal):</span>
            <code className="block bg-black p-3 text-[8px] text-red-400 break-all border border-red-500/20 rounded-lg font-mono">
              OLLAMA_ORIGINS="*" ollama serve
            </code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { const val = !thinking; setThinking(val); onThinkingToggle(val); }}
          className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${
            thinking ? 'bg-[#ff00ff15] border-[#ff00ff] shadow-[0_0_20px_#ff00ff22]' : 'bg-[#050505] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-2xl">🧠</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Logic Engine</span>
        </button>
        <button 
          onClick={() => { const val = !tts; setTts(val); onTtsToggle(val); }}
          className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${
            tts ? 'bg-[#00ffcc15] border-[#00ffcc] shadow-[0_0_20px_#00ffcc22]' : 'bg-[#050505] border-white/5 hover:border-white/20'
          }`}
        >
          <span className="text-2xl">🔊</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Vocal Core</span>
        </button>
      </div>

      <div className="bg-[#00ffcc05] p-5 rounded-2xl border border-[#00ffcc11]">
        <span className="text-[9px] font-black text-[#00ffcc] uppercase block mb-4 tracking-[0.2em]">Visual Synthesis</span>
        <div className="space-y-5">
          <div>
            <span className="text-[8px] text-white/30 uppercase font-black tracking-widest block mb-2">Aspect Ratio</span>
            <div className="grid grid-cols-3 gap-1.5">
              {ratios.map(r => (
                <button 
                  key={r}
                  onClick={() => { setRatio(r); onImageConfigChange({ ratio: r, size }); }}
                  className={`text-[9px] py-1.5 rounded-lg border transition-all ${ratio === r ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-black' : 'bg-black/40 border-white/5 text-white/30 hover:text-white hover:border-white/20'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[8px] text-white/30 uppercase font-black tracking-widest block mb-2">Neural Resolution</span>
            <div className="flex gap-2">
              {sizes.map(s => (
                <button 
                  key={s}
                  onClick={() => { setSize(s); onImageConfigChange({ ratio, size: s }); }}
                  className={`flex-1 text-[9px] py-1.5 rounded-lg border transition-all ${size === s ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-black' : 'bg-black/40 border-white/5 text-white/30 hover:text-white hover:border-white/20'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onVoiceToggle}
          className={`w-full py-5 rounded-2xl border flex items-center justify-center gap-4 transition-all duration-500 group ${
            isAudioActive ? 'bg-[#00ffcc15] border-[#00ffcc] shadow-[0_0_30px_rgba(0,255,204,0.3)]' : 'bg-[#050505] border-[#00ffcc33] hover:border-[#00ffcc66]'
          }`}
        >
          <div className="relative">
            <span className="text-xl">🎙️</span>
            {isAudioActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ffcc] rounded-full animate-ping" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAudioActive ? 'Voice Sync Active' : 'Neural Voice Bridge'}</span>
        </button>

        <button 
          onClick={onVisionOpen}
          className="w-full py-5 rounded-2xl border border-[#00ffcc33] bg-[#050505] hover:border-[#00ffcc] hover:bg-[#00ffcc10] flex items-center justify-center gap-4 transition-all duration-500 group shadow-lg"
        >
          <span className="text-xl group-hover:scale-125 transition-transform duration-500">👁️</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vision Core HUB</span>
        </button>
      </div>
    </div>
  );
};
