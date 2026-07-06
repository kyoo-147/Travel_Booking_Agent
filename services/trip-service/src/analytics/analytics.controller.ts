import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TravelAnalyticsDto, TravelPatternDto, TravelGoalDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('travel/:userId')
  @ApiOperation({ summary: 'Get travel analytics for user' })
  @ApiResponse({ status: 200, description: 'Travel analytics retrieved successfully', type: TravelAnalyticsDto })
  async getTravelAnalytics(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TravelAnalyticsDto> {
    return this.analyticsService.getTravelAnalytics(userId, startDate, endDate);
  }

  @Get('patterns/:userId')
  @ApiOperation({ summary: 'Get travel patterns for user' })
  @ApiResponse({ status: 200, description: 'Travel patterns retrieved successfully', type: [TravelPatternDto] })
  async getTravelPatterns(
    @Param('userId') userId: string,
    @Query('year') year: string = '2024'
  ): Promise<TravelPatternDto[]> {
    return this.analyticsService.getTravelPatterns(userId, parseInt(year));
  }

  @Get('goals/:userId')
  @ApiOperation({ summary: 'Get travel goals for user' })
  @ApiResponse({ status: 200, description: 'Travel goals retrieved successfully', type: [TravelGoalDto] })
  async getTravelGoals(@Param('userId') userId: string): Promise<TravelGoalDto[]> {
    return this.analyticsService.getTravelGoals(userId);
  }

  @Get('spending-trends/:userId')
  @ApiOperation({ summary: 'Get spending trends for user' })
  async getSpendingTrends(
    @Param('userId') userId: string,
    @Query('months') months: string = '12'
  ) {
    return this.analyticsService.getSpendingTrends(userId, parseInt(months));
  }

  @Get('destinations/:userId')
  @ApiOperation({ summary: 'Get destination statistics for user' })
  async getDestinationStats(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '10'
  ) {
    return this.analyticsService.getDestinationStats(userId, parseInt(limit));
  }

  @Get('carbon-footprint/:userId')
  @ApiOperation({ summary: 'Get carbon footprint analytics for user' })
  async getCarbonFootprint(
    @Param('userId') userId: string,
    @Query('year') year: string = '2024'
  ) {
    return this.analyticsService.getCarbonFootprint(userId, parseInt(year));
  }

  @Get('insights/:userId')
  @ApiOperation({ summary: 'Get AI-generated travel insights for user' })
  async getTravelInsights(@Param('userId') userId: string) {
    return this.analyticsService.getTravelInsights(userId);
  }
}