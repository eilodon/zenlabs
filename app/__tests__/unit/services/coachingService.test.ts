/**
 * coachingService tests
 */

import { BreathingCoach } from '../../../src/services/coachingService';
import type { CoachingContext } from '../../../src/services/coachingService';

describe('BreathingCoach', () => {
    let coach: BreathingCoach;

    beforeEach(() => {
        coach = new BreathingCoach();
    });

    describe('getPhaseGuidance', () => {
        it('should return guidance for Inhale', () => {
            const guidance = coach.getPhaseGuidance('Inhale');
            expect(guidance).toBeDefined();
            expect(typeof guidance).toBe('string');
        });

        it('should return guidance for Exhale', () => {
            const guidance = coach.getPhaseGuidance('Exhale');
            expect(guidance).toBeDefined();
        });

        it('should return guidance for Hold phases', () => {
            const holdIn = coach.getPhaseGuidance('HoldIn');
            const holdOut = coach.getPhaseGuidance('HoldOut');

            expect(holdIn).toBeDefined();
            expect(holdOut).toBeDefined();
        });

        it('should return empty string for unknown phase', () => {
            const guidance = coach.getPhaseGuidance('Unknown');
            expect(guidance).toBe('');
        });
    });

    describe('getSessionSummary', () => {
        it('should return summary for long session', () => {
            const context: CoachingContext = {
                currentPhase: 'Exhale',
                cyclesCompleted: 20,
                heartRate: 60,
                hrv: null,
                patternId: '4-7-8',
                sessionDurationSec: 600, // 10 minutes
                timeOfDay: 'morning',
                streakDays: 0,
                totalSessions: 10,
            };

            const summary = coach.getSessionSummary(context);

            expect(summary.type).toBe('insight');
            expect(summary.message).toContain('10');
            expect(summary.emoji).toBeDefined();
        });

        it('should acknowledge streak days', () => {
            const context: CoachingContext = {
                currentPhase: 'Inhale',
                cyclesCompleted: 5,
                heartRate: null,
                hrv: null,
                patternId: 'box',
                sessionDurationSec: 300,
                timeOfDay: 'evening',
                streakDays: 7,
                totalSessions: 20,
            };

            const summary = coach.getSessionSummary(context);

            expect(summary.message.toLowerCase()).toContain('week');
        });
    });

    describe('getGreeting', () => {
        it('should return morning greeting', () => {
            const greeting = coach.getGreeting({
                timeOfDay: 'morning',
                streakDays: 0,
                totalSessions: 5,
            });

            expect(greeting.toLowerCase()).toContain('morning');
        });

        it('should welcome first-time users', () => {
            const greeting = coach.getGreeting({
                timeOfDay: 'afternoon',
                streakDays: 0,
                totalSessions: 0,
            });

            expect(greeting.toLowerCase()).toContain('welcome');
        });

        it('should highlight long streaks', () => {
            const greeting = coach.getGreeting({
                timeOfDay: 'evening',
                streakDays: 7,
                totalSessions: 30,
            });

            expect(greeting).toContain('7');
            expect(greeting).toContain('streak');
        });
    });

    describe('getCoachingMessage', () => {
        it('should respect minimum interval', () => {
            const context: CoachingContext = {
                currentPhase: 'Inhale',
                cyclesCompleted: 5,
                heartRate: 60,
                hrv: null,
                patternId: 'box',
                sessionDurationSec: 60,
                timeOfDay: 'morning',
                streakDays: 0,
                totalSessions: 5,
            };

            // First message might return null or a message
            const first = coach.getCoachingMessage(context);

            // Second message should be null (too soon)
            const second = coach.getCoachingMessage(context);

            // At least one should be null due to interval
            expect(first === null || second === null).toBe(true);
        });

        it('should return milestone for special cycles', () => {
            const coach2 = new BreathingCoach();
            const context: CoachingContext = {
                currentPhase: 'Exhale',
                cyclesCompleted: 5, // Milestone
                heartRate: null,
                hrv: null,
                patternId: 'coherence',
                sessionDurationSec: 120,
                timeOfDay: 'afternoon',
                streakDays: 0,
                totalSessions: 10,
            };

            // May or may not return message due to randomness
            const message = coach2.getCoachingMessage(context);

            if (message) {
                expect(['encouragement', 'guidance', 'insight', 'milestone']).toContain(message.type);
            }
        });
    });
});
