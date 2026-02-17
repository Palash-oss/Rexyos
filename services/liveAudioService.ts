
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { AgentState } from '../types';

interface LiveAudioOptions {
  onStateChange: (state: AgentState) => void;
  onTranscription: (text: string, isUser: boolean) => void;
  onProjectRequested: (prompt: string) => void;
  onImageRequested: (prompt: string) => void;
  onError: (error: string) => void;
}

const VOICE_CORE_INSTRUCTION = `You are REX-ULTRA, an autonomous agent.
- PERSONA: Technical, direct, and hyper-capable.
- MISSION: Execute commands for code synthesis and visual asset generation.
- TOOLS: build_project for software, generate_art for images.
- STYLE: Avoid filler words. Be precise.`;

export class LiveAudioService {
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private inputContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;

  constructor(private options: LiveAudioOptions) {}

  async start() {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      await this.audioContext.resume();
      await this.inputContext.resume();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      this.options.onError("Microphone access denied. Check hardware permissions.");
      return;
    }

    const tools: FunctionDeclaration[] = [
      {
        name: 'build_project',
        description: 'Synthesize code, websites, or software systems.',
        parameters: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ['prompt'] }
      },
      {
        name: 'generate_art',
        description: 'Generate visual assets.',
        parameters: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ['prompt'] }
      }
    ];

    try {
      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.options.onStateChange(AgentState.LISTENING);
            this.setupMicrophone();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'build_project') this.options.onProjectRequested((fc.args as any).prompt);
                if (fc.name === 'generate_art') this.options.onImageRequested((fc.args as any).prompt);
                this.sessionPromise?.then(session => session.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "Task initiated." } }
                }));
              }
            }
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              this.options.onStateChange(AgentState.SPEAKING);
              await this.playAudio(audioData);
            }
            if (message.serverContent?.outputTranscription) this.options.onTranscription(message.serverContent.outputTranscription.text, false);
            if (message.serverContent?.inputTranscription) this.options.onTranscription(message.serverContent.inputTranscription.text, true);
            if (message.serverContent?.turnComplete) this.options.onStateChange(AgentState.LISTENING);
            if (message.serverContent?.interrupted) this.stopAudioPlayback();
          },
          onerror: (e: any) => {
            this.options.onError("Neural Link Fault: " + e.message);
            this.stop();
          },
          onclose: () => this.options.onStateChange(AgentState.IDLE)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: VOICE_CORE_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
    } catch (err: any) {
      this.options.onError("Live API Initialization failed.");
    }
  }

  private setupMicrophone() {
    if (!this.stream || !this.inputContext || !this.sessionPromise) return;
    const source = this.inputContext.createMediaStreamSource(this.stream);
    this.scriptProcessor = this.inputContext.createScriptProcessor(4096, 1, 1);
    this.scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      this.sessionPromise?.then((session) => {
        try { session.sendRealtimeInput({ media: pcmBlob }); } catch (err) {}
      });
    };
    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputContext.destination);
  }

  private async playAudio(base64: string) {
    if (!this.audioContext || this.audioContext.state === 'closed') return;
    try {
      const bytes = this.decodeBase64(base64);
      const audioBuffer = await this.decodeRawPcm(bytes, this.audioContext);
      this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => this.sources.delete(source);
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    } catch (e) {}
  }

  private stopAudioPlayback() {
    for (const source of this.sources.values()) { try { source.stop(); } catch(e) {} }
    this.sources.clear();
    this.nextStartTime = 0;
  }

  private createPcmBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) { int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767; }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  }

  private async decodeRawPcm(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) { channelData[i] = dataInt16[i] / 32768.0; }
    return buffer;
  }

  stop() {
    this.sessionPromise = null;
    if (this.scriptProcessor) { try { this.scriptProcessor.disconnect(); } catch(e) {} this.scriptProcessor = null; }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    this.stopAudioPlayback();
    if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close();
    if (this.inputContext && this.inputContext.state !== 'closed') this.inputContext.close();
  }
}
