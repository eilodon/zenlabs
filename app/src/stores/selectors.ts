/**
 * Zustand Selectors - Performance optimized store access
 * 
 * Use these instead of destructuring to prevent unnecessary re-renders
 */

import { useZenOneStore, type PatternInfo, type FrameData, type SessionStats } from './zenoneStore';
import { useSessionStore, type SessionRecord, type StreakData, type SessionInsights } from './sessionStore';
import { useSettingsStore } from './settingsStore';
import { useAuthStore } from './authStore';
import { useAchievementStore, type Achievement } from './achievementStore';

// =============================================================================
// ZENONE SELECTORS
// =============================================================================

export const usePatterns = () => useZenOneStore(s => s.patterns);
export const useSelectedPatternId = () => useZenOneStore(s => s.selectedPatternId);
export const useIsSessionActive = () => useZenOneStore(s => s.isSessionActive);
export const useCurrentFrame = () => useZenOneStore(s => s.currentFrame);
export const useSessionStats = () => useZenOneStore(s => s.sessionStats);

// Derived
export const useCurrentPhase = () => useZenOneStore(s => s.currentFrame.phase);
export const usePhaseProgress = () => useZenOneStore(s => s.currentFrame.phaseProgress);
export const useCyclesCompleted = () => useZenOneStore(s => s.currentFrame.cyclesCompleted);
export const useHeartRate = () => useZenOneStore(s => s.currentFrame.heartRate);
export const useSignalQuality = () => useZenOneStore(s => s.currentFrame.signalQuality);

export const useSelectedPattern = (): PatternInfo | undefined =>
    useZenOneStore(s => s.patterns.find(p => p.id === s.selectedPatternId));

// =============================================================================
// SESSION SELECTORS
// =============================================================================

export const useSessions = () => useSessionStore(s => s.sessions);
export const useStreak = () => useSessionStore(s => s.streak);
export const useWeeklyGoal = () => useSessionStore(s => s.weeklyGoal);
export const useWeeklyProgress = () => useSessionStore(s => s.weeklyProgress);

// Derived
export const useRecentSessions = (count: number = 5): SessionRecord[] =>
    useSessionStore(s => s.sessions.slice(0, count));

export const useCurrentStreak = () => useSessionStore(s => s.streak.currentStreak);
export const useLongestStreak = () => useSessionStore(s => s.streak.longestStreak);

// =============================================================================
// SETTINGS SELECTORS
// =============================================================================

export const useHapticEnabled = () => useSettingsStore(s => s.hapticEnabled);
export const useSoundEnabled = () => useSettingsStore(s => s.soundEnabled);
export const useCameraEnabled = () => useSettingsStore(s => s.cameraEnabled);

// =============================================================================
// AUTH SELECTORS
// =============================================================================

export const useUser = () => useAuthStore(s => s.user);
export const useIsAuthenticated = () => useAuthStore(s => s.isAuthenticated);
export const useHasSeenLogin = () => useAuthStore(s => s.hasSeenLogin);
export const useIsGuest = () => useAuthStore(s => s.user?.provider === 'guest');

// =============================================================================
// ACHIEVEMENT SELECTORS
// =============================================================================

export const useAchievements = () => useAchievementStore(s => s.achievements);
export const useUnlockedAchievements = (): Achievement[] =>
    useAchievementStore(s => s.achievements.filter(a => a.unlockedAt !== null));

export const useUnlockedCount = () =>
    useAchievementStore(s => s.achievements.filter(a => a.unlockedAt !== null).length);
