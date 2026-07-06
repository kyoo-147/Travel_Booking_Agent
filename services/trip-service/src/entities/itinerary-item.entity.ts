import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ItineraryItemType } from '../types';
import { Itinerary } from './itinerary.entity';
import { Booking } from './booking.entity';

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itineraryId: string;

  @Column({
    type: 'enum',
    enum: ItineraryItemType,
  })
  type: ItineraryItemType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb')
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId?: string;
    rating?: number;
    photos?: string[];
  };

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column({ default: 0 })
  duration: number; // minutes

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ default: false })
  bookingRequired: boolean;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: 0 })
  dayIndex: number;

  @Column({ default: 0 })
  sequence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Itinerary, (itinerary) => itinerary.items)
  @JoinColumn({ name: 'itineraryId' })
  itinerary: Itinerary;

  @OneToOne(() => Booking, { nullable: true })
  @JoinColumn()
  booking?: Booking;
}