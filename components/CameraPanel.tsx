
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraPanel: React.FC<Props> = ({ onClose, onCapture }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access failed", err);
      }
    };
    initCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current && isReady) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl.split(',')[1]);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000000f0] backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#050505] border-2 border-[#00ffcc] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#00ffcc33] flex justify-between items-center bg-[#00ffcc05]">
          <h2 className="font-orbitron font-bold text-[#00ffcc] uppercase tracking-widest text-xs">Direct Optical Link</h2>
          <button onClick={onClose} className="text-[#00ffcc] p-2 hover:text-white">✕</button>
        </div>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isReady && <div className="absolute inset-0 flex items-center justify-center text-[#00ffcc] animate-pulse">Initializing Lens...</div>}
        </div>
        <div className="p-8 flex justify-center gap-6 bg-[#0a0a0a]">
          <button 
            onClick={capture}
            disabled={!isReady}
            className="px-12 py-3 bg-[#00ffcc] text-[#050505] font-black rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-30 uppercase tracking-widest text-xs"
          >
            Snap & Process
          </button>
          <button onClick={onClose} className="px-8 py-3 border border-[#00ffcc33] text-[#00ffcc] rounded-xl hover:bg-[#00ffcc11] uppercase tracking-widest text-xs">Abort</button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
