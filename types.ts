
export enum AgentState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  WORKING = 'WORKING',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'system' | 'user' | 'agent' | 'success' | 'error';
  message: string;
}

export interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

export interface ProjectData {
  name: string;
  description: string;
  files: ProjectFile[];
  previewUrl?: string;
}

export interface ToolResult {
  tool: string;
  action: string;
  status: 'success' | 'failure';
  details: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';
