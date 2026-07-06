import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3005';

const api = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

export interface ChatMessage {
  content: string;
  sender: 'user' | 'assistant';
  type?: string;
  data?: any;
  suggestions?: string[];
}

export interface ChatResponse {
  id: string;
  content: string;
  type: 'text' | 'trip_suggestion' | 'booking_info' | 'error';
  data?: any;
  suggestions?: string[];
}

export class AzureAIService {
  async sendMessage(
    message: string, 
    language: string = 'en', 
    context: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      const response = await api.post('/api/v1/chat/send', {
        message,
        language,
        context
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message to AI service:', error);
      
      // Fallback response
      const fallbackContent = language === 'vi' 
        ? 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.'
        : 'Sorry, I\'m experiencing technical difficulties. Please try again later.';

      return {
        id: Date.now().toString(),
        content: fallbackContent,
        type: 'error'
      };
    }
  }

  async executeQuickAction(
    actionId: string, 
    data?: any, 
    language: string = 'en'
  ): Promise<ChatResponse> {
    try {
      const response = await api.post('/api/v1/chat/quick-actions/execute', {
        actionId,
        data,
        language
      });
      
      return response.data;
    } catch (error) {
      console.error('Error executing quick action:', error);
      
      // Fallback response
      const fallbackContent = language === 'vi' 
        ? 'Xin lỗi, không thể thực hiện hành động này. Vui lòng thử lại.'
        : 'Sorry, unable to execute this action. Please try again.';

      return {
        id: Date.now().toString(),
        content: fallbackContent,
        type: 'error'
      };
    }
  }

  async getQuickActions(language: string = 'en') {
    try {
      const response = await api.get('/api/v1/chat/quick-actions', {
        params: { language }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting quick actions:', error);
      
      // Fallback quick actions
      return language === 'vi' ? [
        {
          id: 'plan-trip',
          label: 'Lên kế hoạch chuyến đi mới',
          action: 'PLAN_TRIP'
        },
        {
          id: 'find-destination',
          label: 'Tìm điểm đến',
          action: 'FIND_DESTINATION'
        }
      ] : [
        {
          id: 'plan-trip',
          label: 'Plan a new trip',
          action: 'PLAN_TRIP'
        },
        {
          id: 'find-destination',
          label: 'Find destinations',
          action: 'FIND_DESTINATION'
        }
      ];
    }
  }

  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('AI Service health check failed:', error);
      return { status: 'ERROR', service: 'AI Service' };
    }
  }
}

// Export singleton instance
export const azureAIService = new AzureAIService();