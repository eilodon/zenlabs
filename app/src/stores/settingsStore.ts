/**
 * Settings Store - User preferences with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '../i18n/translations';
import type { VoiceMode } from '../services/voiceGuidance';

export interface SettingsState {
    // Feedback
    hapticEnabled: boolean;
    soundEnabled: boolean;
    volume: number;

    // Camera / Biometrics
    cameraEnabled: boolean;

    // Theme
    theme: 'dark' | 'light' | 'auto';

    // Voice & Language
    voiceMode: VoiceMode;
    language: Language;

    // Actions
    setHapticEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    setCameraEnabled: (enabled: boolean) => void;
    setTheme: (theme: 'dark' | 'light' | 'auto') => void;
    setVoiceMode: (mode: VoiceMode) => void;
    setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Defaults
            hapticEnabled: true,
            soundEnabled: true,
            volume: 0.5,
            cameraEnabled: false,
            theme: 'dark',
            voiceMode: 'off',
            language: 'en',

            // Actions
            setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setVolume: (volume) => set({ volume }),
            setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
            setTheme: (theme) => set({ theme }),
            setVoiceMode: (mode) => set({ voiceMode: mode }),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'zenone-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
