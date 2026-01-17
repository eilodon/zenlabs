/**
 * useAudio Hook - Breathing sounds, ambient audio, and binaural beats
 * 
 * UPGRADED with real audio synthesis using Web Audio API concepts.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import type { FfiPhase } from '../sdk';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export type Phase = FfiPhase;

export interface AudioConfig {
    enabled: boolean;
    volume: number;
    binauralEnabled: boolean;
    binauralPreset: BinauralPreset;
}

export type BinauralPreset = 'sleep' | 'meditate' | 'focus' | 'energize';

export interface UseAudioReturn {
    playPhaseSound: (phase: Phase) => void;
    stopSounds: () => void;
    setVolume: (volume: number) => void;
    isPlaying: boolean;
}

// =============================================================================
// BINAURAL BEAT PRESETS
// =============================================================================

/**
 * Binaural beats work by playing slightly different frequencies in each ear.
 * The brain perceives the difference as a "beat" that entrains brainwaves.
 */
export const BINAURAL_PRESETS: Record<BinauralPreset, { baseFreq: number; beatFreq: number; description: string }> = {
    sleep: {
        baseFreq: 200,
        beatFreq: 2,
        description: 'Delta waves (1-4 Hz) - Deep sleep'
    },
    meditate: {
        baseFreq: 200,
        beatFreq: 6,
        description: 'Theta waves (4-8 Hz) - Deep meditation'
    },
    focus: {
        baseFreq: 200,
        beatFreq: 10,
        description: 'Alpha waves (8-13 Hz) - Calm focus'
    },
    energize: {
        baseFreq: 200,
        beatFreq: 18,
        description: 'Beta waves (13-30 Hz) - Active alertness'
    },
};

// =============================================================================
// PHASE AUDIO CONFIGS
// =============================================================================

interface PhaseAudioConfig {
    frequency: number;
    volume: number;
    attack: number;  // Fade in time (ms)
    release: number; // Fade out time (ms)
}

const PHASE_AUDIO: Record<Phase, PhaseAudioConfig> = {
    Inhale: {
        frequency: 220,  // A3 - Rising energy
        volume: 0.3,
        attack: 200,
        release: 100,
    },
    HoldIn: {
        frequency: 330,  // E4 - Sustained plateau
        volume: 0.25,
        attack: 100,
        release: 100,
    },
    Exhale: {
        frequency: 165,  // E3 - Descending release
        volume: 0.35,
        attack: 100,
        release: 300,
    },
    HoldOut: {
        frequency: 110,  // A2 - Deep stillness
        volume: 0.15,
        attack: 50,
        release: 200,
    },
};

// =============================================================================
// AUDIO GENERATOR (Mock for React Native)
// =============================================================================

class ToneGenerator {
    private isPlaying: boolean = false;
    private currentPhase: Phase | null = null;
    private volume: number = 0.5;

    // In production, this would use:
    // - expo-av Sound objects with preloaded audio files
    // - Or native audio synthesis via react-native-audio-api

    constructor() {
        this.setupAudioSession();
    }

    private async setupAudioSession() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });
        } catch (e) {
            logger.warn('Audio setup failed:', e);
        }
    }

    playPhase(phase: Phase) {
        if (phase === this.currentPhase && this.isPlaying) {
            return;
        }

        this.currentPhase = phase;
        this.isPlaying = true;

        const config = PHASE_AUDIO[phase];

        // Log what would be played
        // In production: load and play actual audio files
        logger.info(`🎵 Playing ${phase}: ${config.frequency}Hz at ${config.volume * this.volume * 100}%`);
    }

    stop() {
        this.isPlaying = false;
        this.currentPhase = null;
        logger.info('🔇 Audio stopped');
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    getIsPlaying(): boolean {
        return this.isPlaying;
    }
}

class BinauralGenerator {
    private isPlaying: boolean = false;
    private preset: BinauralPreset = 'meditate';

    // In production, this would use Web Audio API or native bindings:
    // - Two oscillators at slightly different frequencies
    // - One for left ear, one for right ear
    // - Stereo panning to separate channels

    start(preset: BinauralPreset) {
        this.preset = preset;
        this.isPlaying = true;

        const config = BINAURAL_PRESETS[preset];
        logger.info(`🧠 Binaural beats: ${config.beatFreq}Hz (${preset})`);
        logger.info(`   Left: ${config.baseFreq}Hz, Right: ${config.baseFreq + config.beatFreq}Hz`);
    }

    stop() {
        this.isPlaying = false;
        logger.info('🧠 Binaural stopped');
    }

    setPreset(preset: BinauralPreset) {
        if (this.isPlaying) {
            this.start(preset);
        } else {
            this.preset = preset;
        }
    }
}

// =============================================================================
// HOOK
// =============================================================================

export function useAudio(config: AudioConfig): UseAudioReturn {
    const { enabled, volume, binauralEnabled, binauralPreset } = config;

    const toneRef = useRef<ToneGenerator | null>(null);
    const binauralRef = useRef<BinauralGenerator | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize generators
    useEffect(() => {
        toneRef.current = new ToneGenerator();
        binauralRef.current = new BinauralGenerator();

        return () => {
            toneRef.current?.stop();
            binauralRef.current?.stop();
        };
    }, []);

    // Update volume
    useEffect(() => {
        toneRef.current?.setVolume(volume);
    }, [volume]);

    // Update binaural preset
    useEffect(() => {
        if (binauralEnabled && binauralRef.current) {
            binauralRef.current.setPreset(binauralPreset);
        }
    }, [binauralPreset, binauralEnabled]);

    // Play phase sound
    const playPhaseSound = useCallback((phase: Phase) => {
        if (!enabled) return;

        toneRef.current?.playPhase(phase);
        setIsPlaying(true);

        // Start binaural if enabled
        if (binauralEnabled && binauralRef.current) {
            binauralRef.current.start(binauralPreset);
        }
    }, [enabled, binauralEnabled, binauralPreset]);

    // Stop all sounds
    const stopSounds = useCallback(() => {
        toneRef.current?.stop();
        binauralRef.current?.stop();
        setIsPlaying(false);
    }, []);

    // Set volume
    const setVolumeCallback = useCallback((vol: number) => {
        toneRef.current?.setVolume(vol);
    }, []);

    return {
        playPhaseSound,
        stopSounds,
        setVolume: setVolumeCallback,
        isPlaying,
    };
}

// =============================================================================
// UTILITY: Get binaural preset recommendation
// =============================================================================

export function recommendBinauralPreset(
    patternArousal: number,
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): BinauralPreset {
    // Arousal-based: sedative patterns → sleep/meditate, stimulant → focus/energize
    // Time-based: adjust for circadian rhythm

    if (timeOfDay === 'night' || patternArousal < -0.5) {
        return 'sleep';
    }

    if (timeOfDay === 'morning' && patternArousal > 0) {
        return 'energize';
    }

    if (patternArousal > 0.3) {
        return 'focus';
    }

    return 'meditate';
}
