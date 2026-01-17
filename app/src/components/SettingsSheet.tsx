/**
 * SettingsSheet Component
 * Premium settings bottom sheet with grouped options
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    GestureBottomSheet,
    COLORS,
    RADII,
    SPACING,
    TYPOGRAPHY
} from './design-system';
import { useSettingsStore } from '../stores/settingsStore';
import type { Language } from '../i18n/translations';
import type { VoiceMode } from '../services/voiceGuidance';

interface SettingsSheetProps {
    open: boolean;
    onClose: () => void;
}

// Toggle Row Component
const ToggleRow: React.FC<{
    icon: string;
    label: string;
    description?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
}> = ({ icon, label, description, value, onToggle }) => (
    <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
            <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} />
            <View style={styles.toggleLabels}>
                <Text style={styles.toggleLabel}>{label}</Text>
                {description && <Text style={styles.toggleDescription}>{description}</Text>}
            </View>
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary }}
            thumbColor={value ? '#fff' : 'rgba(255,255,255,0.5)'}
        />
    </View>
);

// Language Selector
const LanguageSelector: React.FC<{
    selected: Language;
    onSelect: (lang: Language) => void;
}> = ({ selected, onSelect }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageGrid}>
            <TouchableOpacity
                style={[styles.langButton, selected === 'en' && styles.langButtonSelected]}
                onPress={() => onSelect('en')}
            >
                <Text style={styles.langEmoji}>🇬🇧</Text>
                <Text style={[styles.langLabel, selected === 'en' && styles.langLabelSelected]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langButton, selected === 'vi' && styles.langButtonSelected]}
                onPress={() => onSelect('vi')}
            >
                <Text style={styles.langEmoji}>🇻🇳</Text>
                <Text style={[styles.langLabel, selected === 'vi' && styles.langLabelSelected]}>Tiếng Việt</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Voice Mode Selector  
const VoiceModeSelector: React.FC<{
    selected: VoiceMode;
    onSelect: (mode: VoiceMode) => void;
}> = ({ selected, onSelect }) => {
    const modes: { value: VoiceMode; label: string; icon: string }[] = [
        { value: 'off', label: 'Off', icon: 'volume-mute' },
        { value: 'counting', label: 'Counting', icon: 'chatbubble-ellipses' },
        { value: 'voice', label: 'Voice', icon: 'mic' },
    ];

    return (
        <View style={styles.modeSelector}>
            {modes.map((mode) => (
                <TouchableOpacity
                    key={mode.value}
                    style={[styles.modeButton, selected === mode.value && styles.modeButtonSelected]}
                    onPress={() => onSelect(mode.value)}
                >
                    <Ionicons
                        name={mode.icon as any}
                        size={16}
                        color={selected === mode.value ? COLORS.primary : COLORS.textTertiary}
                    />
                    <Text style={[
                        styles.modeLabel,
                        selected === mode.value && styles.modeLabelSelected
                    ]}>
                        {mode.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onClose }) => {
    const {
        hapticEnabled,
        soundEnabled,
        voiceMode,
        language,
        cameraEnabled,
        setHapticEnabled,
        setSoundEnabled,
        setVoiceMode,
        setLanguage,
        setCameraEnabled,
    } = useSettingsStore();

    return (
        <GestureBottomSheet open={open} onClose={onClose} title="Settings">
            {/* Language */}
            <LanguageSelector selected={language} onSelect={setLanguage} />

            {/* Immersion */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Immersion</Text>
                <View style={styles.toggleList}>
                    <ToggleRow
                        icon="volume-high"
                        label="Sound Effects"
                        value={soundEnabled}
                        onToggle={setSoundEnabled}
                    />
                    <ToggleRow
                        icon="phone-portrait"
                        label="Haptic Feedback"
                        value={hapticEnabled}
                        onToggle={setHapticEnabled}
                    />
                </View>
            </View>

            {/* Voice Guidance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Voice Guidance</Text>
                <VoiceModeSelector selected={voiceMode} onSelect={setVoiceMode} />
            </View>

            {/* Advanced */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Advanced</Text>
                <View style={styles.toggleList}>
                    <ToggleRow
                        icon="camera"
                        label="Camera Biometrics"
                        description="Heart rate via camera"
                        value={cameraEnabled}
                        onToggle={setCameraEnabled}
                    />
                </View>
            </View>

            {/* AI Features (Premium) */}
            <View style={styles.section}>
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.premiumCard}
                >
                    <View style={styles.premiumHeader}>
                        <Ionicons name="sparkles" size={16} color="#A78BFA" />
                        <Text style={styles.premiumTitle}>AI Neuro-Coach</Text>
                    </View>
                    <Text style={styles.premiumDescription}>
                        Real-time adaptive guidance with AI voice coaching.
                    </Text>
                    <TouchableOpacity style={styles.premiumButton}>
                        <Text style={styles.premiumButtonText}>Coming Soon</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Version */}
            <View style={styles.footer}>
                <Text style={styles.version}>ZenOne v1.0.0</Text>
            </View>
        </GestureBottomSheet>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.mono,
        fontSize: 9,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: SPACING.md,
        paddingLeft: 2,
    },
    languageGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    langButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderRadius: RADII.lg,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    langButtonSelected: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    langEmoji: {
        fontSize: 20,
    },
    langLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
    langLabelSelected: {
        color: COLORS.text,
    },
    toggleList: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: RADII.xl,
        overflow: 'hidden',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flex: 1,
    },
    toggleLabels: {
        flex: 1,
    },
    toggleLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    toggleDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    modeSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADII.lg,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modeButtonSelected: {
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderColor: 'rgba(78, 205, 196, 0.3)',
    },
    modeLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
    modeLabelSelected: {
        color: COLORS.primary,
    },
    premiumCard: {
        borderRadius: RADII.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    premiumTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: '#A78BFA',
    },
    premiumDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    premiumButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADII.md,
        alignSelf: 'flex-start',
    },
    premiumButtonText: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: '#A78BFA',
    },
    footer: {
        alignItems: 'center',
        paddingTop: SPACING.xl,
    },
    version: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textMuted,
    },
});

export default SettingsSheet;
