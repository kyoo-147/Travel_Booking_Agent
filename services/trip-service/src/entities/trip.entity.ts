import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TripStatus } from '../types';
import { User } from './user.entity';
import { Itinerary } from './itinerary.entity';
import { Booking } from './booking.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.DRAFT,
  })
  status: TripStatus;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column('jsonb')
  destination: {
    country: string;
    city: string;
    region?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  @Column({ default: 1 })
  participants: number;

  @Column('jsonb')
  budget: {
    total: number;
    currency: string;
    breakdown: {
      flights: number;
      accommodation: number;
      activities: number;
      food: number;
      transport: number;
      other: number;
    };
  };

  @Column('jsonb', { default: {} })
  preferences: {
    pace: 'relaxed' | 'moderate' | 'packed';
    interests: string[];
    mustSee: string[];
    avoidances: string[];
  };

  // Agent booking integration
  @Column({ default: 'manual' })
  source: 'manual' | 'agent_booking' | 'api_import';

  @Column({ nullable: true })
  agent_booking_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.trips)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Itinerary, (itinerary) => itinerary.trip, { cascade: true })
  itinerary: Itinerary;

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}