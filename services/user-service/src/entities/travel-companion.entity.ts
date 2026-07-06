import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { UserProfile } from './user-profile.entity';

export enum RelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

export enum CurrentStatus {
  ONLINE = 'online',
  TRAVELING = 'traveling',
  OFFLINE = 'offline'
}

export enum UserRole {
  PRIMARY = 'primary',
  COMPANION = 'companion'
}

export enum MobilityLevel {
  LOW_WALKING = 'low_walking',
  MEDIUM_WALKING = 'medium_walking',
  HIGH_WALKING = 'high_walking'
}

export interface TravelPreferences {
  foodStyle: string[];
  activityLevel: 'low' | 'medium' | 'high';
  budgetRange: string;
}

export interface AIPersonalNotes {
  foodPreferences: string[];
  mobilityLevel: MobilityLevel;
  travelHabits: string[];
  conflictPoints?: string[];
  compatibilityScore?: number;
}

@Entity('travel_companions')
export class TravelCompanion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User who owns this companion relationship
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserProfile, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserProfile;

  // The companion user
  @Column({ name: 'companion_id', type: 'uuid' })
  companionId: string;

  @ManyToOne(() => UserProfile, { nullable: true })
  @JoinColumn({ name: 'companion_id' })
  companion: UserProfile;

  @Column({
    type: 'enum',
    enum: RelationshipType,
    default: RelationshipType.FRIEND
  })
  relationship: RelationshipType;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus;

  @Column({
    type: 'enum',
    enum: CurrentStatus,
    default: CurrentStatus.OFFLINE
  })
  currentStatus: CurrentStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COMPANION
  })
  role: UserRole;

  @Column({ type: 'int', default: 0 })
  sharedTrips: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTripDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  travelPreferences: TravelPreferences;

  @Column({ type: 'jsonb', nullable: true })
  aiPersonalNotes: AIPersonalNotes;

  @Column({ nullable: true })
  invitationMessage: string;

  @CreateDateColumn()
  connectionDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}