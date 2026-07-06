export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'trip_suggestion' | 'booking_info' | 'error' | 'quick_actions' | 'typing';
  data?: any; // Additional data for structured messages
  language?: string; // Language of the message
  suggestions?: string[]; // Quick reply suggestions
}

export interface ChatContext {
  sessionId?: string;
  userId?: string;
  language: string;
  userProfile?: any;
  currentTrip?: any;
  conversationHistory: ChatMessage[];
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}
