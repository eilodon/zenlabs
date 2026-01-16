/**
 * ZenOne Store - Zustand state management
 */

import { create } from 'zustand';
import type { PatternInfo } from '../components/PatternPicker';

// Types matching Rust FFI
export type Phase = 'Inhale' | 'HoldIn' | 'Exhale' | 'HoldOut';

export interface FrameData {
    phase: Phase;
    phaseProgress: number;
    cyclesCompleted: number;
    heartRate: number | null;
    signalQuality: number;
}

export interface SessionStats {
    durationSec: number;
    cyclesCompleted: number;
    patternId: string;
    avgHeartRate: number | null;
}

interface ZenOneState {
    // Patterns
    patterns: PatternInfo[];
    selectedPatternId: string;

    // Session
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

export const useZenOneStore = create<ZenOneState>((set) => ({
    // Initial state
    patterns: [],
    selectedPatternId: '4-7-8',
    isSessionActive: false,
    currentFrame: {
        phase: 'Inhale',
        phaseProgress: 0,
        cyclesCompleted: 0,
        heartRate: null,
        signalQuality: 0,
    },
    sessionStats: null,

    // Actions
    setPatterns: (patterns) => set({ patterns }),

    selectPattern: (id) => set({ selectedPatternId: id }),

    startSession: () => set({
        isSessionActive: true,
        sessionStats: null,
        currentFrame: {
            phase: 'Inhale',
            phaseProgress: 0,
            cyclesCompleted: 0,
            heartRate: null,
            signalQuality: 0,
        },
    }),

    stopSession: (stats) => set({
        isSessionActive: false,
        sessionStats: stats,
    }),

    updateFrame: (frame) => set({ currentFrame: frame }),
}));
