/**
 * Achievements Store - Gamification system
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// ACHIEVEMENT DEFINITIONS
// =============================================================================

export interface Achievement {
    id: string;
    name: string;
    description: string;
    emoji: string;
    category: 'beginner' | 'consistency' | 'mastery' | 'explorer' | 'time';
    requirement: AchievementRequirement;
    unlockedAt: string | null;
}

export type AchievementRequirement =
    | { type: 'sessions'; count: number }
    | { type: 'streak'; days: number }
    | { type: 'minutes'; total: number }
    | { type: 'patterns'; count: number }
    | { type: 'pattern_uses'; patternId: string; count: number }
    | { type: 'time_of_day'; hour: number; direction: 'before' | 'after'; count: number }
    | { type: 'cycles'; total: number }
    | { type: 'avg_hr'; threshold: number; direction: 'below' | 'above'; sessions: number };

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
    // Beginner
    {
        id: 'first-breath',
        name: 'First Breath',
        description: 'Complete your first session',
        emoji: '🌱',
        category: 'beginner',
        requirement: { type: 'sessions', count: 1 },
    },
    {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Complete 5 sessions',
        emoji: '🚀',
        category: 'beginner',
        requirement: { type: 'sessions', count: 5 },
    },
    {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Complete 25 sessions',
        emoji: '💪',
        category: 'beginner',
        requirement: { type: 'sessions', count: 25 },
    },

    // Consistency
    {
        id: 'three-day-streak',
        name: 'Three-Day Spark',
        description: '3-day streak',
        emoji: '✨',
        category: 'consistency',
        requirement: { type: 'streak', days: 3 },
    },
    {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: '7-day streak',
        emoji: '🔥',
        category: 'consistency',
        requirement: { type: 'streak', days: 7 },
    },
    {
        id: 'month-master',
        name: 'Month Master',
        description: '30-day streak',
        emoji: '👑',
        category: 'consistency',
        requirement: { type: 'streak', days: 30 },
    },

    // Time-based
    {
        id: 'hour-one',
        name: 'First Hour',
        description: '60 minutes total',
        emoji: '⏰',
        category: 'mastery',
        requirement: { type: 'minutes', total: 60 },
    },
    {
        id: 'ten-hours',
        name: 'Time Traveler',
        description: '10 hours total',
        emoji: '🕐',
        category: 'mastery',
        requirement: { type: 'minutes', total: 600 },
    },
    {
        id: 'hundred-hours',
        name: 'Zen Master',
        description: '100 hours total',
        emoji: '💯',
        category: 'mastery',
        requirement: { type: 'minutes', total: 6000 },
    },

    // Explorer
    {
        id: 'curious',
        name: 'Curious Mind',
        description: 'Try 3 patterns',
        emoji: '🔍',
        category: 'explorer',
        requirement: { type: 'patterns', count: 3 },
    },
    {
        id: 'adventurer',
        name: 'Adventurer',
        description: 'Try 7 patterns',
        emoji: '🗺️',
        category: 'explorer',
        requirement: { type: 'patterns', count: 7 },
    },
    {
        id: 'collector',
        name: 'Pattern Collector',
        description: 'Try all 11 patterns',
        emoji: '🏆',
        category: 'explorer',
        requirement: { type: 'patterns', count: 11 },
    },

    // Time of day
    {
        id: 'early-bird',
        name: 'Early Bird',
        description: '5 sessions before 7am',
        emoji: '🐦',
        category: 'time',
        requirement: { type: 'time_of_day', hour: 7, direction: 'before', count: 5 },
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        description: '5 sessions after 10pm',
        emoji: '🦉',
        category: 'time',
        requirement: { type: 'time_of_day', hour: 22, direction: 'after', count: 5 },
    },

    // Mastery
    {
        id: 'breath-walker',
        name: 'Breath Walker',
        description: '100 total cycles',
        emoji: '🌊',
        category: 'mastery',
        requirement: { type: 'cycles', total: 100 },
    },
    {
        id: 'calm-heart',
        name: 'Calm Heart',
        description: 'Avg HR below 65 for 10 sessions',
        emoji: '💚',
        category: 'mastery',
        requirement: { type: 'avg_hr', threshold: 65, direction: 'below', sessions: 10 },
    },
];

// =============================================================================
// USER STATS (for checking achievements)
// =============================================================================

export interface UserStats {
    totalSessions: number;
    totalMinutes: number;
    totalCycles: number;
    longestStreak: number;
    currentStreak: number;
    uniquePatterns: Set<string>;
    earlyMorningSessions: number;  // Before 7am
    lateNightSessions: number;     // After 10pm
    lowHrSessions: number;         // Avg HR < 65
    patternUsage: Record<string, number>;
}

// =============================================================================
// STORE
// =============================================================================

interface AchievementState {
    achievements: Achievement[];
    lastCheckTime: string | null;

    // Actions
    initializeAchievements: () => void;
    checkAchievements: (stats: UserStats) => Achievement[];
    getUnlockedCount: () => number;
    getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
}

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            achievements: ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
            lastCheckTime: null,

            initializeAchievements: () => {
                // Reset to base achievements if needed
                set({
                    achievements: ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
                });
            },

            checkAchievements: (stats: UserStats): Achievement[] => {
                const { achievements } = get();
                const newlyUnlocked: Achievement[] = [];
                const now = new Date().toISOString();

                const updatedAchievements = achievements.map(achievement => {
                    // Already unlocked
                    if (achievement.unlockedAt) return achievement;

                    // Check if requirement is met
                    const req = achievement.requirement;
                    let isUnlocked = false;

                    switch (req.type) {
                        case 'sessions':
                            isUnlocked = stats.totalSessions >= req.count;
                            break;
                        case 'streak':
                            isUnlocked = stats.longestStreak >= req.days;
                            break;
                        case 'minutes':
                            isUnlocked = stats.totalMinutes >= req.total;
                            break;
                        case 'patterns':
                            isUnlocked = stats.uniquePatterns.size >= req.count;
                            break;
                        case 'cycles':
                            isUnlocked = stats.totalCycles >= req.total;
                            break;
                        case 'time_of_day':
                            if (req.direction === 'before') {
                                isUnlocked = stats.earlyMorningSessions >= req.count;
                            } else {
                                isUnlocked = stats.lateNightSessions >= req.count;
                            }
                            break;
                        case 'avg_hr':
                            if (req.direction === 'below') {
                                isUnlocked = stats.lowHrSessions >= req.sessions;
                            }
                            break;
                    }

                    if (isUnlocked) {
                        const unlocked = { ...achievement, unlockedAt: now };
                        newlyUnlocked.push(unlocked);
                        return unlocked;
                    }

                    return achievement;
                });

                if (newlyUnlocked.length > 0) {
                    set({ achievements: updatedAchievements, lastCheckTime: now });
                }

                return newlyUnlocked;
            },

            getUnlockedCount: () => {
                return get().achievements.filter(a => a.unlockedAt !== null).length;
            },

            getAchievementsByCategory: (category) => {
                return get().achievements.filter(a => a.category === category);
            },
        }),
        {
            name: 'zenone-achievements',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
