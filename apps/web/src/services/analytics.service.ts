import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003/api';

export interface TravelAnalytics {
  totalTrips: number;
  totalSpending: number;
  avgTripCost: number;
  countriesVisited: number;
  totalCarbonFootprint: number;
  
  monthlySpending: {
    month: string;
    amount: number;
    tripCount: number;
  }[];
  
  topDestinations: {
    destination: string;
    visitCount: number;
    totalSpent: number;
    avgRating: number;
  }[];
  
  travelStyles: {
    budget: number;
    comfort: number;
    luxury: number;
    adventure: number;
  };
  
  companionStats: {
    solo: number;
    family: number;
    friends: number;
    colleagues: number;
  };
  
  carbonFootprint: {
    month: string;
    kgCO2: number;
  }[];
  
  monthlyPatterns: {
    month: string;
    count: number;
  }[];
  
  insights: {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    recommendation?: string;
  }[];
}

export interface TravelPattern {
  id: string;
  userId: string;
  patternType: 'seasonal' | 'budget' | 'destination' | 'duration';
  pattern: string;
  frequency: number;
  confidence: number;
  recommendation: string;
  createdAt: Date;
}

export interface TravelGoal {
  id: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

class AnalyticsService {
  private getAuthHeaders() {
    const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
    return {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getTravelAnalytics(userId: string, startDate: string, endDate: string): Promise<TravelAnalytics> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/travel/${userId}`,
        {
          params: { startDate, endDate }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching travel analytics:', error);
      // Return mock data for development
      return this.getMockAnalytics();
    }
  }

  async getTravelPatterns(userId: string): Promise<TravelPattern[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/patterns/${userId}`,
        {
          params: { year: 2024 }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching travel patterns:', error);
      return [];
    }
  }

  async getTravelGoals(userId: string): Promise<TravelGoal[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/goals/${userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching travel goals:', error);
      return [];
    }
  }

  async generateInsights(userId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/analytics/generate-insights/${userId}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }

  // Mock data for development
  private getMockAnalytics(): TravelAnalytics {
    return {
      totalTrips: 8,
      totalSpending: 15600,
      avgTripCost: 1950,
      countriesVisited: 5,
      totalCarbonFootprint: 2340,
      
      monthlySpending: [
        { month: '2024-01', amount: 2100, tripCount: 1 },
        { month: '2024-02', amount: 0, tripCount: 0 },
        { month: '2024-03', amount: 3200, tripCount: 2 },
        { month: '2024-04', amount: 1800, tripCount: 1 },
        { month: '2024-05', amount: 0, tripCount: 0 },
        { month: '2024-06', amount: 4200, tripCount: 2 },
        { month: '2024-07', amount: 2300, tripCount: 1 },
        { month: '2024-08', amount: 0, tripCount: 0 },
        { month: '2024-09', amount: 2000, tripCount: 1 },
        { month: '2024-10', amount: 0, tripCount: 0 },
        { month: '2024-11', amount: 0, tripCount: 0 },
        { month: '2024-12', amount: 0, tripCount: 0 },
      ],
      
      topDestinations: [
        { destination: 'Tokyo, Japan', visitCount: 2, totalSpent: 4200, avgRating: 4.8 },
        { destination: 'Paris, France', visitCount: 1, totalSpent: 3200, avgRating: 4.9 },
        { destination: 'Seoul, South Korea', visitCount: 2, totalSpent: 3100, avgRating: 4.7 },
        { destination: 'Bangkok, Thailand', visitCount: 1, totalSpent: 1800, avgRating: 4.5 },
        { destination: 'Singapore', visitCount: 2, totalSpent: 3300, avgRating: 4.6 },
      ],
      
      travelStyles: {
        budget: 25,
        comfort: 50,
        luxury: 15,
        adventure: 10,
      },
      
      companionStats: {
        solo: 40,
        family: 30,
        friends: 25,
        colleagues: 5,
      },
      
      carbonFootprint: [
        { month: '2024-01', kgCO2: 420 },
        { month: '2024-02', kgCO2: 0 },
        { month: '2024-03', kgCO2: 680 },
        { month: '2024-04', kgCO2: 320 },
        { month: '2024-05', kgCO2: 0 },
        { month: '2024-06', kgCO2: 580 },
        { month: '2024-07', kgCO2: 340 },
        { month: '2024-08', kgCO2: 0 },
        { month: '2024-09', kgCO2: 0 },
        { month: '2024-10', kgCO2: 0 },
        { month: '2024-11', kgCO2: 0 },
        { month: '2024-12', kgCO2: 0 },
      ],
      
      monthlyPatterns: [
        { month: 'Jan', count: 1 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 2 },
        { month: 'Apr', count: 1 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 2 },
        { month: 'Jul', count: 1 },
        { month: 'Aug', count: 0 },
        { month: 'Sep', count: 1 },
        { month: 'Oct', count: 0 },
        { month: 'Nov', count: 0 },
        { month: 'Dec', count: 0 },
      ],
      
      insights: [
        {
          type: 'positive',
          title: 'Xu hướng du lịch tích cực',
          description: 'Bạn đã tăng 25% số chuyến đi so với năm trước, cho thấy sự quan tâm đến trải nghiệm du lịch.',
          recommendation: 'Hãy thử khám phá những điểm đến mới trong khu vực Đông Nam Á'
        },
        {
          type: 'neutral',
          title: 'Thói quen chi tiêu ổn định',
          description: 'Chi tiêu trung bình $1,950/chuyến, phù hợp với phân khúc comfort travel.',
          recommendation: 'Có thể tối ưu chi phí bằng cách đặt trước và tận dụng các ưu đãi'
        },
        {
          type: 'negative',
          title: 'Carbon footprint cao',
          description: 'Lượng phát thải CO₂ từ du lịch của bạn cao hơn 15% so với mức khuyến nghị.',
          recommendation: 'Cân nhắc chọn phương tiện di chuyển thân thiện môi trường hơn'
        },
        {
          type: 'positive',
          title: 'Đa dạng điểm đến',
          description: 'Bạn đã khám phá 5 quốc gia khác nhau, cho thấy sự cởi mở với văn hóa mới.',
          recommendation: 'Hãy thử trải nghiệm các tour văn hóa địa phương sâu hơn'
        }
      ]
    };
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  calculateCarbonFootprint(distance: number, transportType: string): number {
    // CO2 emission factors (kg CO2 per km per person)
    const emissionFactors: Record<string, number> = {
      flight: 0.255,
      car: 0.171,
      train: 0.041,
      bus: 0.089,
    };
    
    return (distance * (emissionFactors[transportType] || 0.2));
  }

  calculateTripDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const analyticsService = new AnalyticsService();