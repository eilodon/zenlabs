/**
 * Session Store - Session history and streak tracking with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// TYPES
// =============================================================================

export interface SessionRecord {
    id: string;
    date: string;           // ISO date string
    patternId: string;
    patternLabel: string;
    durationSec: number;
    cyclesCompleted: number;
    avgHeartRate: number | null;
    avgSignalQuality: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string | null;
}

export interface SessionInsights {
    totalSessions: number;
    totalMinutes: number;
    favoritePattern: string | null;
    avgSessionDuration: number;
    avgCyclesPerSession: number;
    avgHeartRate: number | null;
}

interface SessionState {
    // History
    sessions: SessionRecord[];

    // Streaks
    streak: StreakData;

    // Weekly goal
    weeklyGoal: number;
    weeklyProgress: number;

    // Actions
    addSession: (session: Omit<SessionRecord, 'id'>) => void;
    clearHistory: () => void;
    setWeeklyGoal: (goal: number) => void;
    getInsights: () => SessionInsights;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isSameDay(date1: string, date2: string): boolean {
    return date1.split('T')[0] === date2.split('T')[0];
}

function isYesterday(date: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.split('T')[0] === yesterday.toISOString().split('T')[0];
}

function isThisWeek(dateStr: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
}

function calculateStreak(
    sessions: SessionRecord[],
    lastSessionDate: string | null,
    currentStreak: number,
    longestStreak: number
): StreakData {
    const today = new Date().toISOString();

    if (!lastSessionDate) {
        return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastSessionDate: today };
    }

    if (isSameDay(lastSessionDate, today)) {
        // Same day, streak unchanged
        return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak, 1), lastSessionDate: today };
    }

    if (isYesterday(lastSessionDate)) {
        // Continue streak
        const newStreak = currentStreak + 1;
        return {
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            lastSessionDate: today
        };
    }

    // Streak broken, start over
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastSessionDate: today };
}

// =============================================================================
// STORE
// =============================================================================

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            // Initial state
            sessions: [],
            streak: {
                currentStreak: 0,
                longestStreak: 0,
                lastSessionDate: null,
            },
            weeklyGoal: 7,
            weeklyProgress: 0,

            // Add session
            addSession: (session) => set((state) => {
                const newSession: SessionRecord = {
                    ...session,
                    id: generateId(),
                };

                const newSessions = [newSession, ...state.sessions].slice(0, 100); // Keep last 100

                // Update streak
                const newStreak = calculateStreak(
                    newSessions,
                    state.streak.lastSessionDate,
                    state.streak.currentStreak,
                    state.streak.longestStreak
                );

                // Update weekly progress
                const weeklyProgress = newSessions.filter(s => isThisWeek(s.date)).length;

                return {
                    sessions: newSessions,
                    streak: newStreak,
                    weeklyProgress,
                };
            }),

            // Clear history
            clearHistory: () => set({
                sessions: [],
                streak: { currentStreak: 0, longestStreak: 0, lastSessionDate: null },
                weeklyProgress: 0,
            }),

            // Set weekly goal
            setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),

            // Get insights
            getInsights: (): SessionInsights => {
                const { sessions } = get();

                if (sessions.length === 0) {
                    return {
                        totalSessions: 0,
                        totalMinutes: 0,
                        favoritePattern: null,
                        avgSessionDuration: 0,
                        avgCyclesPerSession: 0,
                        avgHeartRate: null,
                    };
                }

                const totalMinutes = sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60;
                const avgDuration = totalMinutes / sessions.length;
                const avgCycles = sessions.reduce((sum, s) => sum + s.cyclesCompleted, 0) / sessions.length;

                // Find favorite pattern
                const patternCounts: Record<string, number> = {};
                sessions.forEach(s => {
                    patternCounts[s.patternId] = (patternCounts[s.patternId] || 0) + 1;
                });
                const favoritePattern = Object.entries(patternCounts)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

                // Average heart rate
                const hrSessions = sessions.filter(s => s.avgHeartRate !== null);
                const avgHr = hrSessions.length > 0
                    ? hrSessions.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / hrSessions.length
                    : null;

                return {
                    totalSessions: sessions.length,
                    totalMinutes: Math.round(totalMinutes),
                    favoritePattern,
                    avgSessionDuration: Math.round(avgDuration * 10) / 10,
                    avgCyclesPerSession: Math.round(avgCycles * 10) / 10,
                    avgHeartRate: avgHr ? Math.round(avgHr) : null,
                };
            },
        }),
        {
            name: 'zenone-sessions',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
