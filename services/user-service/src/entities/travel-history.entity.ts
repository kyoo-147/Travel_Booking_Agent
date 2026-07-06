import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TripStatus {
  DRAFT = 'draft',
  PLANNED = 'planned', 
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('travel_history')
export class TravelHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userProfileId: string;

  @Column()
  tripName: string;

  @Column('text', { array: true })
  destinations: string[];

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  participants: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.DRAFT
  })
  status: TripStatus;

  @Column({ type: 'int', nullable: true, default: 0 })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Trip details, bookings, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}