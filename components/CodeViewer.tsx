
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProjectData, ProjectFile } from '../types';
import JSZip from 'jszip';

interface Props {
  project: ProjectData;
}

export const CodeViewer: React.FC<Props> = ({ project }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | 'EXECUTE'>(
    project.files.some(f => f.name.endsWith('.html')) ? 'EXECUTE' : project.files[0]
  );
  const [isZipping, setIsZipping] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (project.files.some(f => f.name.endsWith('.html'))) {
      setSelectedFile('EXECUTE');
    }
  }, [project]);

  const iframeSrcDoc = useMemo(() => {
    const htmlFile = project.files.find(f => f.name.toLowerCase() === 'index.html');
    if (!htmlFile) return null;

    let content = htmlFile.content;
    const cssContent = project.files.filter(f => f.name.endsWith('.css')).map(f => f.content).join('\n');
    const jsFiles = project.files.filter(f => f.name.endsWith('.js') && f.name.toLowerCase() !== 'index.html');

    if (cssContent) {
      content = content.replace('</head>', `<style>\n${cssContent}\n</style></head>`);
    }
    
    jsFiles.forEach(js => {
       if (!content.includes(js.name)) {
         content = content.replace('</body>', `<script type="module">\n${js.content}\n</script></body>`);
       }
    });

    return content;
  }, [project]);

  const refreshIframe = () => {
    if (iframeRef.current && iframeSrcDoc) {
      iframeRef.current.srcdoc = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.srcdoc = iframeSrcDoc;
      }, 50);
    }
  };

  const popoutPreview = () => {
    if (!iframeSrcDoc) return;
    const blob = new Blob([iframeSrcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadBundle = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = project.name.replace(/\s+/g, '_').toLowerCase();
      const folder = zip.folder(folderName);
      project.files.forEach(file => folder?.file(file.name, file.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}_rexy_build.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="border border-[#00ffcc33] bg-[#000000ee] rounded-3xl flex overflow-hidden flex-1 shadow-2xl relative h-full backdrop-blur-xl">
      <div className="w-56 border-r border-[#00ffcc11] flex flex-col bg-[#050505] shrink-0">
        <div className="p-4 border-b border-[#00ffcc11] bg-[#00ffcc08] flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00ffcc]">Tactical Explorer</span>
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_10px_#00ffcc]" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {iframeSrcDoc && (
            <button 
              onClick={() => setSelectedFile('EXECUTE')}
              className={`w-full p-3 rounded-xl text-[10px] font-black uppercase text-left transition-all flex items-center gap-3 border ${
                selectedFile === 'EXECUTE' ? 'bg-[#00ffcc15] border-[#00ffcc] text-[#00ffcc]' : 'border-transparent text-white/30 hover:bg-white/5'
              }`}
            >
              <span className="text-sm">⚡</span> Engine Runtime
            </button>
          )}

          <div className="px-3 py-4 text-[8px] font-black uppercase text-white/10 tracking-[0.3em]">Neural Artifacts</div>

          {project.files.map((file, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedFile(file)}
              className={`w-full p-2.5 rounded-lg text-[10px] font-mono text-left transition-all flex items-center gap-2 border ${
                typeof selectedFile !== 'string' && selectedFile.name === file.name ? 'bg-white/10 border-white/20 text-[#00ffcc] font-bold' : 'border-transparent text-white/20 hover:text-white/40'
              }`}
            >
              <span className="opacity-40">{file.name.endsWith('.html') ? '🌐' : '📄'}</span>
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#00ffcc11] space-y-2">
           <button onClick={downloadBundle} disabled={isZipping} className="w-full py-2.5 bg-[#00ffcc] text-black text-[9px] font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50">
             {isZipping ? 'Bundling...' : 'Export Source (.zip)'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {selectedFile === 'EXECUTE' ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="h-10 border-b border-[#00ffcc11] bg-[#0a0a0a] flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <button onClick={refreshIframe} className="text-white/40 hover:text-white" title="Hot Reload">🔄</button>
                <div className="bg-black border border-white/5 rounded px-3 py-1 flex-1 max-w-sm flex items-center gap-2">
                   <span className="text-[10px] text-[#00ffcc44] font-mono">https://</span>
                   <span className="text-[10px] text-[#00ffcc] font-mono truncate">{project.name.toLowerCase().replace(/\s/g, '-')}.local-rexy</span>
                </div>
              </div>
              <button onClick={popoutPreview} className="px-4 py-1 bg-[#00ffcc] text-black text-[9px] font-black uppercase rounded-lg shadow-[0_0_15px_rgba(0,255,204,0.3)]">Pop-out Frame</button>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe 
                ref={iframeRef}
                title="Runtime Engine"
                srcDoc={iframeSrcDoc || ''}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-camera allow-microphone allow-popups allow-presentation allow-pointer-lock"
                allow="camera; microphone; geolocation; accelerometer; gyroscope; magnetometer; display-capture; autoplay; encrypted-media"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div className="h-10 border-b border-[#00ffcc11] bg-[#0a0a0a] flex items-center px-4 shrink-0">
              <span className="text-[10px] font-mono text-[#00ffcc] uppercase tracking-widest">{(selectedFile as ProjectFile).name}</span>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-black custom-scrollbar font-mono text-[12px] leading-relaxed text-white/80">
              <pre><code>{(selectedFile as ProjectFile).content}</code></pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
