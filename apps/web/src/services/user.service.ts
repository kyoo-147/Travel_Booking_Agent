import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:3002/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a silent axios instance for optional endpoints (like preferences)
const silentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for both instances
const addAuthToken = (config: any) => {
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
};

api.interceptors.request.use(addAuthToken);
silentApi.interceptors.request.use(addAuthToken);

// Response interceptor for main API
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

// Silent response interceptor for optional endpoints
silentApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    
    // For 404 errors, return empty response instead of throwing
    if (error.response?.status === 404) {
      return { data: [] };
    }
    
    return Promise.reject(error);
  }
);

// Types for User Service
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  preferences?: UserPreferences;
  defaultBudgetMin?: number;
  defaultBudgetMax?: number;
  isActive: boolean;
  travelPreferences?: TravelPreference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  promotions: boolean;
  bookingUpdates: boolean;
  travelReminders: boolean;
}

export interface TravelPreference {
  id: string;
  userProfileId: string;
  travelStyle: TravelStyle;
  preferredHotelClass: HotelClass;
  preferredTransport: TransportPreference;
  preferredAirlines?: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  interests?: string[];
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
  ECONOMY = 'economy',
  COMFORT = 'comfort', 
  PREMIUM = 'premium',
  LUXURY = 'luxury',
}

export enum TransportPreference {
  ECONOMY = 'economy',
  BUSINESS = 'business',
  FIRST_CLASS = 'first_class',
  PRIVATE = 'private',
}

export interface TravelHistory {
  id: string;
  userProfileId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  rating?: number;
  notes?: string;
}

// DTOs
export interface CreateUserProfileDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  preferences?: UserPreferences;
  defaultBudgetMin?: number;
  defaultBudgetMax?: number;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  preferences?: UserPreferences;
  defaultBudgetMin?: number;
  defaultBudgetMax?: number;
}

export interface CreateTravelPreferenceDto {
  userProfileId: string;
  travelStyle: TravelStyle;
  preferredHotelClass: HotelClass;
  preferredTransport: TransportPreference;
  preferredAirlines?: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  interests?: string[];
}

export const userService = {
  // User Profile CRUD operations
  async getAllUsers(): Promise<UserProfile[]> {
    const response: AxiosResponse<UserProfile[]> = await api.get('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<UserProfile> {
    console.log('UserService.getUserById called with ID:', id);
    try {
      const response: AxiosResponse<UserProfile> = await api.get(`/users/${id}`);
      console.log('getUserById API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<UserProfile> {
    console.log('UserService.getUserByEmail called with email:', email);
    try {
      const response: AxiosResponse<UserProfile> = await api.get(`/users/email/${email}`);
      console.log('getUserByEmail API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  },

  async createUser(data: CreateUserProfileDto): Promise<UserProfile> {
    const response: AxiosResponse<UserProfile> = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserProfileDto): Promise<UserProfile> {
    const response: AxiosResponse<UserProfile> = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Travel Preferences operations
  async createTravelPreferences(userId: string, data: CreateTravelPreferenceDto): Promise<TravelPreference> {
    console.log('Creating travel preferences for userId:', userId);
    console.log('Data being sent to API:', data);
    
    try {
      const response: AxiosResponse<TravelPreference> = await api.post(`/users/${userId}/preferences`, data);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Error details:', error?.response?.data);
      if (error?.response?.data?.message && Array.isArray(error.response.data.message)) {
        console.error('Detailed validation errors:', error.response.data.message);
      }
      throw error;
    }
  },

  // Get user travel preferences - uses silent API to avoid console errors
  async getTravelPreferences(userId: string): Promise<TravelPreference[]> {
    try {
      console.log(`Fetching travel preferences for user: ${userId}`);
      const response: AxiosResponse<TravelPreference[]> = await silentApi.get(`/users/${userId}/preferences`);
      console.log('Successfully fetched preferences:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.log(`No preferences found for user ${userId}, returning empty array`);
      // Fallback to empty array for any errors (including 404)
      return [];
    }
  },

  // Travel History operations
  async getTravelHistory(userId: string): Promise<TravelHistory[]> {
    const response: AxiosResponse<TravelHistory[]> = await api.get(`/users/${userId}/history`);
    return response.data;
  },

  // Utility methods
  async validateUserEmail(email: string): Promise<boolean> {
    try {
      await this.getUserByEmail(email);
      return true;
    } catch {
      return false;
    }
  },

  // Profile helpers
  getFullName(user: UserProfile): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.email;
  },

  formatPreferences(preferences: TravelPreference[]): string {
    if (!preferences || preferences.length === 0) {
      return 'No preferences set';
    }
    
    const styles = preferences.map(p => p.travelStyle).join(', ');
    return `Preferred styles: ${styles}`;
  },

  getBudgetDisplay(user: UserProfile): string {
    if (user.defaultBudgetMin && user.defaultBudgetMax) {
      return `$${user.defaultBudgetMin} - $${user.defaultBudgetMax}`;
    }
    if (user.defaultBudgetMax) {
      return `Up to $${user.defaultBudgetMax}`;
    }
    return 'No budget set';
  },

  getHotelClassDisplay(hotelClass: HotelClass): string {
    const hotelClassLabels = {
      [HotelClass.ECONOMY]: 'Economy',
      [HotelClass.COMFORT]: 'Comfort',
      [HotelClass.PREMIUM]: 'Premium', 
      [HotelClass.LUXURY]: 'Luxury',
    };
    return hotelClassLabels[hotelClass] || 'Unknown';
  },

  getTravelStyleDisplay(style: TravelStyle): string {
    const styleLabels = {
      [TravelStyle.LUXURY]: 'Luxury',
      [TravelStyle.BUDGET]: 'Budget',
      [TravelStyle.ADVENTURE]: 'Adventure',
      [TravelStyle.FAMILY]: 'Family',
      [TravelStyle.BUSINESS]: 'Business',
      [TravelStyle.ROMANTIC]: 'Romantic',
      [TravelStyle.CULTURAL]: 'Cultural',
      [TravelStyle.NATURE]: 'Nature',
    };
    return styleLabels[style] || 'Unknown';
  },
};