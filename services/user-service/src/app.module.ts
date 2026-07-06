import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';
import { TravelCompanionController } from './controllers/travel-companion.controller';
import { TravelCompanionService } from './services/travel-companion.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { UserCodeService } from './services/user-code.service';
import { UserProfile } from './entities/user-profile.entity';
import { TravelPreference } from './entities/travel-preference.entity';
import { TravelHistory } from './entities/travel-history.entity';
import { TravelCompanion } from './entities/travel-companion.entity';
import { CompanionInvitation } from './entities/companion-invitation.entity';
import { UserCode } from './entities/user-code.entity';
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './websocket/notification.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'travel_agent_dev'),
        entities: [UserProfile, TravelPreference, TravelHistory, TravelCompanion, CompanionInvitation, UserCode, Notification],
        synchronize: true, // Temporarily enable to sync schema
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserProfile, TravelPreference, TravelHistory, TravelCompanion, CompanionInvitation, UserCode, Notification]),
  ],
  controllers: [UserProfileController, TravelCompanionController, NotificationController],
  providers: [UserProfileService, TravelCompanionService, NotificationService, UserCodeService, NotificationGateway],
  exports: [UserProfileService, TravelCompanionService, NotificationService, UserCodeService],
})
export class AppModule { }