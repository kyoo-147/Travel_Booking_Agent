import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002/api';

interface TravelCompanionResponse {
  id: string;
  userId: string;
  companionId: string;
  relationship: 'family' | 'friend' | 'colleague';
  status: 'connected' | 'pending' | 'blocked';
  currentStatus: 'online' | 'traveling' | 'offline';
  role: 'primary' | 'companion';
  sharedTrips: number;
  lastTripDate?: string;
  connectionDate: string;
  travelPreferences?: {
    foodStyle: string[];
    activityLevel: 'low' | 'medium' | 'high';
    budgetRange: string;
  };
  aiPersonalNotes?: {
    foodPreferences: string[];
    mobilityLevel: 'low_walking' | 'medium_walking' | 'high_walking';
    travelHabits: string[];
    conflictPoints?: string[];
    compatibilityScore?: number;
  };
  companion: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface CompanionInvitation {
  id: string;
  senderId: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientName?: string;
  type: 'email' | 'link' | 'user_id' | 'system';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  inviteCode?: string;
  expiresAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface CompanionStats {
  totalCompanions: number;
  primaryTravelers: number;
  companions: number;
  connected: number;
  pending: number;
  totalTrips: number;
  avgCompatibility: number;
}

interface CreateInvitationDto {
  type: 'email' | 'link' | 'user_id';
  recipientEmail?: string;
  recipientId?: string;
  recipientName?: string;
  message?: string;
}

interface AcceptInvitationDto {
  relationship: 'family' | 'friend' | 'colleague';
  responseMessage?: string;
}

interface UpdateCompanionDto {
  relationship?: 'family' | 'friend' | 'colleague';
  foodPreferences?: string[];
  mobilityLevel?: 'low_walking' | 'medium_walking' | 'high_walking';
  travelHabits?: string[];
  compatibilityScore?: number;
}

interface ConnectByUserIdDto {
  userId: string;
  relationship: 'family' | 'friend' | 'colleague';
  message?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID from localStorage user profile
api.interceptors.request.use((config) => {
  // Try to get user ID from saved user profile first
  let userId = null;

  try {
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      userId = profile.id;
      console.log('🎯 Using user ID from user_profile:', userId);
    }
  } catch (error) {
    console.warn('Error parsing user_profile from localStorage:', error);
  }

  // Fallback to check auth tokens
  if (!userId) {
    try {
      const authTokens = localStorage.getItem('auth_tokens');
      if (authTokens) {
        const tokens = JSON.parse(authTokens);
        // Extract user ID from JWT token if possible
        if (tokens.accessToken) {
          const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
          userId = payload.sub || payload.id;
          console.log('🔐 Using user ID from JWT token:', userId);
        }
      }
    } catch (error) {
      console.warn('Error extracting user ID from auth tokens:', error);
    }
  }

  if (userId) {
    config.headers['user-id'] = userId;
  } else {
    console.error('❌ No user ID found - user must be authenticated');
    // Don't set header if no valid user ID found
  }

  return config;
});

export const travelCompanionApi = {
  // Get user's companions
  getCompanions: async (): Promise<TravelCompanionResponse[]> => {
    const response = await api.get('/api/travel-companions');
    return response.data;
  },

  // Get companion statistics
  getStats: async (): Promise<CompanionStats> => {
    const response = await api.get('/api/travel-companions/stats');
    return response.data;
  },

  // Create invitation
  createInvitation: async (data: CreateInvitationDto): Promise<CompanionInvitation> => {
    const response = await api.post('/api/travel-companions/invitations', data);
    return response.data;
  },

  // Connect by user ID
  connectByUserId: async (data: ConnectByUserIdDto): Promise<CompanionInvitation> => {
    const response = await api.post('/api/travel-companions/connect-by-id', data);
    return response.data;
  },

  // Get pending invitations
  getPendingInvitations: async (): Promise<CompanionInvitation[]> => {
    const response = await api.get('/api/travel-companions/invitations');
    return response.data;
  },

  // Get invitation by code
  getInvitationByCode: async (code: string): Promise<CompanionInvitation> => {
    const response = await api.get(`/api/travel-companions/invitations/code/${code}`);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (data: { invitationId: string; relationship: string }): Promise<TravelCompanionResponse> => {
    const response = await api.post(`/api/travel-companions/invitations/${data.invitationId}/accept`, {
      relationship: data.relationship
    });
    return response.data;
  },

  // Decline invitation
  declineInvitation: async (invitationId: string): Promise<void> => {
    await api.post(`/api/travel-companions/invitations/${invitationId}/decline`);
  },

  // Update companion
  updateCompanion: async (companionId: string, data: UpdateCompanionDto): Promise<TravelCompanionResponse> => {
    const response = await api.put(`/api/travel-companions/${companionId}`, data);
    return response.data;
  },

  // Update travel preferences
  updateTravelPreferences: async (companionId: string, data: any): Promise<TravelCompanionResponse> => {
    const response = await api.put(`/api/travel-companions/${companionId}/travel-preferences`, data);
    return response.data;
  },

  // Block companion
  blockCompanion: async (companionId: string): Promise<void> => {
    await api.post(`/api/travel-companions/${companionId}/block`);
  },

  // Unblock companion
  unblockCompanion: async (companionId: string): Promise<void> => {
    await api.post(`/api/travel-companions/${companionId}/unblock`);
  },

  // Increment trip count
  incrementTripCount: async (companionId: string): Promise<void> => {
    await api.post(`/api/travel-companions/${companionId}/increment-trips`);
  },

  // Get user code
  getMyCode: async (): Promise<{ code: string }> => {
    const response = await api.get('/api/travel-companions/my-code');
    return response.data;
  },

  // Connect by code
  connectByCode: async (data: { userCode: string; relationship: string; message?: string }): Promise<CompanionInvitation> => {
    const response = await api.post('/api/travel-companions/connect-by-code', data);
    return response.data;
  },

  // Generate invite link
  generateInviteLink: async (data: { relationship: string; message?: string; tripId?: string }): Promise<{ inviteCode: string; inviteLink: string }> => {
    const response = await api.post('/api/travel-companions/generate-invite-link', data);
    return response.data;
  },

  // Accept invite by code
  acceptInviteByCode: async (code: string, data: { relationship: string }): Promise<TravelCompanionResponse> => {
    const response = await api.post(`/api/travel-companions/accept-invite/${code}`, data);
    return response.data;
  },

  // Invite to trip
  inviteToTrip: async (data: { companionId: string; tripId: string; message?: string }): Promise<CompanionInvitation> => {
    const response = await api.post('/api/travel-companions/invite-to-trip', data);
    return response.data;
  },

  // Accept trip invitation
  acceptTripInvitation: async (invitationId: string): Promise<void> => {
    await api.put(`/api/travel-companions/accept-trip-invitation/${invitationId}`);
  },

  // Remove/Delete companion
  removeCompanion: async (companionId: string): Promise<void> => {
    await api.delete(`/api/travel-companions/${companionId}`);
  },
};