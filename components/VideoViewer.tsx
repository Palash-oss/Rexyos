
import React from 'react';

interface Props {
  src: string;
  onClose: () => void;
}

export const VideoViewer: React.FC<Props> = ({ src, onClose }) => {
  return (
    <div className="flex-1 flex flex-col border border-[#00ffcc33] bg-[#000000ee] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="p-4 border-b border-[#00ffcc22] bg-[#00ffcc08] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎬</span>
          <h3 className="font-orbitron font-black text-[10px] text-[#00ffcc] uppercase tracking-[0.2em]">Veo Synthesis Result</h3>
        </div>
        <button onClick={onClose} className="text-[#00ffcc66] hover:text-[#00ffcc] transition-colors font-bold text-xs">CLOSE</button>
      </div>
      
      <div className="flex-1 bg-black flex items-center justify-center p-4">
        <video 
          src={src} 
          controls 
          autoPlay 
          loop
          className="max-w-full max-h-full rounded-lg shadow-[0_0_40px_rgba(0,255,204,0.1)] border border-[#00ffcc22]"
        />
      </div>

      <div className="p-4 border-t border-[#00ffcc11] bg-[#00ffcc05] flex justify-end gap-3">
        <a 
          href={src} 
          download="rexy_veo_synthesis.mp4"
          className="px-8 py-2 bg-[#00ffcc] text-black text-[9px] font-black uppercase rounded-lg hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all"
        >
          Export MP4
        </a>
      </div>
    </div>
  );
};
