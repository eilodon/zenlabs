/**
 * ZenOne Store - Zustand state management
 * 
 * REFACTORED: Uses SDK types from sdk/ZenOneSDK.ts
 */

import { create } from 'zustand';
import type { FfiPhase } from '../sdk';

// Pattern info for UI (subset of FfiBreathPattern)
export interface PatternInfo {
    id: string;
    label: string;
    tag: string;
    description: string;
    inhale_sec: number;
    hold_in_sec: number;
    exhale_sec: number;
    hold_out_sec: number;
}

// Frame data matching SDK FfiFrame
export interface FrameData {
    phase: FfiPhase;
    phaseProgress: number;
    cyclesCompleted: number;
    heartRate: number | null;
    signalQuality: number;
}

// Session stats matching SDK FfiSessionStats
export interface SessionStats {
    durationSec: number;
    cyclesCompleted: number;
    patternId: string;
    avgHeartRate: number | null;
}

interface ZenOneState {
    // Patterns (loaded from SDK)
    patterns: PatternInfo[];
    selectedPatternId: string;

    // Session state
    isSessionActive: boolean;
    currentFrame: FrameData;
    sessionStats: SessionStats | null;

    // Actions
    setPatterns: (patterns: PatternInfo[]) => void;
    selectPattern: (id: string) => void;
    startSession: () => void;
    stopSession: (stats: SessionStats) => void;
    updateFrame: (frame: FrameData) => void;
}

const DEFAULT_FRAME: FrameData = {
    phase: 'Inhale',
    phaseProgress: 0,
    cyclesCompleted: 0,
    heartRate: null,
    signalQuality: 0,
};

export const useZenOneStore = create<ZenOneState>((set) => ({
    // Initial state
    patterns: [],
    selectedPatternId: '4-7-8',
    isSessionActive: false,
    currentFrame: { ...DEFAULT_FRAME },
    sessionStats: null,

    // Actions
    setPatterns: (patterns) => set({ patterns }),

    selectPattern: (id) => set({ selectedPatternId: id }),

    startSession: () => set({
        isSessionActive: true,
        sessionStats: null,
        currentFrame: { ...DEFAULT_FRAME },
    }),

    stopSession: (stats) => set({
        isSessionActive: false,
        sessionStats: stats,
    }),

    updateFrame: (frame) => set({ currentFrame: frame }),
}));

// Re-export types for convenience
export type { FfiPhase as Phase };
