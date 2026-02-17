
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
  onAnalyze: (imageData: string) => void;
}

export const VisionPanel: React.FC<Props> = ({ onClose, onAnalyze }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        if (!navigator.mediaDevices || !(navigator.mediaDevices as any).getDisplayMedia) {
          throw new Error("Screen capture (getDisplayMedia) is not supported by your browser or current environment.");
        }

        const s = await (navigator.mediaDevices as any).getDisplayMedia({ 
          video: { 
            cursor: "always",
            displaySurface: "monitor" 
          },
          audio: false 
        });
        
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
        
        s.getVideoTracks()[0].onended = () => onClose();

      } catch (err: any) {
        console.error("Screen capture failed:", err);
        let msg = "Access Denied.";
        if (err.name === 'SecurityError' || err.message?.includes('permissions policy')) {
          msg = "PERMISSION BLOCKED: This environment (iframe) does not allow 'display-capture'. If you are using an AI previewer, try opening Rexy in a new tab or window.";
        } else if (err.name === 'NotAllowedError') {
          msg = "USER CANCELLED: You must allow screen sharing for Rexy to 'see' your window.";
        } else {
          msg = err.message || "An unknown error occurred while initiating the vision link.";
        }
        setError(msg);
      }
    };
    initStream();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && isReady) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
        onAnalyze(dataUrl.split(',')[1]); 
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000000fb] backdrop-blur-2xl animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-5xl bg-[#050505] border-2 border-[#00ffcc] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_120px_#00ffcc44]">
        <div className="p-5 border-b border-[#00ffcc33] bg-[#00ffcc0a] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-3.5 h-3.5 rounded-full ${error ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#00ffcc] animate-pulse shadow-[0_0_10px_#00ffcc]'}`} />
            <h2 className="font-orbitron font-black tracking-[0.3em] text-[#00ffcc] uppercase text-sm">REX-VISION | Neural Link</h2>
          </div>
          <button onClick={onClose} className="text-[#00ffcc66] hover:text-white transition-colors p-2 text-xl">✕</button>
        </div>
        
        <div className="relative flex-1 bg-black min-h-[400px] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center gap-8 p-12 text-center max-w-2xl">
              <div className="text-7xl animate-bounce">🛡️</div>
              <h3 className="text-2xl font-orbitron text-red-500 uppercase tracking-widest font-black">Link Interference</h3>
              <p className="text-sm text-[#00ffccbb] leading-relaxed font-mono bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                {error}
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-[#00ffcc66] uppercase tracking-widest">Suggested Fix:</p>
                <p className="text-xs text-[#00ffcc] font-bold">Open this application in its own browser tab to bypass iframe security policies.</p>
              </div>
              <button 
                onClick={onClose} 
                className="mt-4 px-12 py-3 bg-red-500/20 border border-red-500 text-red-500 font-bold rounded-lg uppercase hover:bg-red-500 hover:text-white transition-all"
              >
                Abort & Return
              </button>
            </div>
          ) : (
            <>
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black/95">
                  <div className="w-20 h-20 border-4 border-t-[#00ffcc] border-[#00ffcc11] rounded-full animate-spin" />
                  <div className="text-center">
                    <span className="text-[#00ffcc] font-orbitron text-xs tracking-[0.5em] uppercase block mb-2">Syncing Display Buffers</span>
                    <span className="text-[#00ffcc33] text-[10px] animate-pulse">Establishing secure display-capture protocol...</span>
                  </div>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-contain" 
              />
              {/* Tactical HUD */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-[#00ffcc] opacity-50" />
                <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-[#00ffcc] opacity-50" />
                <div className="absolute bottom-10 left-10 w-24 h-24 border-b-2 border-l-2 border-[#00ffcc] opacity-50" />
                <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-[#00ffcc] opacity-50" />
                
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00ffcc05]" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#00ffcc05]" />
                
                <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-4">
                  <div className="px-3 py-1 bg-[#00ffcc11] border border-[#00ffcc33] text-[9px] text-[#00ffcc] font-bold uppercase tracking-widest">Mode: Autonomous Scan</div>
                  <div className="px-3 py-1 bg-[#00ffcc11] border border-[#00ffcc33] text-[9px] text-[#00ffcc] font-bold uppercase tracking-widest animate-pulse">Target: Active OS Layer</div>
                </div>
              </div>
            </>
          )}
        </div>

        {!error && (
          <div className="p-10 bg-[#0a0a0a] flex flex-col items-center gap-8 border-t border-[#00ffcc11]">
            <div className="text-center">
              <h4 className="text-xs text-[#00ffcc] font-orbitron font-bold uppercase tracking-[0.3em] mb-2">Ready for Neural Capture</h4>
              <p className="text-[10px] text-[#00ffcc66] font-mono leading-relaxed max-w-md">
                Rexy will analyze the selected window to identify tasks, solve problems, or provide architectural advice.
              </p>
            </div>
            <div className="flex gap-8">
              <button 
                onClick={captureFrame}
                disabled={!isReady}
                className="px-20 py-4 bg-[#00ffcc] text-[#050505] font-orbitron font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_#00ffcc44] disabled:opacity-30 flex items-center gap-3 uppercase tracking-widest"
              >
                <span className="text-xl">👁️</span> Initiate Scan
              </button>
              <button 
                onClick={onClose}
                className="px-16 py-4 border-2 border-[#00ffcc33] text-[#00ffcc] font-orbitron font-bold rounded-2xl hover:bg-[#00ffcc11] hover:border-[#00ffcc] transition-all uppercase tracking-widest"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
