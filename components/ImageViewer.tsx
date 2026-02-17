
import React, { useState } from 'react';

interface Props {
  src: string;
  onEdit?: (prompt: string) => void;
}

export const ImageViewer: React.FC<Props> = ({ src, onEdit }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="flex-1 flex flex-col border border-[#00ffcc33] bg-[#000000ee] rounded-lg overflow-hidden">
      <div className="flex-1 relative flex items-center justify-center p-4 bg-black overflow-hidden group">
        <img 
          src={src} 
          alt="Generated Synthesis" 
          className="max-w-full max-h-full object-contain shadow-[0_0_30px_#00ffcc33] rounded transition-transform group-hover:scale-105 duration-700"
        />
        
        {showEdit && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur p-8 flex flex-col items-center justify-center gap-4 z-20">
             <h4 className="font-orbitron text-xs text-[#00ffcc] uppercase tracking-widest font-black">Refine Asset</h4>
             <textarea 
               value={editPrompt}
               onChange={(e) => setEditPrompt(e.target.value)}
               placeholder="Add a retro filter... Remove background... Change lighting..."
               className="w-full max-w-md p-4 bg-black border border-[#00ffcc44] rounded-xl text-xs font-mono text-white outline-none focus:border-[#00ffcc]"
               rows={3}
             />
             <div className="flex gap-4 w-full max-w-md">
               <button 
                onClick={() => { onEdit?.(editPrompt); setShowEdit(false); }}
                className="flex-1 py-3 bg-[#00ffcc] text-black font-black uppercase text-[10px] rounded-lg"
               >
                 Execute Refinement
               </button>
               <button 
                onClick={() => setShowEdit(false)}
                className="px-6 py-3 border border-white/20 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase"
               >
                 Cancel
               </button>
             </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-[#00ffcc11] flex justify-between items-center bg-[#00ffcc05]">
        <div className="flex gap-2">
           <button 
             onClick={() => setShowEdit(true)}
             className="px-4 py-1.5 bg-[#00ffcc11] border border-[#00ffcc33] text-[#00ffcc] text-[10px] font-bold uppercase rounded hover:bg-[#00ffcc22] transition-all"
           >
             Refine Prompt
           </button>
           <button 
             onClick={() => onEdit?.("Animate this image into a cinematic video")}
             className="px-4 py-1.5 bg-[#ff00ff11] border border-[#ff00ff33] text-[#ff00ff] text-[10px] font-bold uppercase rounded hover:bg-[#ff00ff22] transition-all"
           >
             Animate Image
           </button>
        </div>
        <div className="flex gap-2">
          <a 
            href={src} 
            download="rexy_synthesis.png"
            className="px-4 py-1.5 bg-[#00ffcc22] hover:bg-[#00ffcc44] text-[#00ffcc] text-[10px] font-bold uppercase rounded border border-[#00ffcc33] transition-all"
          >
            Export PNG
          </a>
        </div>
      </div>
    </div>
  );
};
