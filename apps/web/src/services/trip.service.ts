import axios, { AxiosResponse } from 'axios';

// Temporary types until common-types module is properly setup
export interface Trip {
  id: string;
  userId: string;
  name: string;
  status: 'draft' | 'pending_booking' | 'confirmed' | 'cancelled' | 'completed';
  startDate: Date;
  endDate: Date;
  destination: {
    country: string;
    city: string;
    region?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  participants: number;
  budget: {
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
  };
  preferences: {
    pace: 'relaxed' | 'moderate' | 'packed';
    interests: string[];
    mustSee: string[];
    avoidances: string[];
  };
  itinerary?: Itinerary;
  bookings?: Booking[];
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

export interface Itinerary {
  id: string;
  tripId: string;
  totalDistance: number;
  estimatedCost: number;
  items?: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  type: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  cost: number;
  bookingRequired: boolean;
  booking?: Booking;
  notes?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  type: string;
  providerId: string;
  providerBookingRef: string;
  details: any;
  price: {
    amount: number;
    currency: string;
    breakdown: {
      base: number;
      taxes: number;
      fees: number;
      discounts: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Note interface
export interface TripNote {
  id: string;
  tripId: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteDto {
  content: string;
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  content?: string;
  isPinned?: boolean;
}

// ✅ NEW: Conversation-related interfaces for AI Agent Booking integration
export interface Conversation {
  conversationId: string;
  sessionId: string;
  messages: ConversationMessage[];
  agentActions: AgentAction[];
  hotelContact: HotelContact;
  state: string;
  timeline: {
    started: string;
    completed: string;
    duration: number;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HotelContact {
  name: string;
  zaloPhone: string;
  zaloUserId?: string;
}

export interface AgentAction {
  intent: string;
  thought_process: string;
  messageDraft: string;
  timestamp: string;
}


const API_BASE_URL = import.meta.env.VITE_TRIP_API_BASE_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// DTOs matching backend
export interface CreateTripDto {
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  numberOfPeople?: number;
  budgetMax?: number;
  currency?: string;
  preferences?: {
    pace?: 'relaxed' | 'moderate' | 'packed';
    interests?: string[];
    mustSee?: string[];
    avoidances?: string[];
  };
}

export interface UpdateTripDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  numberOfPeople?: number;
  budgetMax?: number;
  currency?: string;
  preferences?: {
    pace?: 'relaxed' | 'moderate' | 'packed';
    interests?: string[];
    mustSee?: string[];
    avoidances?: string[];
  };
  budget?: Trip['budget'];
}

export interface CreateBookingDto {
  tripId: string;
  type: string;
  providerReference?: string;
  bookingDetails?: any;
  amount?: number;
  currency?: string;
}

export interface UpdateBookingDto {
  type?: string;
  providerReference?: string;
  bookingDetails?: any;
  amount?: number;
  currency?: string;
}

export const tripService = {
  // Trip CRUD operations
  async getAllTrips(): Promise<Trip[]> {
    const response: AxiosResponse<Trip[]> = await api.get('/trips');
    return response.data;
  },

  async getTripsByUser(userId: string): Promise<Trip[]> {
    const response: AxiosResponse<Trip[]> = await api.get(`/trips?userId=${userId}`);
    return response.data;
  },

  async getTripById(id: string): Promise<Trip> {
    const response: AxiosResponse<Trip> = await api.get(`/trips/${id}`);
    return response.data;
  },

  async createTrip(data: CreateTripDto): Promise<Trip> {
    const response: AxiosResponse<Trip> = await api.post('/trips', data);
    return response.data;
  },

  async updateTrip(id: string, data: UpdateTripDto): Promise<Trip> {
    const response: AxiosResponse<Trip> = await api.patch(`/trips/${id}`, data);
    return response.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  },

  // Trip summary
  async getTripSummary(id: string): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/trips/${id}/summary`);
    return response.data;
  },

  // Itinerary operations
  async createItinerary(tripId: string): Promise<Itinerary> {
    const response: AxiosResponse<Itinerary> = await api.post(`/trips/${tripId}/itinerary`);
    return response.data;
  },

  async getItinerary(tripId: string): Promise<Itinerary | null> {
    try {
      const response: AxiosResponse<Itinerary> = await api.get(`/trips/${tripId}/itinerary`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Booking operations
  async createBooking(tripId: string, data: CreateBookingDto): Promise<Booking> {
    data.tripId = tripId; // Ensure tripId is set
    const response: AxiosResponse<Booking> = await api.post(`/trips/${tripId}/bookings`, data);
    return response.data;
  },

  async getBookings(tripId: string): Promise<Booking[]> {
    const response: AxiosResponse<Booking[]> = await api.get(`/trips/${tripId}/bookings`);
    return response.data;
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    const response: AxiosResponse<Booking> = await api.get(`/trips/bookings/${bookingId}`);
    return response.data;
  },

  async updateBooking(bookingId: string, data: UpdateBookingDto): Promise<Booking> {
    const response: AxiosResponse<Booking> = await api.patch(`/trips/bookings/${bookingId}`, data);
    return response.data;
  },

  async deleteBooking(bookingId: string): Promise<void> {
    await api.delete(`/trips/bookings/${bookingId}`);
  },

  // Utility methods
  async validateTripAccess(tripId: string, userId: string): Promise<boolean> {
    try {
      const trip = await this.getTripById(tripId);
      return trip.userId === userId;
    } catch {
      return false;
    }
  },

  // Status helpers
  getStatusColor(status: TripStatus): string {
    switch (status) {
      case TripStatus.DRAFT:
        return 'default';
      case TripStatus.PENDING_BOOKING:
        return 'processing';
      case TripStatus.CONFIRMED:
        return 'success';
      case TripStatus.CANCELLED:
        return 'error';
      case TripStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  },

  formatTripDuration(startDate: Date, endDate: Date): string {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  },

  formatBudget(amount: number, currency: string = 'VND'): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
    }).format(amount);
  },

  // ===== NOTE OPERATIONS =====
  async getNotes(tripId: string): Promise<TripNote[]> {
    const response: AxiosResponse<TripNote[]> = await api.get(`/trips/${tripId}/notes`);
    return response.data;
  },

  async createNote(tripId: string, data: CreateNoteDto): Promise<TripNote> {
    const response: AxiosResponse<TripNote> = await api.post(`/trips/${tripId}/notes`, data);
    return response.data;
  },

  async updateNote(noteId: string, data: UpdateNoteDto): Promise<TripNote> {
    const response: AxiosResponse<TripNote> = await api.patch(`/trips/notes/${noteId}`, data);
    return response.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await api.delete(`/trips/notes/${noteId}`);
  },

  // ===== 🆕 NEW: Agent Booking Conversation APIs =====

  /**
   * Get conversation history for agent booking trip
   * Returns null if trip is not from agent booking or has no conversation
   */
  async getConversation(tripId: string): Promise<Conversation | null> {
    try {
      const response: AxiosResponse<Conversation> = await api.get(
        `/trips/agent-bookings/${tripId}/conversation`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Trip không phải agent booking hoặc chưa có conversation
        return null;
      }
      throw error;
    }
  },

  /**
   * Get trips filtered by source (agent_booking)
   */
  async getAgentBookings(userId: string): Promise<Trip[]> {
    const response: AxiosResponse<Trip[]> = await api.get('/trips', {
      params: { userId, source: 'agent_booking' }
    });
    return response.data;
  },

  /**
   * Get trip with conversation embedded
   * Useful for loading trip detail page with conversation in one call
   */
  async getTripWithConversation(tripId: string): Promise<Trip & { conversation?: Conversation }> {
    const response: AxiosResponse<Trip> = await api.get(`/trips/${tripId}`, {
      params: { include: 'conversation' }
    });
    return response.data;
  },
};