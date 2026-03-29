import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    password: string;
    role?: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        organization?: string;
        role: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR';
        createdAt: string;
    };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const authApi = {
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const res = await apiClient.post('/auth/register', payload);
        return res.data;
    },

    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const res = await apiClient.post('/auth/login', payload);
        return res.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/forgot-password', { email });
        return res.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        const res = await apiClient.post('/auth/reset-password', { token, newPassword });
        return res.data;
    },

    refreshTokens: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const res = await apiClient.post('/auth/refresh', { refreshToken });
        return res.data;
    },
};
