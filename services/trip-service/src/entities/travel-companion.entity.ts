import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum CompanionRelationship {
  FAMILY = 'family',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
}

export enum CompanionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  BLOCKED = 'blocked',
}

@Entity('travel_companions')
export class TravelCompanion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  companionId: string;

  @Column({
    type: 'enum',
    enum: CompanionRelationship,
    default: CompanionRelationship.FRIEND,
  })
  relationship: CompanionRelationship;

  @Column({
    type: 'enum',
    enum: CompanionStatus,
    default: CompanionStatus.PENDING,
  })
  status: CompanionStatus;

  @Column({ default: 0 })
  sharedTrips: number;

  @Column('timestamp', { nullable: true })
  lastTripDate?: Date;

  @Column('jsonb', { nullable: true })
  aiPersonalNotes?: {
    compatibilityScore: number;
    travelPreferences: string[];
    conflictPoints: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;
}