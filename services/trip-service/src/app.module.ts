import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripController } from './controllers/trip.controller';
import { TripService } from './services/trip.service';
import { Trip } from './entities/trip.entity';
import { Itinerary } from './entities/itinerary.entity';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Booking } from './entities/booking.entity';
import { Provider } from './entities/provider.entity';
import { User } from './entities/user.entity';
import { TravelCompanion } from './entities/travel-companion.entity';
import { TripNote } from './entities/trip-note.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatSessionEntry } from './entities/chat-session.entity';
import { ChatMessageEntry } from './entities/chat-message.entity';
import { BookingConversation } from './entities/booking-conversation.entity';

// import { ZaloWebhookController } from './controllers/zalo-webhook.controller';
// import { ZaloBookingService } from './services/zalo-booking.service'; // TODO: Refactor to new schema
import { BookingConversationController } from './controllers/booking-conversation.controller';
import { AgentBookingController } from './controllers/agent-booking.controller';
import { AgentBookingService } from './services/agent-booking.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT') || '5432'),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'travel_agent_dev'),
        entities: [Trip, Itinerary, ItineraryItem, Booking, Provider, User, TravelCompanion, ChatSessionEntry, ChatMessageEntry, BookingConversation, TripNote],
        synchronize: true, // Only for development
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Trip, Itinerary, ItineraryItem, Booking, Provider, User, TravelCompanion, ChatSessionEntry, ChatMessageEntry, BookingConversation, TripNote]),
    AnalyticsModule,
  ],
  controllers: [TripController, ChatController, /* ZaloWebhookController, */ BookingConversationController, AgentBookingController],
  providers: [TripService, ChatService, /* ZaloBookingService, */ AgentBookingService],
})
export class AppModule { }