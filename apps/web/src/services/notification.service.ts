import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002';

export interface Notification {
  id: string;
  type: 'companion_invitation' | 'trip_invitation' | 'companion_accepted' | 'trip_accepted';
  title: string;
  message: string;
  data: any;
  status: 'unread' | 'read' | 'dismissed';
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('currentUserId') || '550e8400-e29b-41d4-a716-446655440000';
  config.headers['user-id'] = userId;
  return config;
});

export const notificationApi = {
  // Get notifications
  getNotifications: async (status?: string): Promise<Notification[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};