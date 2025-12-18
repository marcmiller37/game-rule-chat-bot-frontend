
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface RuleFile {
  name: string;
  base64: string;
  mimeType: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  logs: AgentAction[];
}
