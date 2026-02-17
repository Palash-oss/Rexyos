
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentState, LogEntry, ProjectData, AspectRatio, ImageSize } from './types';
import { RGBRing } from './components/RGBRing';
import { ActivityLog } from './components/ActivityLog';
import { Terminal } from './components/Terminal';
import { CodeViewer } from './components/CodeViewer';
import { ControlPanel } from './components/ControlPanel';
import { VisionPanel } from './components/VisionPanel';
import { ImageViewer } from './components/ImageViewer';
import { DocViewer } from './components/DocViewer';
import { VideoViewer } from './components/VideoViewer';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AgentState>(AgentState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [draftedDoc, setDraftedDoc] = useState<{title: string, content: string, type: 'DOC' | 'GMAIL'} | null>(null);
  const [grounding, setGrounding] = useState<{title: string, uri: string}[]>([]);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<{title: string, msg: string, icon?: string} | null>(null);
  
  const [imageConfig, setImageConfig] = useState<{ratio: AspectRatio, size: ImageSize}>({ ratio: '1:1', size: '1K' });
  const [useTts, setUseTts] = useState(false);
  const [neuralMode, setNeuralMode] = useState<'CLOUD' | 'LOCAL'>(() => {
    return (localStorage.getItem('rex_mode') as 'CLOUD' | 'LOCAL') || 'CLOUD';
  });

  const geminiService = useRef(new GeminiService());

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'system') => {
    setLogs(prev => [
      { id: Math.random().toString(36).substring(7), timestamp: new Date(), message, type },
      ...prev.slice(0, 99)
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem('rex_mode', neuralMode);
    geminiService.current.setNeuralMode(neuralMode).then(result => {
      addLog(result.message, result.success ? 'success' : 'error');
    });
  }, [neuralMode, addLog]);

  const handleCommand = useCallback(async (cmd: string, isEditing: boolean = false) => {
    if (!cmd.trim()) return;
    addLog(cmd, 'user');
    
    const isVideo = cmd.toLowerCase().includes('video') || cmd.toLowerCase().includes('animate');
    setState(isVideo ? AgentState.GENERATING_VIDEO : AgentState.THINKING);

    try {
      const result = await geminiService.current.processCommand(cmd, {
        aspectRatio: imageConfig.ratio,
        imageSize: imageConfig.size,
        base64Image: generatedImage?.split(',')[1],
        isEditing: isEditing
      });
      
      if (result.logs) result.logs.forEach(l => addLog(l.message, l.type));
      
      if (result.videoUrl) setGeneratedVideo(result.videoUrl);
      if (result.docContent) setDraftedDoc(result.docContent);
      if (result.project) {
        setProject(result.project);
        setShowSuccessToast({ title: 'SYNTHESIS VERIFIED', msg: result.project.name, icon: '🔥' });
      }
      if (result.imageUrl) setGeneratedImage(result.imageUrl);
      if (result.groundingSources) setGrounding(result.groundingSources);
      
      if (result.responseText) {
        addLog(result.responseText, 'agent');
      }
      
      setState(AgentState.IDLE);
      setTimeout(() => setShowSuccessToast(null), 5000);
    } catch (error: any) {
      addLog(`System Error: ${error.message}`, 'error');
      setState(AgentState.ERROR);
      setTimeout(() => setState(AgentState.IDLE), 3000);
    }
  }, [addLog, imageConfig, generatedImage]);

  const clearWorkspace = () => {
    setProject(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setDraftedDoc(null);
    setGrounding([]);
    addLog("Workspace memory purged.", "system");
  };

  const hasActiveResult = !!(project || generatedImage || generatedVideo || draftedDoc);

  return (
    <div className="flex flex-col h-screen overflow-hidden p-3 bg-[#050505] text-[#00ffcc]">
      <header className="flex justify-between items-center mb-3 border-b border-[#00ffcc22] pb-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center rounded border border-[#00ffcc] bg-[#00ffcc11] shadow-[0_0_15px_#00ffcc44]">
            <span className="font-orbitron font-black text-lg text-[#00ffcc]">R</span>
          </div>
          <div>
            <h1 className="text-sm font-orbitron font-black tracking-[0.4em] text-[#00ffcc] leading-none">REX-ULTRA OS</h1>
            <p className="text-[7px] uppercase font-black tracking-widest text-[#00ffcc44] mt-1">Autonomous Neural Core v4.1</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
           {hasActiveResult && (
             <button 
               onClick={clearWorkspace}
               className="px-4 py-1.5 rounded-lg border border-[#ff3b30] text-[#ff3b30] text-[9px] font-black uppercase hover:bg-[#ff3b3022] transition-all"
             >
               Purge Memory
             </button>
           )}
           <div className="flex bg-[#111] p-1 rounded-lg border border-[#00ffcc11]">
            <button onClick={() => setNeuralMode('CLOUD')} className={`px-4 py-1 rounded text-[8px] font-black uppercase transition-all ${neuralMode === 'CLOUD' ? 'bg-[#00ffcc] text-black shadow-[0_0_10px_rgba(0,255,204,0.3)]' : 'text-[#00ffcc44]'}`}>Cloud Mode</button>
            <button onClick={() => setNeuralMode('LOCAL')} className={`px-4 py-1 rounded text-[8px] font-black uppercase transition-all ${neuralMode === 'LOCAL' ? 'bg-[#ff3b30] text-white shadow-[0_0_10px_rgba(255,59,48,0.3)]' : 'text-[#ff3b3044]'}`}>Local Beast</button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Column: Command Hub */}
        <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${hasActiveResult ? 'w-[450px]' : 'w-full max-w-5xl mx-auto'}`}>
           <div className="flex-[0.4] min-h-[220px] relative flex items-center justify-center border border-[#00ffcc11] rounded-3xl bg-black/40 overflow-hidden shadow-inner backdrop-blur-md">
             {state === AgentState.GENERATING_VIDEO && (
                <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-4">
                   <div className="w-12 h-12 border-2 border-[#00ffcc] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00ffcc]" />
                   <p className="text-[10px] font-black uppercase tracking-widest animate-pulse text-[#00ffcc]">Executing Veo Synthesis</p>
                </div>
             )}
             <RGBRing state={state} isAudioActive={isAudioActive} isLocal={neuralMode === 'LOCAL'} />
           </div>

           <div className="flex-[0.4] overflow-hidden">
             <Terminal onCommand={handleCommand} state={state} isCompact={hasActiveResult} />
           </div>

           <div className="flex-[0.2] overflow-hidden">
              <ActivityLog logs={logs} />
           </div>
        </div>

        {/* Workspace Column: Tactical Display */}
        {hasActiveResult && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden animate-in slide-in-from-right duration-700">
             <div className="flex-1 border border-[#00ffcc22] bg-black/60 rounded-3xl overflow-hidden relative shadow-2xl backdrop-blur-xl">
                {project && <CodeViewer project={project} />}
                {generatedImage && <ImageViewer src={generatedImage} onEdit={(p) => handleCommand(p, true)} />}
                {generatedVideo && <VideoViewer src={generatedVideo} onClose={() => setGeneratedVideo(null)} />}
                {draftedDoc && <DocViewer doc={draftedDoc} onClose={() => setDraftedDoc(null)} />}
             </div>
             
             {grounding.length > 0 && (
                <div className="h-12 bg-[#00ffcc05] border border-[#00ffcc22] rounded-2xl px-5 flex items-center gap-5 overflow-x-auto shrink-0 shadow-lg">
                   <span className="text-[9px] font-black uppercase text-[#00ffcc44] whitespace-nowrap tracking-widest">Data Grounding:</span>
                   {grounding.map((g, i) => (
                     <a key={i} href={g.uri} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#00ffcc] hover:text-white hover:underline underline-offset-4 decoration-[#00ffcc44] whitespace-nowrap transition-colors">
                       ⚡ {g.title}
                     </a>
                   ))}
                </div>
             )}
          </div>
        )}

        {/* Global Control Column */}
        {!hasActiveResult && (
           <div className="w-[320px] shrink-0">
             <ControlPanel 
                onVoiceToggle={() => setIsAudioActive(!isAudioActive)} 
                isAudioActive={isAudioActive}
                onVisionOpen={() => setIsVisionOpen(true)}
                onThinkingToggle={(v) => geminiService.current.setThinking(v)}
                onTtsToggle={(v) => setUseTts(v)}
                onImageConfigChange={(c) => setImageConfig(c)}
                onLocalConfigChange={(url, model) => geminiService.current.setLocalConfig(url, model)}
                mode={neuralMode}
              />
           </div>
        )}
      </main>

      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-[#00ffcc] text-black px-8 py-5 rounded-2xl shadow-[0_20px_60px_rgba(0,255,204,0.4)] flex items-center gap-5 border-2 border-white/20">
             <span className="text-3xl">{showSuccessToast.icon}</span>
             <div>
               <p className="font-orbitron font-black text-[11px] uppercase tracking-wider leading-none mb-1.5">{showSuccessToast.title}</p>
               <p className="text-[10px] font-bold opacity-80 uppercase truncate max-w-[250px]">{showSuccessToast.msg}</p>
             </div>
          </div>
        </div>
      )}

      {isVisionOpen && <VisionPanel onClose={() => setIsVisionOpen(false)} onAnalyze={(img) => handleCommand(`Optical scan complete. Analyzing buffer context: ${img}`, true)} />}
    </div>
  );
};

export default App;
