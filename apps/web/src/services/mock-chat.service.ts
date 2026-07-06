import { ChatResponse, ChatRequest, QuickAction } from './chat.service';

// Mock responses in Vietnamese and English
const mockResponses = {
  en: {
    greeting: "Hello! 👋 I'm your AI Travel Assistant. I can help you plan trips, find destinations, book flights and hotels, and answer any travel questions. What would you like to explore today?",
    tripPlanning: "I'd love to help you plan an amazing trip! 🗺️ To get started, could you tell me:\n\n• Where would you like to go?\n• When are you planning to travel?\n• How many people will be traveling?\n• What's your approximate budget?\n\nOnce I have these details, I can create a personalized itinerary just for you!",
    hotelSearch: "I can help you find the perfect place to stay! 🏨 What city or area are you looking for hotels in? Also, let me know your preferred dates, budget range, and any specific amenities you'd like.",
    flightSearch: "Looking for flights? ✈️ I can help you find the best deals! Please tell me your departure city, destination, travel dates, number of passengers, and class preference.",
    bookingCheck: "Let me check your bookings for you! 📋 I found your recent reservations:",
    recommendations: "Based on your preferences, here are some great recommendations! ⭐",
    default: "That's interesting! I'm here to help with all your travel needs. Feel free to ask me about destinations, trip planning, budgets, bookings, or any travel-related questions."
  },
  vi: {
    greeting: "Xin chào! 👋 Tôi là Trợ lý Du lịch AI của bạn. Tôi có thể giúp bạn lên kế hoạch du lịch, tìm điểm đến, đặt vé máy bay và khách sạn, và trả lời các câu hỏi về du lịch. Hôm nay bạn muốn khám phá điều gì?",
    tripPlanning: "Tôi rất muốn giúp bạn lên kế hoạch cho một chuyến đi tuyệt vời! 🗺️ Để bắt đầu, bạn có thể cho tôi biết:\n\n• Bạn muốn đi đâu?\n• Bạn dự định đi du lịch khi nào?\n• Có bao nhiêu người sẽ đi cùng?\n• Ngân sách dự kiến của bạn là bao nhiêu?\n\nKhi có những thông tin này, tôi có thể tạo một lịch trình cá nhân hóa dành riêng cho bạn!",
    hotelSearch: "Tôi có thể giúp bạn tìm nơi ở hoàn hảo! 🏨 Bạn đang tìm khách sạn ở thành phố hoặc khu vực nào? Cũng cho tôi biết ngày dự kiến, ngân sách và các tiện ích mong muốn.",
    flightSearch: "Đang tìm vé máy bay? ✈️ Tôi có thể giúp bạn tìm những ưu đãi tốt nhất! Vui lòng cho tôi biết thành phố khởi hành, điểm đến, ngày đi, số hành khách và hạng vé mong muốn.",
    bookingCheck: "Để tôi kiểm tra đặt phòng của bạn nhé! 📋 Tôi đã tìm thấy các đặt phòng gần đây của bạn:",
    recommendations: "Dựa trên sở thích của bạn, đây là một số gợi ý tuyệt vời! ⭐",
    default: "Thật thú vị! Tôi ở đây để giúp đỡ tất cả nhu cầu du lịch của bạn. Hãy thoải mái hỏi tôi về điểm đến, lập kế hoạch du lịch, ngân sách, đặt phòng hoặc bất kỳ câu hỏi nào liên quan đến du lịch."
  }
};

// NLU Intent classification
const classifyIntent = (text: string, language: string = 'en'): string => {
  const lowerText = text.toLowerCase();
  
  // Greeting patterns
  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || 
      lowerText.includes('xin chào') || lowerText.includes('chào') || lowerText.includes('halo')) {
    return 'greeting';
  }
  
  // Trip planning patterns
  if (lowerText.includes('trip') || lowerText.includes('plan') || lowerText.includes('vacation') ||
      lowerText.includes('chuyến đi') || lowerText.includes('kế hoạch') || lowerText.includes('du lịch') ||
      lowerText.includes('lập kế hoạch')) {
    return 'tripPlanning';
  }
  
  // Hotel search patterns
  if (lowerText.includes('hotel') || lowerText.includes('accommodation') || lowerText.includes('stay') ||
      lowerText.includes('khách sạn') || lowerText.includes('nơi ở') || lowerText.includes('phòng')) {
    return 'hotelSearch';
  }
  
  // Flight search patterns
  if (lowerText.includes('flight') || lowerText.includes('airline') || lowerText.includes('fly') ||
      lowerText.includes('máy bay') || lowerText.includes('vé') || lowerText.includes('bay')) {
    return 'flightSearch';
  }
  
  // Booking check patterns
  if (lowerText.includes('booking') || lowerText.includes('reservation') || lowerText.includes('check') ||
      lowerText.includes('đặt phòng') || lowerText.includes('kiểm tra') || lowerText.includes('booking')) {
    return 'bookingCheck';
  }
  
  // Recommendations patterns
  if (lowerText.includes('recommend') || lowerText.includes('suggest') || lowerText.includes('advice') ||
      lowerText.includes('gợi ý') || lowerText.includes('đề xuất') || lowerText.includes('tư vấn')) {
    return 'recommendations';
  }
  
  return 'default';
};

// Generate response based on intent
const generateResponse = (intent: string, language: string = 'en'): string => {
  const responses = mockResponses[language as keyof typeof mockResponses] || mockResponses.en;
  return responses[intent as keyof typeof responses] || responses.default;
};

