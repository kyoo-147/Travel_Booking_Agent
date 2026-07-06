import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { ItineraryItem } from './itinerary-item.entity';

@Entity('itineraries')
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @Column('float', { default: 0 })
  totalDistance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  estimatedCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Trip, (trip) => trip.itinerary)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @OneToMany(() => ItineraryItem, (item) => item.itinerary, { cascade: true })
  items: ItineraryItem[];
}