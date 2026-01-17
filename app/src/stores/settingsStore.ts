/**
 * Settings Store - User preferences with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceMode } from '../services/voiceGuidance';
import type { Language } from '../i18n/translations';

export interface SettingsState {
    // Feedback
    hapticEnabled: boolean;
    soundEnabled: boolean;
    volume: number;

    // Voice Guidance
    voiceMode: VoiceMode;
    language: Language;

    // Camera / Biometrics
    cameraEnabled: boolean;

    // Theme
    theme: 'dark' | 'light' | 'auto';

    // Actions
    setHapticEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    setVoiceMode: (mode: VoiceMode) => void;
    setLanguage: (lang: Language) => void;
    setCameraEnabled: (enabled: boolean) => void;
    setTheme: (theme: 'dark' | 'light' | 'auto') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Defaults
            hapticEnabled: true,
            soundEnabled: true,
            volume: 0.5,
            voiceMode: 'off',
            language: 'en',
            cameraEnabled: false,
            theme: 'dark',

            // Actions
            setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setVolume: (volume) => set({ volume }),
            setVoiceMode: (mode) => set({ voiceMode: mode }),
            setLanguage: (lang) => set({ language: lang }),
            setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'zenone-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

