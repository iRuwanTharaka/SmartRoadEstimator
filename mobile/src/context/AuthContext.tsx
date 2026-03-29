import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthResponse } from '../api/auth.api';
import { saveTokens, clearTokens, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    role: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR';
    createdAt: string;
}

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: {
        name: string;
        email: string;
        phone?: string;
        organization?: string;
        password: string;
        role?: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR';
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On app start — check if we have valid stored tokens
    useEffect(() => {
        (async () => {
            try {
                const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
                if (token) {
                    // We have a token; check SecureStore for saved user info
                    const rawUser = await SecureStore.getItemAsync('user_profile');
                    if (rawUser) {
                        setUser(JSON.parse(rawUser));
                    }
                }
            } catch {
                // token invalid — clear data
                await clearTokens();
                await SecureStore.deleteItemAsync('user_profile');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const persistAuth = async (data: AuthResponse) => {
        await saveTokens(data.accessToken, data.refreshToken);
        await SecureStore.setItemAsync('user_profile', JSON.stringify(data.user));
        setUser(data.user);
    };

    const login = useCallback(async (email: string, password: string) => {
        const data = await authApi.login({ email, password });
        await persistAuth(data);
    }, []);

    const register = useCallback(async (payload: Parameters<AuthContextValue['register']>[0]) => {
        const role = payload.role ?? 'ENGINEER';
        const data = await authApi.register({ ...payload, role });
        await persistAuth(data);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore logout API errors
        }
        await clearTokens();
        await SecureStore.deleteItemAsync('user_profile');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
