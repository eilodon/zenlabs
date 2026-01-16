/**
 * Philosophical State Engine - AGOLOS-inspired state machine
 * 
 * Based on AGOLOS PhilosophicalState (Yên/Động/Hỗn Loạn)
 * Maps biometric coherence to philosophical states.
 */

import { type CoherenceState } from './hrvCoherence';

// =============================================================================
// PHILOSOPHICAL STATES
// =============================================================================

export type PhilosophicalStateType = 'YEN' | 'DONG' | 'HON_LOAN';

export interface PhilosophicalState {
    type: PhilosophicalStateType;
    vietnamese: string;
    english: string;
    description: string;
    color: string;
    glowIntensity: number;
    particleSpeed: number;
}

export const PHILOSOPHICAL_STATES: Record<PhilosophicalStateType, PhilosophicalState> = {
    YEN: {
        type: 'YEN',
        vietnamese: 'Yên',
        english: 'Tranquil',
        description: 'Deep coherence achieved',
        color: '#4ECDC4',
        glowIntensity: 1.0,
        particleSpeed: 0.3,
    },
    DONG: {
        type: 'DONG',
        vietnamese: 'Động',
        english: 'Active',
        description: 'Building coherence',
        color: '#FFD93D',
        glowIntensity: 0.7,
        particleSpeed: 0.6,
    },
    HON_LOAN: {
        type: 'HON_LOAN',
        vietnamese: 'Hỗn Loạn',
        english: 'Chaotic',
        description: 'Breathe to center',
        color: '#FF6B6B',
        glowIntensity: 0.4,
        particleSpeed: 1.0,
    },
};

// =============================================================================
// STATE TRANSITIONS
// =============================================================================

interface StateTransition {
    from: PhilosophicalStateType;
    to: PhilosophicalStateType;
    threshold: number;
    direction: 'above' | 'below';
    hysteresis: number;
}

const TRANSITIONS: StateTransition[] = [
    // HON_LOAN → DONG: coherence rises above 30
    { from: 'HON_LOAN', to: 'DONG', threshold: 30, direction: 'above', hysteresis: 5 },
    // DONG → YEN: coherence rises above 65
    { from: 'DONG', to: 'YEN', threshold: 65, direction: 'above', hysteresis: 5 },
    // YEN → DONG: coherence drops below 55
    { from: 'YEN', to: 'DONG', threshold: 55, direction: 'below', hysteresis: 5 },
    // DONG → HON_LOAN: coherence drops below 20
    { from: 'DONG', to: 'HON_LOAN', threshold: 20, direction: 'below', hysteresis: 5 },
];

// =============================================================================
// STATE ENGINE
// =============================================================================

export class PhilosophicalStateEngine {
    private currentState: PhilosophicalStateType = 'DONG';
    private stateHistory: { state: PhilosophicalStateType; timestamp: number }[] = [];
    private coherenceBuffer: number[] = [];

    /**
     * Update state based on coherence
     */
    update(coherence: CoherenceState): PhilosophicalState {
        this.coherenceBuffer.push(coherence.score);
        if (this.coherenceBuffer.length > 10) {
            this.coherenceBuffer.shift();
        }

        // Use smoothed coherence for stability
        const smoothedScore = this.coherenceBuffer.reduce((a, b) => a + b, 0) / this.coherenceBuffer.length;

        // Check transitions
        for (const transition of TRANSITIONS) {
            if (this.currentState !== transition.from) continue;

            const shouldTransition = transition.direction === 'above'
                ? smoothedScore > transition.threshold + transition.hysteresis
                : smoothedScore < transition.threshold - transition.hysteresis;

            if (shouldTransition) {
                this.transitionTo(transition.to);
                break;
            }
        }

        return this.getState();
    }

    private transitionTo(newState: PhilosophicalStateType): void {
        if (this.currentState === newState) return;

        this.stateHistory.push({
            state: this.currentState,
            timestamp: Date.now(),
        });

        // Keep last 20 transitions
        if (this.stateHistory.length > 20) {
            this.stateHistory.shift();
        }

        this.currentState = newState;
    }

    /**
     * Get current philosophical state
     */
    getState(): PhilosophicalState {
        return PHILOSOPHICAL_STATES[this.currentState];
    }

    /**
     * Get time spent in current state (ms)
     */
    getTimeInState(): number {
        const lastTransition = this.stateHistory[this.stateHistory.length - 1];
        if (!lastTransition) return 0;
        return Date.now() - lastTransition.timestamp;
    }

    /**
     * Get state stability (0-1)
     */
    getStability(): number {
        if (this.stateHistory.length < 2) return 1;

        const recentTransitions = this.stateHistory.filter(
            h => Date.now() - h.timestamp < 60000
        );

        // More transitions = less stable
        return Math.max(0, 1 - recentTransitions.length / 5);
    }

    reset(): void {
        this.currentState = 'DONG';
        this.stateHistory = [];
        this.coherenceBuffer = [];
    }
}

// Singleton
let stateEngine: PhilosophicalStateEngine | null = null;

export function getStateEngine(): PhilosophicalStateEngine {
    if (!stateEngine) {
        stateEngine = new PhilosophicalStateEngine();
    }
    return stateEngine;
}

export default PhilosophicalStateEngine;
