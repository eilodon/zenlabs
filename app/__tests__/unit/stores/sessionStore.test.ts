/**
 * sessionStore tests
 */

import { useSessionStore } from '../../../src/stores/sessionStore';
import type { SessionRecord } from '../../../src/stores/sessionStore';

describe('sessionStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useSessionStore.setState({
            sessions: [],
            streak: { currentStreak: 0, longestStreak: 0, lastSessionDate: null },
            weeklyGoal: 7,
            weeklyProgress: 0,
        });
    });

    describe('addSession', () => {
        it('should add a new session', () => {
            const session: Omit<SessionRecord, 'id'> = {
                date: new Date().toISOString(),
                patternId: '4-7-8',
                patternLabel: '4-7-8 Relaxing',
                durationSec: 300,
                cyclesCompleted: 5,
                avgHeartRate: 65,
                avgSignalQuality: 0.8,
            };

            useSessionStore.getState().addSession(session);
            const state = useSessionStore.getState();

            expect(state.sessions).toHaveLength(1);
            expect(state.sessions[0].patternId).toBe('4-7-8');
            expect(state.sessions[0].id).toBeDefined();
        });

        it('should update streak on first session', () => {
            const session: Omit<SessionRecord, 'id'> = {
                date: new Date().toISOString(),
                patternId: '4-7-8',
                patternLabel: '4-7-8 Relaxing',
                durationSec: 300,
                cyclesCompleted: 5,
                avgHeartRate: null,
                avgSignalQuality: 0,
            };

            useSessionStore.getState().addSession(session);
            const state = useSessionStore.getState();

            expect(state.streak.currentStreak).toBe(1);
            expect(state.streak.lastSessionDate).toBeDefined();
        });

        it('should keep max 100 sessions', () => {
            const baseSession: Omit<SessionRecord, 'id'> = {
                date: new Date().toISOString(),
                patternId: 'box',
                patternLabel: 'Box Breathing',
                durationSec: 60,
                cyclesCompleted: 1,
                avgHeartRate: null,
                avgSignalQuality: 0,
            };

            // Add 105 sessions
            for (let i = 0; i < 105; i++) {
                useSessionStore.getState().addSession(baseSession);
            }

            const state = useSessionStore.getState();
            expect(state.sessions.length).toBeLessThanOrEqual(100);
        });
    });

    describe('getInsights', () => {
        it('should return empty insights when no sessions', () => {
            const insights = useSessionStore.getState().getInsights();

            expect(insights.totalSessions).toBe(0);
            expect(insights.totalMinutes).toBe(0);
            expect(insights.favoritePattern).toBeNull();
        });

        it('should calculate correct insights', () => {
            const sessions: Omit<SessionRecord, 'id'>[] = [
                {
                    date: new Date().toISOString(),
                    patternId: '4-7-8',
                    patternLabel: '4-7-8',
                    durationSec: 600, // 10 minutes
                    cyclesCompleted: 10,
                    avgHeartRate: 60,
                    avgSignalQuality: 0.9,
                },
                {
                    date: new Date().toISOString(),
                    patternId: '4-7-8',
                    patternLabel: '4-7-8',
                    durationSec: 300, // 5 minutes
                    cyclesCompleted: 5,
                    avgHeartRate: 65,
                    avgSignalQuality: 0.8,
                },
            ];

            sessions.forEach(s => useSessionStore.getState().addSession(s));
            const insights = useSessionStore.getState().getInsights();

            expect(insights.totalSessions).toBe(2);
            expect(insights.totalMinutes).toBe(15);
            expect(insights.favoritePattern).toBe('4-7-8');
            expect(insights.avgHeartRate).toBe(63); // (60+65)/2 rounded
        });
    });

    describe('clearHistory', () => {
        it('should clear all sessions and reset streak', () => {
            // Add a session first
            useSessionStore.getState().addSession({
                date: new Date().toISOString(),
                patternId: 'box',
                patternLabel: 'Box',
                durationSec: 60,
                cyclesCompleted: 1,
                avgHeartRate: null,
                avgSignalQuality: 0,
            });

            // Clear
            useSessionStore.getState().clearHistory();
            const state = useSessionStore.getState();

            expect(state.sessions).toHaveLength(0);
            expect(state.streak.currentStreak).toBe(0);
            expect(state.weeklyProgress).toBe(0);
        });
    });

    describe('setWeeklyGoal', () => {
        it('should update weekly goal', () => {
            useSessionStore.getState().setWeeklyGoal(5);
            expect(useSessionStore.getState().weeklyGoal).toBe(5);
        });
    });
});
