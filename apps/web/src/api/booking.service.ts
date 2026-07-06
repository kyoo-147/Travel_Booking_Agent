import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || ''; // Allow relative path if proxy is set up, or absolute

export interface BookingConversation {
    id: string;
    zaloAccountId: string;
    zaloConversationId: string;
    hotelName?: string;
    state: string;
    metadata?: any;
    updatedAt: string;
}

export const bookingService = {
    getConversations: async (): Promise<BookingConversation[]> => {
        const response = await axios.get(`${API_URL}/api/bookings/conversations`);
        return response.data;
    }
};
