
export enum TrainingStatus {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  TRAINING = 'TRAINING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TrainingPair {
  id: string;
  instruction: string;
  response: string;
  thought?: string; 
  image?: string; 
  video?: string; // URL or base64
  audio?: string; // URL or base64
}

export interface PreferencePair {
  id: string;
  prompt: string;
  chosen: string;
  rejected: string;
  critique?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: string;
}

export interface TrainingConfig {
  baseModel: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  contextLength: number;
  visionEnabled: boolean;
  visionEncoder: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  tools: ToolDefinition[];
  trainingMethod: 'SFT' | 'DPO' | 'ORPO';
  reasoningMode: boolean;
}

export interface TrainingLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface MetricPoint {
  step: number;
  loss: number;
  accuracy: number;
  alignment?: number; 
}

export interface ModelVersion {
  id: string;
  name: string;
  timestamp: string;
  config: TrainingConfig;
  metrics: MetricPoint[];
  progress: number;
  logs: TrainingLog[];
  status: TrainingStatus;
}

export interface ForgePlan {
  config: TrainingConfig;
  lessons: TrainingPair[];
  missionBriefing: string;
  protocol: string[]; 
}

export const OLLAMA_MODELS = [
  'llama3:8b',
  'llama3:70b',
  'mistral:v0.3',
  'phi3:latest',
  'gemma2:9b',
  'codegemma:latest',
  'qwen2:7b',
  'llama3.2-vision:latest',
  'moondream:latest',
  'ultravox:latest' // Multimodal audio-capable
];

export const VISION_ENCODERS = [
  'CLIP-ViT-L/14',
  'SigLIP-SO400M',
  'OpenCLIP-ViT-H/14',
  'EVA-CLIP-G'
];
