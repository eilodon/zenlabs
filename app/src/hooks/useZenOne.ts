/**
 * useZenOne Hook - Bridge to Rust core
 * 
 * In production, this would call native modules via react-native-uniffi
 * For now, implements a JS simulation of breathing timing
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useZenOneStore, Phase, FrameData } from '../stores/zenoneStore';
import * as Haptics from 'expo-haptics';

const PHASE_ORDER: Phase[] = ['Inhale', 'HoldIn', 'Exhale', 'HoldOut'];

interface PatternTiming {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
}

// Pattern timings in seconds (matching breath_patterns.rs)
const PATTERN_TIMINGS: Record<string, PatternTiming> = {
    '4-7-8': { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    'box': { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    'calm': { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    'coherence': { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 },
    'deep-relax': { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 },
    '7-11': { inhale: 7, holdIn: 0, exhale: 11, holdOut: 0 },
    'awake': { inhale: 4, holdIn: 0, exhale: 2, holdOut: 0 },
    'triangle': { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 },
    'tactical': { inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 },
    'buteyko': { inhale: 3, holdIn: 0, exhale: 3, holdOut: 4 },
    'wim-hof': { inhale: 2, holdIn: 0, exhale: 1, holdOut: 15 },
};

export function useZenOne() {
    const {
        selectedPatternId,
        isSessionActive,
        updateFrame,
        stopSession,
    } = useZenOneStore();

    const frameRef = useRef<{
        phase: Phase;
        phaseIndex: number;
        phaseElapsed: number;
        cycles: number;
    }>({
        phase: 'Inhale',
        phaseIndex: 0,
        phaseElapsed: 0,
        cycles: 0,
    });

    const lastHapticPhase = useRef<Phase | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getTiming = useCallback(() => {
        return PATTERN_TIMINGS[selectedPatternId] || PATTERN_TIMINGS['4-7-8'];
    }, [selectedPatternId]);

    const getPhaseDuration = useCallback((phase: Phase): number => {
        const timing = getTiming();
        switch (phase) {
            case 'Inhale': return timing.inhale;
            case 'HoldIn': return timing.holdIn;
            case 'Exhale': return timing.exhale;
            case 'HoldOut': return timing.holdOut;
        }
    }, [getTiming]);

    const getNextPhase = useCallback((currentPhase: Phase): { phase: Phase; cycleIncrement: number } => {
        const timing = getTiming();
        let idx = PHASE_ORDER.indexOf(currentPhase);
        let cycleIncrement = 0;

        // Find next phase with non-zero duration
        for (let i = 0; i < 4; i++) {
            idx = (idx + 1) % 4;
            const nextPhase = PHASE_ORDER[idx];

            if (idx === 0) cycleIncrement = 1; // Completed a cycle

            const duration = getPhaseDuration(nextPhase);
            if (duration > 0) {
                return { phase: nextPhase, cycleIncrement };
            }
        }

        return { phase: 'Inhale', cycleIncrement: 1 };
    }, [getTiming, getPhaseDuration]);

    // Tick function - runs every 16ms (~60fps)
    const tick = useCallback(() => {
        if (!isSessionActive) return;

        const dt = 0.016; // 16ms
        const state = frameRef.current;
        const phaseDuration = getPhaseDuration(state.phase);

        state.phaseElapsed += dt;

        // Check for phase transition
        if (state.phaseElapsed >= phaseDuration) {
            const { phase: nextPhase, cycleIncrement } = getNextPhase(state.phase);
            state.phase = nextPhase;
            state.phaseElapsed = 0;
            state.cycles += cycleIncrement;
            state.phaseIndex = PHASE_ORDER.indexOf(nextPhase);
        }

        // Haptic feedback on phase change
        if (state.phase !== lastHapticPhase.current) {
            lastHapticPhase.current = state.phase;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        }

        // Update store
        const progress = phaseDuration > 0 ? state.phaseElapsed / phaseDuration : 0;
        updateFrame({
            phase: state.phase,
            phaseProgress: Math.min(progress, 1),
            cyclesCompleted: state.cycles,
            heartRate: null, // Would come from rPPG
            signalQuality: 0,
        });
    }, [isSessionActive, getPhaseDuration, getNextPhase, updateFrame]);

    // Start/stop timer based on session state
    useEffect(() => {
        if (isSessionActive) {
            // Reset state
            frameRef.current = {
                phase: 'Inhale',
                phaseIndex: 0,
                phaseElapsed: 0,
                cycles: 0,
            };
            lastHapticPhase.current = null;

            intervalRef.current = setInterval(tick, 16);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isSessionActive, tick]);

    return {
        patternTimings: PATTERN_TIMINGS,
    };
}
