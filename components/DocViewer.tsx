
import React from 'react';

interface Props {
  doc: { title: string; content: string; type: 'DOC' | 'GMAIL' };
  onClose: () => void;
}

export const DocViewer: React.FC<Props> = ({ doc, onClose }) => {
  const downloadDoc = () => {
    const element = document.createElement("a");
    const file = new Blob([doc.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 flex flex-col border border-[#00ffcc33] bg-[#000000ee] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="p-4 border-b border-[#00ffcc22] bg-[#00ffcc08] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">{doc.type === 'GMAIL' ? '📧' : '📄'}</span>
          <h3 className="font-orbitron font-black text-[10px] text-[#00ffcc] uppercase tracking-[0.2em]">{doc.title}</h3>
        </div>
        <button onClick={onClose} className="text-[#00ffcc66] hover:text-[#00ffcc] transition-colors font-bold text-xs">CLOSE</button>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-white/90 bg-[#050505]">
        <div className="max-w-3xl mx-auto whitespace-pre-wrap selection:bg-[#00ffcc] selection:text-black">
          {doc.content}
        </div>
      </div>

      <div className="p-4 border-t border-[#00ffcc11] bg-[#00ffcc05] flex justify-end gap-3">
        <button 
          onClick={() => navigator.clipboard.writeText(doc.content)}
          className="px-6 py-2 bg-[#00ffcc11] border border-[#00ffcc33] text-[#00ffcc] text-[9px] font-black uppercase rounded-lg hover:bg-[#00ffcc22] transition-all"
        >
          Copy Text
        </button>
        <button 
          onClick={downloadDoc}
          className="px-8 py-2 bg-[#00ffcc] text-black text-[9px] font-black uppercase rounded-lg hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all"
        >
          Download .txt
        </button>
      </div>
    </div>
  );
};
