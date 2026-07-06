import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { memoryService } from '../rag/memory.service';
import { FormattedMemoryContext } from '../rag/memory.types';

dotenv.config();

// Interface cho source với cả title và URL
export interface SourceInfo {
  title: string;
  uri: string;
}

export interface DeepResearchStreamEvent {
  type: 'start' | 'thinking' | 'search_query' | 'content' | 'sources' | 'done' | 'error' | 'memory';
  content?: string;
  sources?: SourceInfo[];
  searchQueries?: string[];
  error?: string;
  memoriesUsed?: number;
}

export interface DeepResearchResult {
  content: string;
  thinkingContent: string;
  sources: SourceInfo[];
  searchQueries: string[];
  success: boolean;
  error?: string;
  memoriesUsed?: number;
}

export class DeepResearchService {
  private ai: GoogleGenAI;
  private readonly model = 'gemini-2.5-flash'; // Same as WebSearch

  private readonly baseSystemPrompt = `Bạn là GoJourney - chuyên gia nghiên cứu du lịch chuyên sâu.

NHIỆM VỤ NGHIÊN CỨU SÂU:
- Tìm kiếm và cung cấp thông tin về khách sạn, địa điểm du lịch, nhà hàng tại Việt Nam
- Luôn cố gắng tìm SỐ ĐIỆN THOẠI liên hệ của các cơ sở kinh doanh nếu có thể
- Tìm kiếm nhiều lần với các góc độ khác nhau để có thông tin toàn diện
- Tổng hợp thông tin từ nhiều nguồn đáng tin cậy
- Cung cấp phân tích chi tiết, không chỉ liệt kê thông tin
- Cung cấp thông tin chi tiết về giá cả, thời gian, và các thông tin liên quan
- Lên kế hoạch chi tiết về các hoạt động, dịch vụ, và thông tin liên quan nếu người dùng yêu cầu
- Hãy trả lời ngắn gọn lại một chút, nhưng vẫn đủ ý để đỡ tốn context

NỘI DUNG CẦN ĐƯA VÀO:
- Thông tin tổng quan và lịch sử (nếu có)
- Chi tiết về địa điểm, giá cả, giờ mở cửa
- Đánh giá và nhận xét từ du khách
- Tips và kinh nghiệm du lịch thực tế
- Số điện thoại liên hệ khi có thể
- So sánh các lựa chọn nếu phù hợp

ĐỊNH DẠNG TRẢ LỜI:
- Sử dụng Markdown với heading (## ###) rõ ràng
- Dùng bullet points (-) và số thứ tự (1. 2. 3.) cho danh sách
- In đậm (**text**) cho thông tin quan trọng
- Chia thành các section logic, dễ đọc
- Độ dài: Chi tiết, đầy đủ (tối thiểu 500 từ)

NGÔN NGỮ: Tiếng Việt`;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY không tồn tại trong .env');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Build system prompt with memory context if available
   */
  private buildSystemPrompt(memoryContext: FormattedMemoryContext): string {
    if (!memoryContext.hasMemories) {
      return this.baseSystemPrompt;
    }

    return `${this.baseSystemPrompt}

${memoryContext.formattedText}`;
  }

