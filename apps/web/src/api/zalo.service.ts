/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.PROD ?
    (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3005/api/v1') :
    '/api/v1';

export interface ZaloSessionStatus {
    status: 'pending' | 'generating' | 'ready' | 'scanning' | 'processing' | 'success' | 'expired' | 'error';
    qrCode?: string;
    accountInfo?: any;
    error?: string;
}

export const zaloService = {
    // Generate QR for login
    generateLoginQR: async (accountId: string = 'default') => {
        const response = await axios.post(`${API_URL}/zalo/login-qr`, { accountId });
        return response.data;
    },

    // Get login status
    getLoginStatus: async (accountId: string = 'default'): Promise<ZaloSessionStatus> => {
        const response = await axios.get(`${API_URL}/zalo/login-status/${accountId}`);
        return response.data.session;
    },

    // Get account info
    getAccountInfo: async (accountId: string = 'default') => {
        try {
            const response = await axios.get(`${API_URL}/zalo/account-info/${accountId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    async getConversations(accountId: string): Promise<any[]> {
        const response = await axios.get(`${API_URL}/zalo/conversations/${accountId}`);
        return response.data.data;
    },

    // Disconnect
    disconnect: async (accountId: string = 'default') => {
        const response = await axios.delete(`${API_URL}/zalo/account/${accountId}`);
        return response.data;
    },

    startListener: async (accountId: string = 'default') => {
        const response = await axios.post(`${API_URL}/zalo/start-listener`, { accountId });
        return response.data;
    }
};
