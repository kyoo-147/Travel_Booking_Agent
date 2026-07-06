import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingType, BookingStatus } from '../types';
import { Trip } from './trip.entity';
import { Provider } from './provider.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @Column()
  providerId: string;

  @Column({
    type: 'enum',
    enum: BookingType,
  })
  type: BookingType;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column()
  providerBookingRef: string;

  @Column('jsonb')
  details: any; // BookingDetails - will be typed based on booking type

  @Column('jsonb')
  price: {
    amount: number;
    currency: string;
    breakdown?: {
      base: number;
      taxes: number;
      fees: number;
      discounts: number;
    };
  };

  @Column('jsonb', { nullable: true })
  passengers?: Array<{
    type: 'adult' | 'child' | 'infant';
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    passport?: {
      number: string;
      countryCode: string;
      expiryDate: Date;
    };
  }>;

  @Column({ nullable: true })
  confirmationCode?: string;

  @Column('timestamp', { nullable: true })
  holdExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Trip, (trip) => trip.bookings)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;
}