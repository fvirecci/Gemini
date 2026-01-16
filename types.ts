
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentTopic: Topic;
}
