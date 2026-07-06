import axios, { AxiosInstance } from 'axios';
import type {
    BookingContextRequest,
    BookingContextResponse,
    BookingQueryRequest,
    BookingQueryResponse,
    PaymentConfirmRequest,
    SessionStateResponse
} from '../types/booking-api.types';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Booking API Service
 * Centralized service for all booking-related API calls
 */
export const bookingApi = {
    /**
     * Ingest booking context (Step 1: Submit form data)
     * @param payload - Booking context with user and trip details
     * @returns Session ID and success status
     */
    async ingestContext(payload: BookingContextRequest): Promise<BookingContextResponse> {
        const response = await apiClient.post('/api/booking/context', payload);
        return response.data;
    },

    /**
     * Query agent with short trigger message (Step 2: Start agent)
     * @param payload - Session ID, user ID, and SHORT message
     * @returns Agent action and state
     */
    async queryAgent(payload: BookingQueryRequest): Promise<BookingQueryResponse> {
        const response = await apiClient.post('/api/booking/query', payload);
        return response.data;
    },

    /**
     * Get session state
     * @param sessionId - Session ID
     * @returns Full session state including context and history
     */
    async getSession(sessionId: string): Promise<SessionStateResponse> {
        const response = await apiClient.get(`/api/booking/session/${sessionId}`);
        return response.data;
    },

    /**
     * Confirm or reject payment request
     * @param payload - Session ID and approval status
     * @returns Success status
     */
    async confirmPayment(payload: PaymentConfirmRequest): Promise<{ success: boolean }> {
        const response = await apiClient.post('/api/booking/confirm-payment', payload);
        return response.data;
    },
};