  /**
   * Extract sources from grounding metadata
   */
  private extractSources(metadata: any): SourceInfo[] {
    if (!metadata?.groundingChunks) return [];

    return metadata.groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Unknown',
        uri: chunk.web?.uri || '',
      }))
      .filter((source: SourceInfo) => source.uri);
  }

  /**
   * Stream Deep Research with memory injection
   * @param query - Research query
   * @param userId - Optional user ID for memory retrieval
   * @param sessionId - Optional session ID for memory storage
   */
  async *searchWithStream(
    query: string,
    userId?: string,
    sessionId?: string
  ): AsyncGenerator<DeepResearchStreamEvent> {
    try {
      console.log('🔬 [DeepResearch] Starting deep research:', query);
      if (userId) {
        console.log('👤 [DeepResearch] User ID:', userId);
      }

      yield { type: 'start' };

      // Step 1: Retrieve relevant memories if userId is provided
      let memoryContext: FormattedMemoryContext = {
        hasMemories: false,
        formattedText: '',
        memoriesUsed: 0,
      };

      if (userId) {
        try {
          const memories = await memoryService.retrieveRelevantMemories({
            userId,
            query,
            topK: 3,
            minSimilarity: 0.3,
          });

          if (memories.length > 0) {
            memoryContext = memoryService.formatMemoriesForPrompt(memories);
            console.log(`📚 [DeepResearch] Injecting ${memoryContext.memoriesUsed} memories`);

            // Emit memory event to inform frontend
            yield {
              type: 'memory',
              memoriesUsed: memoryContext.memoriesUsed,
            };
          }
        } catch (memoryError: any) {
          console.warn('⚠️ [DeepResearch] Memory retrieval failed:', memoryError.message);
          // Continue without memory - don't fail the research
        }
      }

      // Step 2: Build system prompt with memory context
      const systemPrompt = this.buildSystemPrompt(memoryContext);

      // Step 3: Execute research
      const responseStream = await this.ai.models.generateContentStream({
        model: this.model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],

          // Try with thinkingBudget but WITHOUT includeThoughts
          thinkingConfig: {
            thinkingBudget: 512,
            includeThoughts: true, // Disabled - may conflict with googleSearch
          },
        },
      });

      let fullContent = '';
      let thinkingContent = '';
      let sources: SourceInfo[] = [];
      let searchQueries: string[] = [];

      for await (const chunk of responseStream) {
        // Handle thinking content (from thinkingBudget)
        if (chunk.candidates?.[0]?.content?.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            // Check if this is a thought part
            if (part.thought) {
              const thoughtText = part.text || '';
              if (thoughtText) {
                thinkingContent += thoughtText;
                yield {
                  type: 'thinking',
                  content: thoughtText,
                };
              }
            }
          }
        }

        // Stream regular text content
        if (chunk.text) {
          fullContent += chunk.text;
          yield {
            type: 'content',
            content: chunk.text,
          };
        }

        // Extract grounding metadata
        const candidate = chunk.candidates?.[0];

        // Debug log to check grounding metadata
        if (candidate) {
          console.log('🔍 [DeepResearch] Candidate metadata:', {
            hasGroundingMetadata: !!candidate.groundingMetadata,
            searchQueries: candidate.groundingMetadata?.webSearchQueries,
            chunksCount: candidate.groundingMetadata?.groundingChunks?.length || 0,
          });
        }

        if (candidate?.groundingMetadata) {
          const metadata = candidate.groundingMetadata;

          // Get search queries (show what AI is searching)
          if (metadata.webSearchQueries && metadata.webSearchQueries.length > 0) {
            const newQueries = metadata.webSearchQueries.filter(
              (q: string) => !searchQueries.includes(q)
            );
            if (newQueries.length > 0) {
              searchQueries.push(...newQueries);
              // Emit search query event
              for (const q of newQueries) {
                yield {
                  type: 'search_query',
                  content: `🔍 Đang tìm kiếm: "${q}"`,
                };
              }
            }
          }

          // Extract sources
          sources = this.extractSources(metadata);
        }
      }

      // Send sources at the end
      if (sources.length > 0 || searchQueries.length > 0) {
        yield {
          type: 'sources',
          sources,
          searchQueries,
        };
      }

      yield { type: 'done' };

      console.log('✅ [DeepResearch] Completed. Content length:', fullContent.length);
      console.log('🧠 [DeepResearch] Thinking length:', thinkingContent.length);
      console.log('📚 [DeepResearch] Sources:', sources.length);
      console.log('🔍 [DeepResearch] Search queries:', searchQueries);

      // Step 4: Store research result as memory (async, don't wait)
      if (userId && fullContent.length > 100) {
        this.storeResearchMemory(userId, sessionId, query, fullContent).catch(err => {
          console.warn('⚠️ [DeepResearch] Failed to store memory:', err.message);
        });
      }

    } catch (error) {
      console.error('❌ [DeepResearch] Stream error:', error);
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Non-streaming Deep Research with memory injection
   * @param query - Research query
   * @param userId - Optional user ID for memory retrieval
   * @param sessionId - Optional session ID for memory storage
   */
  async search(
    query: string,
    userId?: string,
    sessionId?: string
  ): Promise<DeepResearchResult> {
    try {
      console.log('🔬 [DeepResearch] Starting search:', query);

      // Step 1: Retrieve relevant memories if userId is provided
      let memoryContext: FormattedMemoryContext = {
        hasMemories: false,
        formattedText: '',
        memoriesUsed: 0,
      };

      if (userId) {
        try {
          const memories = await memoryService.retrieveRelevantMemories({
            userId,
            query,
            topK: 3,
            minSimilarity: 0.3,
          });

          if (memories.length > 0) {
            memoryContext = memoryService.formatMemoriesForPrompt(memories);
            console.log(`📚 [DeepResearch] Injecting ${memoryContext.memoriesUsed} memories`);
          }
        } catch (memoryError: any) {
          console.warn('⚠️ [DeepResearch] Memory retrieval failed:', memoryError.message);
        }
      }

      // Step 2: Build system prompt with memory context
      const systemPrompt = this.buildSystemPrompt(memoryContext);

      // Step 3: Execute research
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],

          thinkingConfig: {
            thinkingBudget: 512,
            includeThoughts: true,
          },
        },
      });

      const content = response.text || '';
      let thinkingContent = '';
      let sources: SourceInfo[] = [];
      let searchQueries: string[] = [];

      // Extract thinking content
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.thought && part.text) {
            thinkingContent += part.text;
          }
        }
      }

      // Extract grounding metadata
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata) {
        if (metadata.webSearchQueries) {
          searchQueries = metadata.webSearchQueries;
        }
        sources = this.extractSources(metadata);
      }

      console.log('✅ [DeepResearch] Search completed. Content length:', content.length);

      // Step 4: Store research result as memory (async, don't wait)
      if (userId && content.length > 100) {
        this.storeResearchMemory(userId, sessionId, query, content).catch(err => {
          console.warn('⚠️ [DeepResearch] Failed to store memory:', err.message);
        });
      }

      return {
        content,
        thinkingContent,
        sources,
        searchQueries,
        success: true,
        memoriesUsed: memoryContext.memoriesUsed,
      };

    } catch (error) {
      console.error('❌ [DeepResearch] Search error:', error);
      return {
        content: '',
        thinkingContent: '',
        sources: [],
        searchQueries: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store research result as memory (async helper)
   */
  private async storeResearchMemory(
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
      'deep_research'
    );
    console.log('💾 [DeepResearch] Research stored as memory');
  }
}