// Mock chat service
export const mockChatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const { message, language = 'en' } = request;
    
    // Classify intent
    const intent = classifyIntent(message, language);
    
    // Generate response content
    const content = generateResponse(intent, language);
    
    // Determine response type and additional data
    let type: ChatResponse['type'] = 'text';
    let data = null;
    let suggestions: string[] = [];

    switch (intent) {
      case 'tripPlanning':
        type = 'trip_suggestion';
        data = {
          destination: language === 'vi' ? 'Hà Nội, Việt Nam' : 'Tokyo, Japan',
          duration: language === 'vi' ? '5 ngày' : '7 days',
          budget: language === 'vi' ? '15-25 triệu VND' : '$2,500-3,500',
          highlights: language === 'vi' 
            ? ['Hồ Hoàn Kiếm', 'Phố cổ Hà Nội', 'Văn Miếu', 'Chùa Một Cột']
            : ['Shibuya Crossing', 'Mount Fuji', 'Traditional Temples', 'Cherry Blossoms']
        };
        suggestions = language === 'vi' 
          ? ['Tìm khách sạn ở Hà Nội', 'Xem giá vé máy bay', 'Các địa điểm tham quan']
          : ['Find hotels in Tokyo', 'Check flight prices', 'Show attractions'];
        break;

      case 'bookingCheck':
        type = 'booking_info';
        data = {
          bookings: language === 'vi' ? [
            { id: 'FL001', type: 'Vé máy bay', destination: 'Đà Nẵng', date: '15/03/2024', status: 'Đã xác nhận' },
            { id: 'HT001', type: 'Khách sạn', name: 'Sunrise Resort', date: '15/03/2024', status: 'Đã xác nhận' }
          ] : [
            { id: 'FL001', type: 'Flight', destination: 'Da Nang', date: '2024-03-15', status: 'Confirmed' },
            { id: 'HT001', type: 'Hotel', name: 'Sunrise Resort', date: '2024-03-15', status: 'Confirmed' }
          ]
        };
        break;

      case 'hotelSearch':
      case 'flightSearch':
        suggestions = language === 'vi'
          ? ['Tìm theo giá', 'Lọc theo tiện ích', 'Xem đánh giá']
          : ['Search by price', 'Filter by amenities', 'View reviews'];
        break;

      case 'recommendations':
        type = 'trip_suggestion';
        data = {
          destinations: language === 'vi' ? [
            { name: 'Việt Nam', highlights: ['Phở Bò', 'Vịnh Hạ Long', 'Phố cổ'] },
            { name: 'Nhật Bản', highlights: ['Hoa anh đào', 'Núi Phú Sĩ', 'Văn hóa'] },
            { name: 'Thái Lan', highlights: ['Bãi biển', 'Chùa chiền', 'Ẩm thực đường phố'] }
          ] : [
            { name: 'Vietnam', highlights: ['Pho Bo', 'Ha Long Bay', 'Ancient Towns'] },
            { name: 'Japan', highlights: ['Cherry Blossoms', 'Mount Fuji', 'Culture'] },
            { name: 'Thailand', highlights: ['Beaches', 'Temples', 'Street Food'] }
          ]
        };
        break;
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      type,
      data,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  },

  async getQuickActions(language: string = 'en'): Promise<QuickAction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
      },
      {
        id: 'check-booking',
        label: 'Kiểm tra đặt phòng của tôi',
        action: 'CHECK_BOOKING'
      },
      {
        id: 'get-recommendations',
        label: 'Nhận gợi ý',
        action: 'GET_RECOMMENDATIONS'
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
      },
      {
        id: 'check-booking',
        label: 'Check my bookings',
        action: 'CHECK_BOOKING'
      },
      {
        id: 'get-recommendations',
        label: 'Get recommendations',
        action: 'GET_RECOMMENDATIONS'
      }
    ];
  },

  async executeQuickAction(actionId: string, data?: any): Promise<ChatResponse> {
    console.log('Mock service executing action:', actionId, data);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    let response: ChatResponse;
    
    switch (actionId) {
      case 'plan-trip':
        response = {
          id: Date.now().toString(),
          content: "I'd be happy to help you plan a trip! Let me start by asking a few questions to create the perfect itinerary for you.",
          type: 'text',
          suggestions: ['Where do you want to go?', 'When are you planning to travel?', 'What\'s your budget?']
        };
        break;
        
      case 'find-destination':
        response = {
          id: Date.now().toString(),
          content: "Here are some amazing destinations I recommend based on current trends and user preferences:",
          type: 'trip_suggestion',
          data: {
            destinations: [
              { name: 'Vietnam', highlights: ['Pho Bo', 'Ha Long Bay', 'Ancient Towns'] },
              { name: 'Japan', highlights: ['Cherry Blossoms', 'Mount Fuji', 'Culture'] },
              { name: 'Thailand', highlights: ['Beaches', 'Temples', 'Street Food'] }
            ]
          }
        };
        break;
        
      case 'check-booking':
        response = {
          id: Date.now().toString(),
          content: "Here are your recent bookings:",
          type: 'booking_info',
          data: {
            bookings: [
              { id: 'FL001', type: 'Flight', destination: 'Da Nang', date: '2024-03-15', status: 'Confirmed' },
              { id: 'HT001', type: 'Hotel', name: 'Sunrise Resort', date: '2024-03-15', status: 'Confirmed' }
            ]
          }
        };
        break;
        
      default:
        response = {
          id: Date.now().toString(),
          content: "I can help you with that! What specifically would you like recommendations for?",
          type: 'text'
        };
    }
    
    return response;
  }
};