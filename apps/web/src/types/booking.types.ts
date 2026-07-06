export interface UserContactInfo {
    displayName?: string; // Tên hiển thị (Optional)
    contactPhone: string; // Bắt buộc
    contactEmail: string; // Bắt buộc
    preferredLanguage: 'vi' | 'en';
    communicationStyle: 'casual' | 'neutral' | 'polite';
    ageRange?: '18-25' | '26-35' | '36-50' | '50+';
    travelExperience?: 'first_time' | 'occasional' | 'frequent';
}

export interface TravelIntent {
    // Core Info
    destination: string;
    checkInDate: string; // ISO Date string
    checkOutDate: string; // ISO Date string
    numberOfGuests: number;
    numberOfRooms: number;
    urgencyLevel: 'URGENT' | 'NORMAL';

    // Financial
    budgetMinPerNight: number;
    budgetMaxPerNight: number;
    totalTripBudget?: number; // 🆕 NEW: Total budget for entire trip (optional)
    accommodationType: 'hotel' | 'resort' | 'homestay' | 'any';
    paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'ota';
    readyToBook: boolean;

    // Hotel Contact (for agent to contact hotel owner)
    hotelContactPhone: string; // Required

    // Amenities
    mustHaveAmenities: {
        wifi: boolean;
        airConditioner: boolean;
        privateBathroom: boolean;
    };

    // Additional Preferences
    preferredAmenities?: {
        swimmingPool: boolean;
        seaView: boolean;
        breakfastIncluded: boolean;
        parking: boolean;
        elevator: boolean;
        petFriendly: boolean;
    };
    roomTypePreference?: 'standard' | 'deluxe' | 'suite' | 'any';
    bedType?: 'single' | 'double' | 'twin' | 'any';
    note?: string;
}

export interface HotelContactInfo {
    name: string;              // Hotel name
    zaloPhone: string;         // Hotel's Zalo phone number  
    zaloUserId?: string;       // Hotel's Zalo user ID (optional)
}

export interface BookingRequest {
    userContact: UserContactInfo;
    tripDetails: TravelIntent;
    hotelContact: HotelContactInfo;
}
