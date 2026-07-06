import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Booking } from '../entities/booking.entity';
import { TravelCompanion } from '../entities/travel-companion.entity';
import { 
  TravelAnalyticsDto, 
  TravelPatternDto, 
  TravelGoalDto,
  MonthlySpendingDto,
  TopDestinationDto,
  TravelInsightDto
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(TravelCompanion)
    private companionRepository: Repository<TravelCompanion>,
  ) {}

  async getTravelAnalytics(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TravelAnalyticsDto> {
    // For demo purposes, return mock data since we don't have real trip data
    return this.getMockTravelAnalytics();
  }

  private getMockTravelAnalytics(): TravelAnalyticsDto {
    return {
      totalTrips: 12,
      totalSpending: 25000,
      avgTripCost: 2083,
      countriesVisited: 8,
      totalCarbonFootprint: 4.2,
      travelStyles: {
        budget: 25,
        comfort: 45,
        luxury: 20,
        adventure: 10
      },
      companionStats: {
        solo: 40,
        family: 30,
        friends: 25,
        colleagues: 5
      },
      carbonFootprint: [
        { month: 'Jan', kgCO2: 350 },
        { month: 'Feb', kgCO2: 280 },
        { month: 'Mar', kgCO2: 420 },
        { month: 'Apr', kgCO2: 380 },
        { month: 'May', kgCO2: 310 },
        { month: 'Jun', kgCO2: 450 }
      ],
      monthlyPatterns: [
        { month: 'Jan', count: 1 },
        { month: 'Mar', count: 2 },
        { month: 'Jun', count: 2 },
        { month: 'Sep', count: 1 },
        { month: 'Dec', count: 1 }
      ],
      topDestinations: [
        { destination: 'Tokyo, Japan', visitCount: 3, totalSpent: 8500, avgRating: 4.8 },
        { destination: 'Rome, Italy', visitCount: 2, totalSpent: 4200, avgRating: 4.6 },
        { destination: 'Bangkok, Thailand', visitCount: 2, totalSpent: 3100, avgRating: 4.5 }
      ],
      monthlySpending: [
        { month: 'Jan', amount: 2100, tripCount: 1 },
        { month: 'Feb', amount: 1800, tripCount: 1 },
        { month: 'Mar', amount: 3200, tripCount: 2 },
        { month: 'Apr', amount: 2800, tripCount: 1 },
        { month: 'May', amount: 2400, tripCount: 1 },
        { month: 'Jun', amount: 3500, tripCount: 2 }
      ],
      insights: [
        { 
          type: 'positive', 
          title: 'Tiết kiệm hiệu quả', 
          description: 'Bạn đã tiết kiệm 15% so với năm trước',
          recommendation: 'Tiếp tục duy trì thói quen chi tiêu hợp lý'
        },
        { 
          type: 'positive', 
          title: 'Khám phá Châu Á', 
          description: 'Châu Á là điểm đến yêu thích nhất của bạn',
          recommendation: 'Thử khám phá các quốc gia mới trong khu vực'
        },
        { 
          type: 'positive', 
          title: 'Thân thiện môi trường', 
          description: 'Carbon footprint đã giảm 8% nhờ chọn phương tiện thân thiện môi trường',
          recommendation: 'Tiếp tục ưu tiên các phương tiện di chuyển xanh'
        }
      ]
    };
  }

  async getTravelPatterns(userId: string, year: number): Promise<TravelPatternDto[]> {
    // Mock data for patterns with correct TravelPatternDto structure
    return [
      {
        id: '1',
        userId: userId,
        patternType: 'seasonal',
        pattern: 'Winter travel preference',
        frequency: 1,
        confidence: 85,
        recommendation: 'Consider booking winter destinations early for better deals',
        createdAt: new Date()
      },
      {
        id: '2',
        userId: userId,
        patternType: 'budget',
        pattern: 'Moderate budget traveler',
        frequency: 2,
        confidence: 75,
        recommendation: 'Look for mid-range accommodations with good reviews',
        createdAt: new Date()
      }
    ];
  }

  async getTravelGoals(userId: string): Promise<TravelGoalDto[]> {
    // Mock data for goals with correct TravelGoalDto structure
    return [
      {
        id: '1',
        userId: userId,
        title: 'Visit 5 New Countries',
        targetValue: 5,
        currentValue: 3,
        unit: 'countries',
        deadline: new Date('2025-12-31'),
        status: 'active',
        createdAt: new Date()
      },
      {
        id: '2',
        userId: userId, 
        title: 'Reduce Carbon Footprint',
        targetValue: 20,
        currentValue: 8,
        unit: 'percentage',
        deadline: new Date('2025-12-31'),
        status: 'active',
        createdAt: new Date()
      }
    ];
  }

  async getSpendingTrends(userId: string, months: number): Promise<MonthlySpendingDto[]> {
    // Mock spending trends data with correct structure
    const mockData = [
      { month: 'Jan', amount: 2100, tripCount: 1 },
      { month: 'Feb', amount: 1800, tripCount: 1 },
      { month: 'Mar', amount: 3200, tripCount: 2 },
      { month: 'Apr', amount: 2800, tripCount: 1 },
      { month: 'May', amount: 2400, tripCount: 1 },
      { month: 'Jun', amount: 3500, tripCount: 2 },
      { month: 'Jul', amount: 4200, tripCount: 2 },
      { month: 'Aug', amount: 3800, tripCount: 2 },
      { month: 'Sep', amount: 2600, tripCount: 1 },
      { month: 'Oct', amount: 3100, tripCount: 1 },
      { month: 'Nov', amount: 2900, tripCount: 1 },
      { month: 'Dec', amount: 3400, tripCount: 2 }
    ];
    return mockData.slice(-months);
  }

  async getDestinationStats(userId: string, limit: number = 10): Promise<TopDestinationDto[]> {
    // Mock destination stats with correct structure
    return [
      { destination: 'Tokyo, Japan', visitCount: 3, totalSpent: 8500, avgRating: 4.8 },
      { destination: 'Rome, Italy', visitCount: 2, totalSpent: 4200, avgRating: 4.6 },
      { destination: 'Bangkok, Thailand', visitCount: 2, totalSpent: 3100, avgRating: 4.5 },
      { destination: 'Paris, France', visitCount: 1, totalSpent: 2800, avgRating: 4.7 },
      { destination: 'Barcelona, Spain', visitCount: 1, totalSpent: 2400, avgRating: 4.4 }
    ].slice(0, limit);
  }

  async getCarbonFootprint(userId: string, year: number): Promise<{ totalEmissions: number; byTransport: any[] }> {
    return {
      totalEmissions: 4.2,
      byTransport: [
        { type: 'flight', emissions: 3.2, percentage: 76 },
        { type: 'train', emissions: 0.6, percentage: 14 },
        { type: 'car', emissions: 0.4, percentage: 10 }
      ]
    };
  }

  async getTravelInsights(userId: string): Promise<TravelInsightDto[]> {
    return [
      { 
        type: 'positive', 
        title: 'Tiết kiệm hiệu quả', 
        description: 'Bạn đã tiết kiệm 15% so với năm trước',
        recommendation: 'Tiếp tục duy trì thói quen chi tiêu hợp lý'
      },
      { 
        type: 'positive', 
        title: 'Khám phá Châu Á', 
        description: 'Châu Á là điểm đến yêu thích nhất của bạn',
        recommendation: 'Thử khám phá các quốc gia mới trong khu vực'
      },
      { 
        type: 'positive', 
        title: 'Thân thiện môi trường', 
        description: 'Carbon footprint đã giảm 8% nhờ chọn phương tiện thân thiện môi trường',
        recommendation: 'Tiếp tục ưu tiên các phương tiện di chuyển xanh'
      },
      { 
        type: 'neutral', 
        title: 'Xu hướng theo mùa', 
        description: 'Bạn thích đi du lịch vào mùa xuân và mùa thu',
        recommendation: 'Cân nhắc trải nghiệm các mùa khác để đa dạng hóa'
      },
      { 
        type: 'neutral', 
        title: 'Chi phí ổn định', 
        description: 'Chi phí trung bình mỗi chuyến đi đã tăng 12%',
        recommendation: 'Theo dõi và lập kế hoạch ngân sách chi tiết hơn'
      }
    ];
  }
}