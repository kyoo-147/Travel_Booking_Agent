import axios, { AxiosResponse } from 'axios';
import { ChatMessage } from '../types/chat.types';
import { mockChatService } from './mock-chat.service';
import { azureAIService } from './azure-ai.service';

const API_BASE_URL = import.meta.env.PROD ?
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1') :
  '/api/v1'; // Use Vite proxy in development
// Use Azure AI service by default, fallback to mock if needed
const USE_AZURE_AI = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Axios instance for Trip Service (History)
const tripApi = axios.create({
  baseURL: '/api/chat', // Proxied to http://localhost:3003/api/chat
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for tripApi
tripApi.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});


// Types
export interface ChatRequest {
  message: string;
  language: string;
  context?: {
    userId?: string;
    sessionId?: string;
    conversationHistory?: ChatMessage[];
    userProfile?: any;
    currentTrip?: any;
    bookingRequest?: any; // Structured booking data
  };
}


export interface ChatResponse {
  id: string;
  content: string;
  type: 'text' | 'trip_suggestion' | 'booking_info' | 'error' | 'quick_actions';
  data?: any;
  suggestions?: string[];
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: any;
  title?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NLUResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  language: string;
}

export const chatService = {
  // Send message to AI service
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    console.log('Sending message to AI service:', request);

    // 1. Save User Message to DB if sessionId exists
    if (request.context?.sessionId && request.context?.userId) {
      try {
        await this.addMessage(request.context.sessionId, 'user', request.message);
      } catch (error) {
        console.error('Failed to save user message to history:', error);
      }
    }

    let response: ChatResponse;

    // Use Azure AI service if configured
    if (USE_AZURE_AI) {
      console.log('Using Azure AI service:', request.message, request.language);
      try {
        response = await azureAIService.sendMessage(request.message, request.language, request.context?.conversationHistory);
      } catch (error) {
        console.log('Azure AI service failed, using mock service');
        response = await mockChatService.sendMessage(request);
      }
    } else {
      try {
        const apiResponse: AxiosResponse<ChatResponse> = await api.post('/chat/message', request);
        console.log('AI service response:', apiResponse.data);
        response = apiResponse.data;
      } catch (error: any) {
        console.error('Error sending message, falling back to mock service:', error);

        if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR' || !navigator.onLine) {
          console.log('Using mock chat service as fallback');
          response = await mockChatService.sendMessage(request);
        } else {
          response = {
            id: Date.now().toString(),
            content: this.getErrorMessage(error, request.language),
            type: 'error'
          };
        }
      }
    }

    // 2. Save Assistant Message to DB if sessionId exists
    if (request.context?.sessionId && request.context?.userId && response.type !== 'error') {
      try {
        await this.addMessage(request.context.sessionId, 'assistant', response.content, {
          type: response.type,
          data: response.data,
          suggestions: response.suggestions
        });
      } catch (error) {
        console.error('Failed to save assistant message to history:', error);
      }
    }

    return response;
  },

  // Get chat session history
  async getSession(sessionId: string, userId: string): Promise<ChatSession> {
    const response: AxiosResponse<ChatSession> = await tripApi.get(`/sessions/${sessionId}/user/${userId}`);
    return response.data;
  },

  // Create new chat session
  async createSession(userId: string, title?: string, language: string = 'en'): Promise<ChatSession> {
    const response: AxiosResponse<ChatSession> = await tripApi.post('/sessions', { userId, title });
    const session = response.data;
    // Trip service might not return language/context in root, but that's fine
    return { ...session, language, context: {} };
  },

  // Get user's chat sessions
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const response: AxiosResponse<ChatSession[]> = await tripApi.get(`/sessions/user/${userId}`);
    return response.data;
  },

  // Add message to session
  async addMessage(sessionId: string, role: string, content: string, metadata?: any): Promise<void> {
    await tripApi.post(`/sessions/${sessionId}/messages`, { role, content, metadata });
  },

  // Delete chat session
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    await tripApi.delete(`/sessions/${sessionId}`, { data: { userId } });
  },

  // Process natural language understanding
  async processNLU(text: string, language: string = 'en'): Promise<NLUResult> {
    const response: AxiosResponse<NLUResult> = await api.post('/chat/nlu', { text, language });
    return response.data;
  },

  // Get quick action suggestions
  async getQuickActions(language: string = 'en'): Promise<QuickAction[]> {
    try {
      const response: AxiosResponse<QuickAction[]> = await api.get(`/chat/quick-actions?language=${language}`);
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock quick actions');
      return await mockChatService.getQuickActions(language);
    }
  },

  // Execute quick action
  async executeQuickAction(actionId: string, data?: any, language: string = 'en'): Promise<ChatResponse> {
    // Use Azure AI service if configured
    if (USE_AZURE_AI) {
      console.log('Using Azure AI service for action:', actionId, data);
      try {
        return await azureAIService.executeQuickAction(actionId, data, language);
      } catch (error) {
        console.log('Azure AI service failed for action, using mock service');
        return await mockChatService.executeQuickAction(actionId, data);
      }
    }

    try {
      const response: AxiosResponse<ChatResponse> = await api.post('/chat/quick-actions/execute', {
        actionId,
        data,
        language
      });
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock quick action execution', error);
      console.log('Executing mock action:', actionId, data);
      return await mockChatService.executeQuickAction(actionId, data);
    }
  },

  // Helper method to get localized error messages
  getErrorMessage(error: any, language: string = 'en'): string {
    const errorMessages = {
      en: {
        network: 'Network error. Please check your connection and try again.',
        server: 'Server error. Please try again later.',
        validation: 'Invalid input. Please check your message.',
        unauthorized: 'Please log in to continue.',
        general: 'Something went wrong. Please try again.'
      },
      vi: {
        network: 'Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.',
        server: 'Lỗi máy chủ. Vui lòng thử lại sau.',
        validation: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra tin nhắn của bạn.',
        unauthorized: 'Vui lòng đăng nhập để tiếp tục.',
        general: 'Đã xảy ra lỗi. Vui lòng thử lại.'
      }
    };

    const messages = errorMessages[language as keyof typeof errorMessages] || errorMessages.en;

    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return messages.network;
    }

    if (error.response?.status >= 500) {
      return messages.server;
    }

    if (error.response?.status === 400) {
      return messages.validation;
    }

    if (error.response?.status === 401) {
      return messages.unauthorized;
    }

    return error.response?.data?.message || messages.general;
  }
};