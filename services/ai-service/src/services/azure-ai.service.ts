import axios from 'axios';
import { memoryService } from '../rag/memory.service';
import { FormattedMemoryContext } from '../rag/memory.types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  type: 'text' | 'trip_suggestion' | 'booking_info' | 'error';
  data?: any;
  suggestions?: string[];
  memoriesUsed?: number;
}

export class AzureAIService {
  private endpoint: string;
  private token: string;
  private modelName: string;
  private cache: Map<string, { response: ChatCompletionResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes cache

  private readonly baseSystemPromptVi = `Bạn là trợ lý đại lý du lịch AI cho StarByte Travel. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.`;
  private readonly baseSystemPromptEn = `You are an AI travel assistant for StarByte Travel. Keep responses concise and friendly.`;

  constructor(endpoint: string, token: string, modelName: string) {
    this.endpoint = endpoint;
    this.token = token;
    this.modelName = modelName;
  }

  private getCacheKey(messages: ChatMessage[], language: string): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    return `${lastMessage.toLowerCase().trim()}_${language}`;
  }

  private getCachedResponse(cacheKey: string): ChatCompletionResponse | null {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log('Returning cached response for:', cacheKey.substring(0, 50));
      return cached.response;
    }
    return null;
  }

  private setCachedResponse(cacheKey: string, response: ChatCompletionResponse): void {
    this.cache.set(cacheKey, { response, timestamp: Date.now() });

    // Clean old cache entries
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Build system prompt with memory context if available
   */
  private buildSystemPrompt(
    language: string,
    customPrompt?: string,
    memoryContext?: FormattedMemoryContext
  ): string {
    // Use custom prompt if provided, otherwise use default
    let basePrompt = customPrompt || (language === 'vi'
      ? this.baseSystemPromptVi
      : this.baseSystemPromptEn);

    // Append memory context if available
    if (memoryContext?.hasMemories) {
      basePrompt = `${basePrompt}\n\n${memoryContext.formattedText}`;
    }

    return basePrompt;
  }

  /**
   * Generate chat response with optional memory integration
   * @param messages - Chat messages
   * @param language - Language code
   * @param systemPrompt - Optional custom system prompt
   * @param userId - Optional user ID for memory retrieval
   * @param sessionId - Optional session ID for memory storage
   */
  async generateChatResponse(
    messages: ChatMessage[],
    language: string = 'en',
    systemPrompt?: string,
    userId?: string,
    sessionId?: string
  ): Promise<ChatCompletionResponse> {
    try {
      console.log('Generating chat response for:', messages[messages.length - 1]?.content?.substring(0, 100));
      if (userId) {
        console.log('👤 [AzureAI] User ID:', userId);
      }

      // Check cache first for common queries if NO custom system prompt (custom prompts imply unique context)
      // Also skip cache if userId is provided (memory-enabled queries should be fresh)
      let cacheKey = '';
      let cachedResponse = null;

      if (!systemPrompt && !userId) {
        cacheKey = this.getCacheKey(messages, language);
        cachedResponse = this.getCachedResponse(cacheKey);
      }

      if (cachedResponse) {
        return cachedResponse;
      }

      // Step 1: Retrieve relevant memories if userId is provided
      let memoryContext: FormattedMemoryContext = {
        hasMemories: false,
        formattedText: '',
        memoriesUsed: 0,
      };

      const userQuery = messages[messages.length - 1]?.content || '';

      if (userId && userQuery.length > 5) {
        try {
          const memories = await memoryService.retrieveRelevantMemories({
            userId,
            query: userQuery,
            topK: 3,
            minSimilarity: 0.3,
          });

          if (memories.length > 0) {
            memoryContext = memoryService.formatMemoriesForPrompt(memories);
            console.log(`📚 [AzureAI] Injecting ${memoryContext.memoriesUsed} memories`);
          }
        } catch (memoryError: any) {
          console.warn('⚠️ [AzureAI] Memory retrieval failed:', memoryError.message);
        }
      }

      // Step 2: Build system prompt with memory context
      const finalSystemPrompt = this.buildSystemPrompt(language, systemPrompt, memoryContext);

      const systemMessage: ChatMessage = {
        role: 'system',
        content: finalSystemPrompt
      };

      const fullMessages = [systemMessage, ...messages];

      // Step 3: Call GitHub Models API directly with optimized settings
      const response = await axios.post('https://models.github.ai/inference/chat/completions', {
        model: this.modelName,
        messages: fullMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.3, // Lower for faster, more focused responses
        max_tokens: 500,  // Reduced for faster generation
        stream: false,    // Disable streaming for simpler handling
        top_p: 0.9       // Optimize for speed
      }, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        timeout: 15000    // Reduced timeout to 15 seconds
      });

      const content = response.data.choices?.[0]?.message?.content || '';

      // Classify response type based on content
      const responseType = this.classifyResponseType(content);

      // Generate suggestions based on content
      const suggestions = this.generateSuggestions(content, language);

      const result: ChatCompletionResponse = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        type: responseType,
        suggestions,
        memoriesUsed: memoryContext.memoriesUsed,
      };

      // Cache the result for future use (only if no userId)
      if (!userId && cacheKey) {
        this.setCachedResponse(cacheKey, result);
      }

      // Step 4: Store conversation as memory (async, don't wait)
      if (userId && content.length > 50) {
        this.storeChatMemory(userId, sessionId, userQuery, content).catch(err => {
          console.warn('⚠️ [AzureAI] Failed to store memory:', err.message);
        });
      }

      return result;

    } catch (error) {
      console.error('Azure AI Service Error:', error);

      // Fallback response
      const fallbackContent = language === 'vi'
        ? 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút.'
        : 'Sorry, I\'m experiencing technical difficulties. Please try again in a few minutes.';

      return {
        id: Date.now().toString(),
        content: fallbackContent,
        type: 'error'
      };
    }
  }

  /**
   * Store chat conversation as memory (async helper)
   */
  private async storeChatMemory(
    userId: string,
    sessionId: string | undefined,
    query: string,
    content: string
  ): Promise<void> {
    await memoryService.extractAndStoreFromConversation(
      userId,
      sessionId || 'unknown',
      query,
      content,
      'chat'
    );
    console.log('💾 [AzureAI] Chat stored as memory');
  }

  private classifyResponseType(content: string): 'text' | 'trip_suggestion' | 'booking_info' | 'error' {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('itinerary') || lowerContent.includes('destination') ||
      lowerContent.includes('lịch trình') || lowerContent.includes('điểm đến')) {
      return 'trip_suggestion';
    }

    if (lowerContent.includes('booking') || lowerContent.includes('reservation') ||
      lowerContent.includes('đặt chỗ') || lowerContent.includes('đặt vé')) {
      return 'booking_info';
    }

    return 'text';
  }

  private generateSuggestions(content: string, language: string): string[] {
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();

    if (language === 'vi') {
      if (lowerContent.includes('du lịch') || lowerContent.includes('chuyến đi')) {
        suggestions.push('Tôi muốn xem gợi ý điểm đến');
        suggestions.push('Hãy giúp tôi lập kế hoạch chi tiết');
        suggestions.push('Ngân sách khoảng bao nhiêu?');
      }

      if (lowerContent.includes('máy bay') || lowerContent.includes('vé')) {
        suggestions.push('Tìm vé máy bay giá rẻ');
        suggestions.push('Kiểm tra lịch bay');
        suggestions.push('Thủ tục check-in');
      }

      if (lowerContent.includes('khách sạn')) {
        suggestions.push('Tìm khách sạn gần đây');
        suggestions.push('So sánh giá phòng');
        suggestions.push('Đánh giá khách sạn');
      }
    } else {
      if (lowerContent.includes('travel') || lowerContent.includes('trip')) {
        suggestions.push('Show me destination recommendations');
        suggestions.push('Help me plan detailed itinerary');
        suggestions.push('What\'s the budget estimate?');
      }

      if (lowerContent.includes('flight') || lowerContent.includes('airline')) {
        suggestions.push('Find cheap flights');
        suggestions.push('Check flight schedules');
        suggestions.push('Online check-in process');
      }

      if (lowerContent.includes('hotel')) {
        suggestions.push('Find nearby hotels');
        suggestions.push('Compare room prices');
        suggestions.push('Hotel reviews');
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  async executeQuickAction(
    actionId: string,
    data?: any,
    language: string = 'en',
    userId?: string,
    sessionId?: string
  ): Promise<ChatCompletionResponse> {
    let userQuery = '';

    switch (actionId) {
      case 'plan-trip':
        userQuery = language === 'vi'
          ? `Tôi muốn lập kế hoạch cho một chuyến du lịch${data?.destination ? ` đến ${data.destination}` : ''}. Hãy giúp tôi với các bước cần thiết.`
          : `I want to plan a trip${data?.destination ? ` to ${data.destination}` : ''}. Please help me with the necessary steps.`;
        break;

      case 'find-destination':
        userQuery = language === 'vi'
          ? 'Hãy gợi ý cho tôi một số điểm đến du lịch thú vị dựa trên xu hướng hiện tại.'
          : 'Please suggest some interesting travel destinations based on current trends.';
        break;

      case 'check-booking':
        userQuery = language === 'vi'
          ? 'Tôi muốn kiểm tra thông tin đặt vé và lịch trình của mình.'
          : 'I want to check my booking information and itinerary.';
        break;

      default:
        userQuery = language === 'vi'
          ? 'Tôi cần hỗ trợ về dịch vụ du lịch.'
          : 'I need assistance with travel services.';
    }

    const messages: ChatMessage[] = [
      { role: 'user', content: userQuery }
    ];

    return await this.generateChatResponse(messages, language, undefined, userId, sessionId);
  }
}
