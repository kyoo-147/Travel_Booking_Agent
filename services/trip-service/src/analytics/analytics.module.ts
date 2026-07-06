import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Trip } from '../entities/trip.entity';
import { Booking } from '../entities/booking.entity';
import { TravelCompanion } from '../entities/travel-companion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Booking, TravelCompanion])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}