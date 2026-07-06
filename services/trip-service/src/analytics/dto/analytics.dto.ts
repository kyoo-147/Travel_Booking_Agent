import { ApiProperty } from '@nestjs/swagger';

export class MonthlySpendingDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  tripCount: number;
}

export class TopDestinationDto {
  @ApiProperty()
  destination: string;

  @ApiProperty()
  visitCount: number;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  avgRating: number;
}

export class TravelStylesDto {
  @ApiProperty()
  budget: number;

  @ApiProperty()
  comfort: number;

  @ApiProperty()
  luxury: number;

  @ApiProperty()
  adventure: number;
}

export class CompanionStatsDto {
  @ApiProperty()
  solo: number;

  @ApiProperty()
  family: number;

  @ApiProperty()
  friends: number;

  @ApiProperty()
  colleagues: number;
}

export class CarbonFootprintDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  kgCO2: number;
}

export class MonthlyPatternsDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  count: number;
}

export class TravelInsightDto {
  @ApiProperty()
  type: 'positive' | 'negative' | 'neutral';

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  recommendation?: string;
}

export class TravelAnalyticsDto {
  @ApiProperty()
  totalTrips: number;

  @ApiProperty()
  totalSpending: number;

  @ApiProperty()
  avgTripCost: number;

  @ApiProperty()
  countriesVisited: number;

  @ApiProperty()
  totalCarbonFootprint: number;

  @ApiProperty({ type: [MonthlySpendingDto] })
  monthlySpending: MonthlySpendingDto[];

  @ApiProperty({ type: [TopDestinationDto] })
  topDestinations: TopDestinationDto[];

  @ApiProperty({ type: TravelStylesDto })
  travelStyles: TravelStylesDto;

  @ApiProperty({ type: CompanionStatsDto })
  companionStats: CompanionStatsDto;

  @ApiProperty({ type: [CarbonFootprintDto] })
  carbonFootprint: CarbonFootprintDto[];

  @ApiProperty({ type: [MonthlyPatternsDto] })
  monthlyPatterns: MonthlyPatternsDto[];

  @ApiProperty({ type: [TravelInsightDto] })
  insights: TravelInsightDto[];
}

export class TravelPatternDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  patternType: 'seasonal' | 'budget' | 'destination' | 'duration';

  @ApiProperty()
  pattern: string;

  @ApiProperty()
  frequency: number;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  recommendation: string;

  @ApiProperty()
  createdAt: Date;
}

export class TravelGoalDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  targetValue: number;

  @ApiProperty()
  currentValue: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  deadline: Date;

  @ApiProperty()
  status: 'active' | 'completed' | 'paused';

  @ApiProperty()
  createdAt: Date;
}