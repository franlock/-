export enum Platform {
  DOUYIN = '抖音',
  XIAOHONGSHU = '小红书',
  VIDEO_ACCOUNT = '视频号',
  UNKNOWN = '通用/其他'
}

export enum NoteType {
  IMAGE_TEXT = '图文',
  VIDEO = '视频'
}

export interface ScriptScene {
  sceneNo: number;
  visual: string;
  audio: string;
}

export interface TrendItem {
  id: string;
  rank: number;
  title: string;
  hotScore: number;
  platform: Platform;
  summary: string;
  searchUrl: string;
}

export interface DeconstructedNote {
  id: string;
  timestamp: number;
  platform: Platform;
  type: NoteType;
  title: string;
  contentBody: string; 
  tags: string[];
  
  titleSuggestions: string[];
  remixIdea: string;
  
  visualDescription?: string;
  originalImages?: string[];
  
  spokenContent?: string;
  screenText?: string;
  
  videoScript?: ScriptScene[];
}

export interface RemixedContent {
  title: string;
  content: string;
  tags: string[];
  suggestedVisuals: string; 
  script?: ScriptScene[]; // Optional: generated during remix
}

export interface GeneratedNote {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  tags: string[];
  suggestedVisuals: string;
  fromPlatform: Platform;
}

export interface GeneratedScript {
  id: string;
  timestamp: number;
  title: string;
  scenes: ScriptScene[];
  fromPlatform: Platform;
}