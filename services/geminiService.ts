
// Minimal local declarations for '@google/genai' to satisfy TypeScript when the package/types are unavailable.
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(opts?: any);
    models: any;
    operations: any;
  }
  export enum Type { OBJECT = "object", STRING = "string", ARRAY = "array" }
  export enum Modality { AUDIO = "AUDIO" }
  export default GoogleGenAI;
}

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProjectData, AspectRatio, ImageSize } from "../types";

export interface ProcessResult {
  responseText?: string;
  project?: ProjectData;
  imageUrl?: string;
  videoUrl?: string;
  docContent?: { title: string; content: string; type: 'DOC' | 'GMAIL' };
  groundingSources?: { title: string; uri: string }[];
  logs?: { message: string, type: 'system' | 'agent' | 'success' | 'error' | 'user' }[];
}

const BEAST_SYNTHESIS_PROMPT = `Act as a God-Tier Creative Technologist and Lead Graphics Architect.
Your mission: Synthesize a "Beast-Level" software system. It MUST be 100% functional, interactive, and visually stunning.

CORE DIRECTIVES:
1. NO PLACEHOLDERS: All code must be operational. No "implement here" comments.
2. SENSORY STACK (GESTURES/CAMERA): If the user mentions "gestures," "hands," "camera," or "tracking":
   - Use @mediapipe/hands (v0.10+) via CDN.
   - Implement a robust "LensController" class that handles navigator.mediaDevices.getUserMedia with fallback states.
   - Create a "GestureEngine" that maps hand landmarks to simulation parameters.
3. GRAPHICS STACK: Use Three.js (v0.160+). For particles, use GPU-accelerated PointsMaterial or custom GLSL Shaders. Ensure 60FPS performance.
4. ARCHITECTURE: Use ES6 Modules. index.html MUST use <script type="importmap"> for library resolution.
5. UI: High-end Cyberpunk HUD. Dark #050505, Neon #00ffcc, Glassmorphism, blurred overlays, and tactical font scaling.

SPECIFIC TECH STACK INSTRUCTIONS:
- Three.js: https://unpkg.com/three@0.160.0/build/three.module.js
- MediaPipe Hands: https://cdn.jsdelivr.net/npm/@mediapipe/hands
- Camera Utils: https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils

CRITICAL FOR WORKING GESTURE APPS:
The generated project MUST include:
- A hidden <video id="input_video"></video> for source feed.
- A visible <canvas id="output_canvas"></canvas> for the Three.js scene.
- A "Neural Sync" overlay that shows camera status.
- Logic to transform landmarks into 3D coordinates.`;

export class GeminiService {
  private mode: 'CLOUD' | 'LOCAL' = 'CLOUD';
  private useThinking: boolean = false;
  private localEndpoint: string = 'http://localhost:11434/api/generate';
  private localModel: string = 'codestral'; // The absolute "Beast" for coding

  setNeuralMode(mode: 'CLOUD' | 'LOCAL'): Promise<{ success: boolean; message: string }> {
    this.mode = mode;
    return Promise.resolve({ 
      success: true, 
      message: mode === 'LOCAL' ? `Hardware Bridge Active: ${this.localModel.toUpperCase()} Engaged` : "Cloud Core Online: Global Sync" 
    });
  }

  setThinking(enabled: boolean) { this.useThinking = enabled; }
  setLocalConfig(url: string, model: string) { this.localEndpoint = url; this.localModel = model; }

