/**
 * Gamification Store - XP, Levels, Quests, Streaks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// LEVEL SYSTEM
// =============================================================================

export interface Level {
    level: number;
    title: string;
    minXp: number;
    maxXp: number;
}

export const LEVELS: Level[] = [
    { level: 1, title: 'Novice', minXp: 0, maxXp: 100 },
    { level: 2, title: 'Beginner', minXp: 100, maxXp: 250 },
    { level: 3, title: 'Learner', minXp: 250, maxXp: 500 },
    { level: 4, title: 'Student', minXp: 500, maxXp: 850 },
    { level: 5, title: 'Practitioner', minXp: 850, maxXp: 1300 },
    { level: 6, title: 'Adept', minXp: 1300, maxXp: 1900 },
    { level: 7, title: 'Competent', minXp: 1900, maxXp: 2700 },
    { level: 8, title: 'Skilled', minXp: 2700, maxXp: 3800 },
    { level: 9, title: 'Expert', minXp: 3800, maxXp: 5200 },
    { level: 10, title: 'Mindful', minXp: 5200, maxXp: 7000 },
    { level: 15, title: 'Master', minXp: 7000, maxXp: 15000 },
    { level: 20, title: 'Sage', minXp: 15000, maxXp: 30000 },
    { level: 30, title: 'Guru', minXp: 30000, maxXp: 60000 },
    { level: 40, title: 'Zen Master', minXp: 60000, maxXp: 100000 },
    { level: 50, title: 'Enlightened', minXp: 100000, maxXp: Infinity },
];

// =============================================================================
// DAILY QUESTS
// =============================================================================

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    emoji: string;
    requirement: QuestRequirement;
    xpReward: number;
    completed: boolean;
    progress: number;
}

type QuestRequirement =
    | { type: 'sessions'; count: number }
    | { type: 'minutes'; count: number }
    | { type: 'cycles'; count: number }
    | { type: 'session_before'; hour: number }
    | { type: 'session_after'; hour: number }
    | { type: 'specific_pattern'; patternId: string };

const QUEST_TEMPLATES: Omit<DailyQuest, 'completed' | 'progress'>[] = [
    {
        id: 'morning_breath',
        title: 'Morning Breath',
        description: 'Complete a session before 9 AM',
        emoji: '🌅',
        requirement: { type: 'session_before', hour: 9 },
        xpReward: 50,
    },
    {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete a session after 9 PM',
        emoji: '🦉',
        requirement: { type: 'session_after', hour: 21 },
        xpReward: 50,
    },
    {
        id: 'triple_session',
        title: 'Triple Session',
        description: 'Complete 3 sessions today',
        emoji: '3️⃣',
        requirement: { type: 'sessions', count: 3 },
        xpReward: 100,
    },
    {
        id: 'deep_dive',
        title: 'Deep Dive',
        description: 'Breathe for 15 minutes total',
        emoji: '🌊',
        requirement: { type: 'minutes', count: 15 },
        xpReward: 75,
    },
    {
        id: 'cycle_master',
        title: 'Cycle Master',
        description: 'Complete 30 breathing cycles',
        emoji: '🔄',
        requirement: { type: 'cycles', count: 30 },
        xpReward: 60,
    },
    {
        id: 'box_expert',
        title: 'Box Expert',
        description: 'Use Box Breathing pattern',
        emoji: '📦',
        requirement: { type: 'specific_pattern', patternId: 'box' },
        xpReward: 40,
    },
    {
        id: 'sleep_prep',
        title: 'Sleep Prep',
        description: 'Use 4-7-8 pattern for sleep',
        emoji: '😴',
        requirement: { type: 'specific_pattern', patternId: '4-7-8' },
        xpReward: 40,
    },
];

// =============================================================================
// STREAK PROTECTION
// =============================================================================

export interface StreakFreeze {
    available: number;
    usedToday: boolean;
    lastEarnedAt: string | null;
}

// =============================================================================
// STORE
// =============================================================================

interface GamificationState {
    // XP & Levels
    totalXp: number;

    // Daily Quests
    dailyQuests: DailyQuest[];
    lastQuestRefresh: string | null;

    // Streak Protection
    streakFreeze: StreakFreeze;

    // Actions
    addXp: (amount: number, source: string) => number | null; // returns new level if leveled up
    refreshDailyQuests: () => void;
    updateQuestProgress: (questId: string, progress: number) => void;
    completeQuest: (questId: string) => void;
    useStreakFreeze: () => boolean;
    earnStreakFreeze: () => void;

    // Getters
    getCurrentLevel: () => Level;
    getXpProgress: () => { current: number; needed: number; percentage: number };
    getAvailableQuests: () => DailyQuest[];
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            totalXp: 0,
            dailyQuests: [],
            lastQuestRefresh: null,
            streakFreeze: {
                available: 0,
                usedToday: false,
                lastEarnedAt: null,
            },

            addXp: (amount, source) => {
                const prevLevel = get().getCurrentLevel().level;
                set((state) => ({ totalXp: state.totalXp + amount }));
                const newLevel = get().getCurrentLevel().level;

                if (newLevel > prevLevel) {
                    return newLevel;
                }
                return null;
            },

            refreshDailyQuests: () => {
                const today = new Date().toDateString();
                if (get().lastQuestRefresh === today) return;

                // Pick 3 random quests
                const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 3).map((q) => ({
                    ...q,
                    completed: false,
                    progress: 0,
                }));

                set({
                    dailyQuests: selected,
                    lastQuestRefresh: today,
                    streakFreeze: { ...get().streakFreeze, usedToday: false },
                });
            },

            updateQuestProgress: (questId, progress) => {
                set((state) => ({
                    dailyQuests: state.dailyQuests.map((q) =>
                        q.id === questId ? { ...q, progress: Math.min(progress, getRequirementTarget(q.requirement)) } : q
                    ),
                }));
            },

            completeQuest: (questId) => {
                const quest = get().dailyQuests.find((q) => q.id === questId);
                if (!quest || quest.completed) return;

                set((state) => ({
                    dailyQuests: state.dailyQuests.map((q) =>
                        q.id === questId ? { ...q, completed: true } : q
                    ),
                }));

                get().addXp(quest.xpReward, `quest:${questId}`);
            },

            useStreakFreeze: () => {
                const freeze = get().streakFreeze;
                if (freeze.available <= 0 || freeze.usedToday) return false;

                set({
                    streakFreeze: {
                        ...freeze,
                        available: freeze.available - 1,
                        usedToday: true,
                    },
                });
                return true;
            },

            earnStreakFreeze: () => {
                set((state) => ({
                    streakFreeze: {
                        ...state.streakFreeze,
                        available: Math.min(state.streakFreeze.available + 1, 3),
                        lastEarnedAt: new Date().toISOString(),
                    },
                }));
            },

            getCurrentLevel: () => {
                const xp = get().totalXp;
                for (let i = LEVELS.length - 1; i >= 0; i--) {
                    if (xp >= LEVELS[i].minXp) {
                        return LEVELS[i];
                    }
                }
                return LEVELS[0];
            },

            getXpProgress: () => {
                const xp = get().totalXp;
                const level = get().getCurrentLevel();
                const current = xp - level.minXp;
                const needed = level.maxXp - level.minXp;
                return {
                    current,
                    needed: needed === Infinity ? current : needed,
                    percentage: needed === Infinity ? 100 : (current / needed) * 100,
                };
            },

            getAvailableQuests: () => {
                get().refreshDailyQuests();
                return get().dailyQuests;
            },
        }),
        {
            name: 'zenone-gamification',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helper
function getRequirementTarget(req: QuestRequirement): number {
    switch (req.type) {
        case 'sessions': return req.count;
        case 'minutes': return req.count;
        case 'cycles': return req.count;
        case 'session_before':
        case 'session_after':
        case 'specific_pattern':
            return 1;
    }
}

export default useGamificationStore;
