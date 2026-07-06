import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TravelStyle, HotelClass, AccessibilityNeeds } from '../types';
import { Trip } from './trip.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  facebookId?: string;

  @Column('jsonb', { default: {} })
  preferences: {
    budgetRange: {
      min: number;
      max: number;
      currency: string;
    };
    travelStyle: TravelStyle[];
    preferredAirlines?: string[];
    hotelClass: HotelClass;
    dietaryRestrictions?: string[];
    accessibility?: AccessibilityNeeds[];
    language: string;
    currency: string;
    timezone: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];
}