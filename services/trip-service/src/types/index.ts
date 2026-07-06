// Trip related enums and types
export enum TripStatus {
  DRAFT = 'draft',
  PENDING_BOOKING = 'pending_booking',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

// Booking related enums
export enum BookingType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
  TRANSPORTATION = 'transportation'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

// Itinerary related enums
export enum ItineraryItemType {
  FLIGHT = 'flight',
  ACCOMMODATION = 'accommodation',
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
  TRANSPORT = 'transport',
  ATTRACTION = 'attraction',
  EVENT = 'event'
}

// User related enums
export enum TravelStyle {
  BUDGET = 'budget',
  COMFORT = 'comfort',
  LUXURY = 'luxury',
  ADVENTURE = 'adventure',
  FAMILY = 'family',
  BUSINESS = 'business'
}

export enum HotelClass {
  HOSTEL = 'hostel',
  BUDGET = 'budget',
  MID_RANGE = 'mid_range',
  UPSCALE = 'upscale',
  LUXURY = 'luxury'
}

export enum AccessibilityNeeds {
  WHEELCHAIR = 'wheelchair',
  VISUAL_IMPAIRMENT = 'visual_impairment',
  HEARING_IMPAIRMENT = 'hearing_impairment',
  MOBILITY_ASSISTANCE = 'mobility_assistance',
  NONE = 'none'
}

// Provider related enums
export enum ProviderType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  CAR_RENTAL = 'car_rental',
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
  TRANSFER = 'transfer'
}