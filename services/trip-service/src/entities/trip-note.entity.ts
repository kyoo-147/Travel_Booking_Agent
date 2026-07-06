import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Trip } from './trip.entity';

@Entity('trip_notes')
export class TripNote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tripId: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    isPinned: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tripId' })
    trip: Trip;
}