  private async ensurePaidKey() {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }
    }
  }

  private getAI() { return new GoogleGenAI({ apiKey: process.env.API_KEY }); }

  async processCommand(cmd: string, options: any): Promise<ProcessResult> {
    const lowerCmd = cmd.toLowerCase();
    const isCoding = /build|create|code|typescript|react|app|ui|website|simulation|game|threejs|fullstack|vue|nextjs|particles|gestures|camera/i.test(cmd);
    
    if (this.mode === 'LOCAL' && isCoding && !lowerCmd.includes('image') && !lowerCmd.includes('video')) {
      return this.handleLocalProjectSynthesis(cmd);
    }

    if (isCoding && !lowerCmd.includes('image') && !lowerCmd.includes('video')) {
      return this.handleCloudProjectSynthesis(cmd);
    }

    if (this.mode === 'LOCAL' && !lowerCmd.includes('image') && !lowerCmd.includes('video')) {
      try {
        const response = await fetch(this.localEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            model: this.localModel, 
            prompt: `System: You are REX-ULTRA. High-density technical responses only. Use markdown for tables/lists.\nUser: ${cmd}`, 
            stream: false 
          })
        });
        const data = await response.json();
        return { responseText: data.response, logs: [{ message: `Inference Verified: ${this.localModel}`, type: 'success' }] };
      } catch (err) {
        return { responseText: await this.handleCloudReasoning(cmd), logs: [{ message: "Hardware bridge offline. Rerouting to Cloud...", type: 'error' }] };
      }
    }

    if (lowerCmd.includes('video') || lowerCmd.includes('animate')) return this.handleVideoGeneration(cmd, options.base64Image);
    if (lowerCmd.includes('image') || options.isEditing) return this.handleImageGeneration(cmd, options);
    
    return { responseText: await this.handleCloudReasoning(cmd) };
  }

  private async handleLocalProjectSynthesis(cmd: string): Promise<ProcessResult> {
    try {
      const response = await fetch(this.localEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: this.localModel, 
          prompt: `${BEAST_SYNTHESIS_PROMPT}\n\nUSER COMMAND: ${cmd}\n\nOUTPUT RAW JSON ONLY. NO MARKDOWN WRAPPERS.`, 
          stream: false,
          format: 'json'
        })
      });
      const data = await response.json();
      let rawJson = data.response.trim();
      if (rawJson.startsWith('```')) rawJson = rawJson.replace(/```(json)?/g, '').trim();
      const project = JSON.parse(rawJson) as ProjectData;
      return { project, logs: [{ message: `Hardware Build Confirmed: ${project.name}`, type: 'success' }] };
    } catch (err: any) {
      return { logs: [{ message: `Local build fault (${this.localModel}). Error: ${err.message}. Switching to Cloud Core...`, type: 'error' }], ...(await this.handleCloudProjectSynthesis(cmd)) };
    }
  }

  private async handleCloudProjectSynthesis(cmd: string): Promise<ProcessResult> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `${BEAST_SYNTHESIS_PROMPT}\n\nUSER COMMAND: ${cmd}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, content: { type: Type.STRING }, language: { type: Type.STRING } },
                  required: ["name", "content", "language"]
                }
              }
            },
            required: ["name", "description", "files"]
          }
        }
      });
      const project = JSON.parse(response.text || '{}') as ProjectData;
      return { project, logs: [{ message: "Neural Synthesis Synchronized (Cloud Pro)", type: 'success' }] };
    } catch (err: any) {
      if (err.message?.includes('403')) return { logs: [{ message: "Cloud Pro Forbidden (Billing). Please use Local mode with 'codestral' or 'llama3.1:70b'.", type: 'error' }] };
      throw new Error(`Synthesis pipeline failure: ${err.message}`);
    }
  }

  private async handleCloudReasoning(prompt: string): Promise<string> {
    const ai = this.getAI();
    const model = this.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const config: any = { systemInstruction: "You are REX-ULTRA. Tactical, no-fluff architect." };
    if (this.useThinking) config.thinkingConfig = { thinkingBudget: 16000 };
    const response = await ai.models.generateContent({ model, contents: prompt, config });
    return response.text || "Connection terminal closed.";
  }

  private async handleImageGeneration(prompt: string, options: any): Promise<ProcessResult> {
    const isPro = !options.isEditing;
    if (isPro) await this.ensurePaidKey();
    const ai = this.getAI();
    const model = options.isEditing ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.isEditing ? {
          parts: [{ inlineData: { data: options.base64Image, mimeType: 'image/jpeg' } }, { text: prompt }]
        } : prompt,
        config: !options.isEditing ? { imageConfig: { aspectRatio: options.aspectRatio, imageSize: options.imageSize } } : undefined
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return { imageUrl: `data:image/png;base64,${part.inlineData.data}`, logs: [{ message: "Visual Node Linked", type: 'success' }] };
      }
      throw new Error("No pixel data.");
    } catch (err: any) { throw new Error(`Imaging Fault: ${err.message}`); }
  }

  private async handleVideoGeneration(prompt: string, img?: string): Promise<ProcessResult> {
    await this.ensurePaidKey();
    const ai = this.getAI();
    try {
      let op = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Cybernetic motion abstract',
        image: img ? { imageBytes: img, mimeType: 'image/jpeg' } : undefined,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!op.done) { await new Promise(r => setTimeout(r, 10000)); op = await ai.operations.getVideosOperation({ operation: op }); }
      return { videoUrl: `${op.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`, logs: [{ message: "Veo Stream Synced", type: 'success' }] };
    } catch (err: any) { throw new Error(`Veo Fault: ${err.message}`); }
  }

  async generateTTS(text: string): Promise<string> {
    const ai = this.getAI();
    try {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
      });
      return r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch { return ""; }
  }
}
