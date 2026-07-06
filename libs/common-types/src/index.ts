export * from './chat';

// User related types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  phone?: string;
  dateOfBirth?: Date;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  travelStyle?: TravelStyle[];
  preferredAirlines?: string[];
  hotelClass?: HotelClass;
  dietaryRestrictions?: string[];
  accessibility?: AccessibilityNeeds[];
  language: string;
  currency: string;
  timezone: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export enum TravelStyle {
  LUXURY = 'luxury',
  BUDGET = 'budget',
  ADVENTURE = 'adventure',
  FAMILY = 'family',
  BUSINESS = 'business',
  ROMANTIC = 'romantic',
  CULTURAL = 'cultural',
  NATURE = 'nature',
}

export enum HotelClass {
  ECONOMY = 1,
  STANDARD = 2,
  COMFORT = 3,
  LUXURY = 4,
  PREMIUM = 5,
}

export enum AccessibilityNeeds {
  WHEELCHAIR = 'wheelchair',
  VISUAL_IMPAIRMENT = 'visual_impairment',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  MOBILITY_ASSISTANCE = 'mobility_assistance',
}

// Trip related types
export interface Trip {
  id: string;
  userId: string;
  name: string;
  status: TripStatus;
  startDate: Date;
  endDate: Date;
  destination: Destination;
  participants: number;
  budget: Budget;
  preferences: TripPreferences;
  itinerary: Itinerary;
  bookings: Booking[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TripStatus {
  DRAFT = 'draft',
  PENDING_BOOKING = 'pending_booking',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Destination {
  country: string;
  city: string;
  region?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Budget {
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
}

export interface TripPreferences {
  pace: 'relaxed' | 'moderate' | 'packed';
  interests: string[];
  mustSee: string[];
  avoidances: string[];
}

// Itinerary types
export interface Itinerary {
  id: string;
  tripId: string;
  days: ItineraryDay[];
  totalDistance: number;
  estimatedCost: number;
}

export interface ItineraryDay {
  date: Date;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  name: string;
  description?: string;
  location: Location;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  cost: number;
  bookingRequired: boolean;
  booking?: Booking;
  notes?: string;
}

export enum ItineraryItemType {
  FLIGHT = 'flight',
  ACCOMMODATION = 'accommodation',
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
  TRANSPORT = 'transport',
  FREE_TIME = 'free_time',
}

export interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  rating?: number;
  photos?: string[];
}

// Booking types
export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  provider: Provider;
  providerBookingRef: string;
  status: BookingStatus;
  details: BookingDetails;
  price: Price;
  passengers?: Passenger[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ACTIVITY = 'activity',
  TRANSPORT = 'transport',
}

export enum BookingStatus {
  PENDING = 'pending',
  HELD = 'held',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface BookingDetails {
  // This will be a union type based on booking type
  [key: string]: any;
}

export interface FlightBookingDetails extends BookingDetails {
  airline: string;
  flightNumber: string;
  departure: FlightSegment;
  arrival: FlightSegment;
  aircraft: string;
  class: string;
  baggage: BaggageInfo;
}

export interface FlightSegment {
  airport: Airport;
  terminal?: string;
  gate?: string;
  datetime: Date;
}

export interface Airport {
  code: string; // IATA code
  name: string;
  city: string;
  country: string;
}

export interface BaggageInfo {
  cabin: string;
  checked: string;
}

export interface HotelBookingDetails extends BookingDetails {
  hotelName: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  guests: number;
  amenities: string[];
  cancellationPolicy: string;
}

export interface Price {
  amount: number;
  currency: string;
  breakdown?: PriceBreakdown;
}

export interface PriceBreakdown {
  base: number;
  taxes: number;
  fees: number;
  discounts: number;
}

export interface Passenger {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  passport?: PassportInfo;
}

export interface PassportInfo {
  number: string;
  countryCode: string;
  expiryDate: Date;
}

// Provider types
export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  config: ProviderConfig;
  isActive: boolean;
}

export enum ProviderType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ACTIVITY = 'activity',
  TRANSPORT = 'transport',
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  timeout: number;
  retries: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Search types
export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: 'economy' | 'premium_economy' | 'business' | 'first';
  maxStops?: number;
  preferredAirlines?: string[];
}

export interface HotelSearchQuery {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  starRating?: number[];
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface BookingStatusUpdate extends WebSocketMessage {
  type: 'booking_status_update';
  payload: {
    bookingId: string;
    status: BookingStatus;
    details?: any;
  };
}

export interface PriceAlert extends WebSocketMessage {
  type: 'price_alert';
  payload: {
    tripId: string;
    itemType: string;
    oldPrice: number;
    newPrice: number;
    savings: number;
  };
}