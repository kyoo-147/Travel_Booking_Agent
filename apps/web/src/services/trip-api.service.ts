// Trip API Service
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003/api'; // Trip service endpoint

export interface Trip {
  id: string;
  userId: string;
  name: string;
  status: 'draft' | 'pending_booking' | 'confirmed' | 'cancelled';
  startDate: string;
  endDate: string;
  destination: {
    country: string;
    cities: string[];
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  participants: number;
  budget: {
    amount: number;
    currency: string;
    breakdown: {
      [key: string]: number;
    };
  };
  preferences: {
    travelStyle: string;
    interests: string[];
    groupSize: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

class TripApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          // Handle authentication error
          console.warn('Authentication required');
        }
        return Promise.reject(error);
      }
    );
  }

  // Trip methods
  async getAllTrips(): Promise<Trip[]> {
    try {
      const response = await this.axiosInstance.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Return mock data as fallback for now
      return this.getMockTrips();
    }
  }

  async getTripById(id: string): Promise<Trip | null> {
    try {
      const response = await this.axiosInstance.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trip:', error);
      return null;
    }
  }

  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    try {
      const response = await this.axiosInstance.post('/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    try {
      const response = await this.axiosInstance.patch(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  async deleteTrip(id: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/trips/${id}`);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  // Fallback mock data (until API is fully connected)
  private getMockTrips(): Trip[] {
    return [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Khám phá Kyoto - Osaka mùa hoa anh đào',
        status: 'confirmed',
        startDate: '2024-04-10T00:00:00Z',
        endDate: '2024-04-17T23:59:59Z',
        destination: {
          country: 'Japan',
          cities: ['Kyoto', 'Osaka'],
          coordinates: { lat: 35.0116, lng: 135.7681 }
        },
        participants: 2,
        budget: {
          amount: 45000000,
          currency: 'VND',
          breakdown: {
            flights: 16000000,
            hotels: 24500000,
            activities: 4500000
          }
        },
        preferences: {
          travelStyle: 'comfort',
          interests: ['Cultural Sites', 'Food & Dining', 'Photography', 'Traditional Arts'],
          groupSize: 2
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        userId: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Phiêu lưu Bali - Indonesia',
        status: 'pending_booking',
        startDate: '2024-05-20T00:00:00Z',
        endDate: '2024-05-27T23:59:59Z',
        destination: {
          country: 'Indonesia',
          cities: ['Denpasar', 'Ubud'],
          coordinates: { lat: -8.4095, lng: 115.1889 }
        },
        participants: 4,
        budget: {
          amount: 25000000,
          currency: 'VND',
          breakdown: {
            flights: 12000000,
            hotels: 8000000,
            activities: 5000000
          }
        },
        preferences: {
          travelStyle: 'adventure',
          interests: ['Beaches', 'Adventure Sports', 'Local Culture', 'Temples'],
          groupSize: 4
        },
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: '2024-01-22T09:15:00Z'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        userId: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Singapore - Malaysia 7 ngày',
        status: 'confirmed',
        startDate: '2024-06-15T00:00:00Z',
        endDate: '2024-06-22T23:59:59Z',
        destination: {
          country: 'Singapore & Malaysia',
          cities: ['Singapore', 'Kuala Lumpur'],
          coordinates: { lat: 1.3521, lng: 103.8198 }
        },
        participants: 3,
        budget: {
          amount: 35000000,
          currency: 'VND',
          breakdown: {
            flights: 15000000,
            hotels: 12000000,
            activities: 8000000
          }
        },
        preferences: {
          travelStyle: 'comfort',
          interests: ['City Tours', 'Shopping', 'Food & Dining', 'Modern Architecture'],
          groupSize: 3
        },
        createdAt: '2024-01-25T11:30:00Z',
        updatedAt: '2024-01-28T16:45:00Z'
      }
    ];
  }
}

export const tripApiService = new TripApiService();
export default tripApiService;