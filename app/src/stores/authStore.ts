/**
 * Auth Store - Persistent authentication state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../services/authService';

interface AuthStoreState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    hasSeenLogin: boolean;

    setUser: (user: UserProfile | null) => void;
    markLoginSeen: () => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            hasSeenLogin: false,

            setUser: (user) => set({
                user,
                isAuthenticated: user !== null,
            }),

            markLoginSeen: () => set({ hasSeenLogin: true }),

            clearAuth: () => set({
                user: null,
                isAuthenticated: false,
            }),
        }),
        {
            name: 'zenone-auth',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
