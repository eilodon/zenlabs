/**
 * Breathing Pattern Definitions
 * Migrated from AGOLOS/ZenOne
 */

import { BreathPattern } from './breath';

export const BREATHING_PATTERNS: Record<string, BreathPattern> = {
    '4-7-8': {
        id: '4-7-8',
        label: 'Tranquility',
        tag: 'Sleep & Anxiety',
        description: 'A natural tranquilizer for the nervous system.',
        timings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
        colorTheme: 'warm',
        recommendedCycles: 4,
        tier: 1,
        arousalImpact: -0.8
    },
    box: {
        id: 'box',
        label: 'Focus',
        tag: 'Concentration',
        description: 'Used by Navy SEALs to heighten performance.',
        timings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
        colorTheme: 'neutral',
        recommendedCycles: 6,
        tier: 1,
        arousalImpact: 0.0
    },
    calm: {
        id: 'calm',
        label: 'Balance',
        tag: 'Coherence',
        description: 'Restores balance to your heart rate variability.',
        timings: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
        colorTheme: 'cool',
        recommendedCycles: 8,
        tier: 1,
        arousalImpact: -0.3
    },
    coherence: {
        id: 'coherence',
        label: 'Coherence',
        tag: 'Heart Health',
        description: 'Optimizes Heart Rate Variability (HRV). The "Golden Ratio" of breathing.',
        timings: { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 },
        colorTheme: 'cool',
        recommendedCycles: 10,
        tier: 2,
        arousalImpact: -0.5
    },
    'deep-relax': {
        id: 'deep-relax',
        label: 'Deep Rest',
        tag: 'Stress Relief',
        description: 'Doubling the exhalation to trigger the parasympathetic system.',
        timings: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 },
        colorTheme: 'warm',
        recommendedCycles: 6,
        tier: 1,
        arousalImpact: -0.9
    },
    '7-11': {
        id: '7-11',
        label: '7-11',
        tag: 'Deep Calm',
        description: 'A powerful technique for panic attacks and deep anxiety.',
        timings: { inhale: 7, holdIn: 0, exhale: 11, holdOut: 0 },
        colorTheme: 'warm',
        recommendedCycles: 4,
        tier: 2,
        arousalImpact: -1.0
    },
    'awake': {
        id: 'awake',
        label: 'Energize',
        tag: 'Wake Up',
        description: 'Fast-paced rhythm to boost alertness and energy levels.',
        timings: { inhale: 4, holdIn: 0, exhale: 2, holdOut: 0 },
        colorTheme: 'cool',
        recommendedCycles: 15,
        tier: 2,
        arousalImpact: 0.8
    },
    'triangle': {
        id: 'triangle',
        label: 'Triangle',
        tag: 'Yoga',
        description: 'A geometric pattern for emotional stability and control.',
        timings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 },
        colorTheme: 'neutral',
        recommendedCycles: 8,
        tier: 1,
        arousalImpact: 0.2
    },
    'tactical': {
        id: 'tactical',
        label: 'Tactical',
        tag: 'Advanced Focus',
        description: 'Extended Box Breathing for high-stress situations.',
        timings: { inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 },
        colorTheme: 'neutral',
        recommendedCycles: 5,
        tier: 2,
        arousalImpact: 0.1
    },
    'buteyko': {
        id: 'buteyko',
        label: 'Light Air',
        tag: 'Health',
        description: 'Reduced breathing to improve oxygen uptake (Buteyko Method).',
        timings: { inhale: 3, holdIn: 0, exhale: 3, holdOut: 4 },
        colorTheme: 'cool',
        recommendedCycles: 12,
        tier: 3,
        arousalImpact: -0.2
    },
    'wim-hof': {
        id: 'wim-hof',
        label: 'Tummo Power',
        tag: 'Immunity',
        description: 'Charge the body. Inhale deeply, let go. Repeat.',
        timings: { inhale: 2, holdIn: 0, exhale: 1, holdOut: 15 },
        colorTheme: 'warm',
        recommendedCycles: 30,
        tier: 3,
        arousalImpact: 1.0
    }
};
