import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';

export enum TravelStyle {
  LUXURY = 'luxury',
  BUDGET = 'budget', 
  COMFORT = 'comfort',
  ADVENTURE = 'adventure',
  FAMILY = 'family',
  BUSINESS = 'business',
  ROMANTIC = 'romantic',
  CULTURAL = 'cultural'
}

export enum HotelClass {
  ECONOMY = 'economy',
  COMFORT = 'comfort',
  PREMIUM = 'premium',
  LUXURY = 'luxury'
}

export enum TransportPreference {
  ECONOMY = 'economy',
  BUSINESS = 'business',
  FIRST = 'first',
  ANY = 'any'
}

@Entity('travel_preferences')
export class TravelPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userProfileId: string;

  @ManyToOne(() => UserProfile, profile => profile.travelPreferences)
  @JoinColumn({ name: 'userProfileId' })
  userProfile: UserProfile;

  @Column({
    type: 'enum',
    enum: TravelStyle,
    default: TravelStyle.COMFORT
  })
  travelStyle: TravelStyle;

  @Column({
    type: 'enum', 
    enum: HotelClass,
    default: HotelClass.COMFORT
  })
  preferredHotelClass: HotelClass;

  @Column({
    type: 'enum',
    enum: TransportPreference, 
    default: TransportPreference.ECONOMY
  })
  preferredTransport: TransportPreference;

  @Column('text', { array: true, default: [] })
  preferredAirlines: string[];

  @Column('text', { array: true, default: [] })
  dietaryRestrictions: string[];

  @Column('text', { array: true, default: [] })
  accessibilityNeeds: string[];

  @Column('text', { array: true, default: [] })
  interests: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}