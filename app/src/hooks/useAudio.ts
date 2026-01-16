/**
 * useAudio Hook - Breathing sounds and ambient audio
 */

import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Phase } from '../stores/zenoneStore';

// Sound URLs (using royalty-free ambient sounds)
// In production, bundle these in assets/sounds/
const SOUND_CONFIG = {
    inhale: {
        // Soft rising tone
        frequency: 220, // A3
        duration: 4000,
    },
    holdIn: {
        // Sustained gentle hum
        frequency: 330, // E4
        duration: 4000,
    },
    exhale: {
        // Descending calm tone
        frequency: 165, // E3
        duration: 6000,
    },
    holdOut: {
        // Silence with very soft pad
        frequency: 110, // A2
        duration: 2000,
    },
};

interface UseAudioOptions {
    enabled: boolean;
    volume?: number;
}

export function useAudio(options: UseAudioOptions = { enabled: true, volume: 0.5 }) {
    const { enabled, volume = 0.5 } = options;
    const soundRef = useRef<Audio.Sound | null>(null);
    const currentPhaseRef = useRef<Phase | null>(null);

    // Initialize audio session
    useEffect(() => {
        const setup = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                });
            } catch (e) {
                console.warn('Audio setup failed:', e);
            }
        };

        if (enabled) {
            setup();
        }

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [enabled]);

    // Play sound for phase
    const playPhaseSound = useCallback(async (phase: Phase) => {
        if (!enabled) return;
        if (phase === currentPhaseRef.current) return;

        currentPhaseRef.current = phase;

        // In production, load bundled audio files:
        // await soundRef.current?.loadAsync(require('../assets/sounds/inhale.mp3'));

        // For now, just log the phase change
        console.log(`🎵 Playing sound for phase: ${phase}`);

        // Placeholder: Use expo-av to load and play phase-specific sounds
        // const config = SOUND_CONFIG[phase.toLowerCase() as keyof typeof SOUND_CONFIG];
        // ... load and play audio
    }, [enabled]);

    // Stop all sounds
    const stopSounds = useCallback(async () => {
        currentPhaseRef.current = null;
        if (soundRef.current) {
            await soundRef.current.stopAsync();
        }
    }, []);

    // Set volume
    const setVolume = useCallback(async (vol: number) => {
        if (soundRef.current) {
            await soundRef.current.setVolumeAsync(vol);
        }
    }, []);

    return {
        playPhaseSound,
        stopSounds,
        setVolume,
    };
}

/**
 * Binaural Beats Generator (for future implementation)
 * 
 * Binaural beats work by playing slightly different frequencies in each ear:
 * - Delta (1-4 Hz): Deep sleep
 * - Theta (4-8 Hz): Meditation, relaxation
 * - Alpha (8-13 Hz): Calm focus
 * - Beta (13-30 Hz): Active thinking
 * 
 * Example: Play 200 Hz in left ear, 210 Hz in right ear = 10 Hz Alpha beat
 */
export const BINAURAL_PRESETS = {
    sleep: { baseFreq: 200, beatFreq: 2 },      // Delta
    meditate: { baseFreq: 200, beatFreq: 6 },   // Theta
    focus: { baseFreq: 200, beatFreq: 10 },     // Alpha
    energize: { baseFreq: 200, beatFreq: 20 },  // Beta
};
