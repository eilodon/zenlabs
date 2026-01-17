/**
 * Enhanced PatternPicker Component
 * Premium UI with RhythmBar, theme gradients, tier badges, and resonance scoring
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PatternInfo } from '../stores/zenoneStore';
import { RhythmBar, COLORS, RADII, SPACING, TYPOGRAPHY } from './design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

// Theme color scheme
export type ThemeColor = 'warm' | 'cool' | 'neutral';

// Extended pattern info with UI metadata
export interface EnhancedPatternInfo extends PatternInfo {
    theme?: ThemeColor;
    tier?: number;  // 1-3 difficulty
    resonance?: number;  // 0-1 personalization score
    locked?: boolean;
    lockReason?: string;
}

interface PatternPickerProps {
    patterns: EnhancedPatternInfo[];
    selectedId: string;
    onSelect: (id: string) => void;
}

// Get icon based on pattern characteristics
const getPatternIcon = (id: string): string => {
    if (['4-7-8', 'deep-relax', '7-11'].includes(id)) return 'moon';
    if (['awake', 'wim-hof', 'energy'].includes(id)) return 'flash';
    if (['coherence', 'calm', 'anxiety-relief'].includes(id)) return 'heart';
    if (['box', 'tactical', 'focus'].includes(id)) return 'cube';
    return 'leaf';
};

// Get theme colors
const getThemeColors = (theme: ThemeColor = 'neutral', isSelected: boolean, isLocked: boolean) => {
    if (isLocked) {
        return {
            gradient: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.02)'] as [string, string],
            border: 'rgba(255,255,255,0.05)',
            icon: 'rgba(255,255,255,0.3)',
            text: 'rgba(255,255,255,0.4)',
            accent: 'rgba(255,255,255,0.2)',
        };
    }

    if (!isSelected) {
        return {
            gradient: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.02)'] as [string, string],
            border: 'rgba(255,255,255,0.05)',
            icon: 'rgba(255,255,255,0.6)',
            text: 'rgba(255,255,255,0.6)',
            accent: 'rgba(255,255,255,0.4)',
        };
    }

    const themeConfig = COLORS[theme] || COLORS.neutral;
    return {
        gradient: themeConfig.gradient as [string, string],
        border: themeConfig.border,
        icon: themeConfig.primary,
        text: '#FFFFFF',
        accent: themeConfig.primary,
    };
};

export const PatternPicker: React.FC<PatternPickerProps> = ({
    patterns,
    selectedId,
    onSelect,
}) => {
    const renderPattern = ({ item }: { item: EnhancedPatternInfo }) => {
        const isSelected = item.id === selectedId;
        const isLocked = item.locked ?? false;
        const theme = item.theme || 'neutral';
        const colors = getThemeColors(theme, isSelected, isLocked);
        const iconName = getPatternIcon(item.id);
        const tier = item.tier || 1;
        const resonance = item.resonance || 0;
        const isHighResonance = resonance > 0.7;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { borderColor: colors.border },
                    isSelected && styles.selectedCard,
                    isHighResonance && isSelected && styles.highResonanceCard,
                ]}
                onPress={() => !isLocked && onSelect(item.id)}
                activeOpacity={isLocked ? 1 : 0.8}
            >
                <LinearGradient
                    colors={colors.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBg}
                />

                {/* Top Section */}
                <View style={styles.topSection}>
                    <View style={styles.headerRow}>
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.icon : 'rgba(255,255,255,0.05)' }]}>
                            {isLocked ? (
                                <Ionicons name="lock-closed" size={16} color={colors.icon} />
                            ) : (
                                <Ionicons
                                    name={iconName as any}
                                    size={18}
                                    color={isSelected ? '#000' : colors.icon}
                                />
                            )}
                        </View>

                        {/* Tier + Resonance badges */}
                        {!isLocked && (
                            <View style={styles.badges}>
                                {/* Tier dots */}
                                <View style={styles.tierDots}>
                                    {[...Array(tier)].map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.tierDot,
                                                { backgroundColor: isSelected ? colors.accent : 'rgba(255,255,255,0.2)' }
                                            ]}
                                        />
                                    ))}
                                </View>

                                {/* Resonance badge */}
                                {resonance > 0.6 && (
                                    <View style={[
                                        styles.resonanceBadge,
                                        resonance > 0.8 && styles.resonanceBadgeHigh,
                                    ]}>
                                        <Ionicons name="finger-print" size={8} color={resonance > 0.8 ? '#10B981' : 'rgba(255,255,255,0.4)'} />
                                        <Text style={[
                                            styles.resonanceText,
                                            resonance > 0.8 && styles.resonanceTextHigh,
                                        ]}>
                                            {Math.round(resonance * 100)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Label */}
                    <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
                        {item.label}
                    </Text>
                    <Text style={styles.tag} numberOfLines={1}>
                        {item.tag}
                    </Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {isLocked ? (
                        <Text style={styles.lockReason}>{item.lockReason || 'Locked'}</Text>
                    ) : (
                        <>
                            {/* Timing */}
                            <View style={styles.timingRow}>
                                <Text style={styles.timing}>
                                    {item.inhale_sec}-{item.hold_in_sec}-{item.exhale_sec}-{item.hold_out_sec}
                                </Text>
                            </View>

                            {/* Rhythm Bar */}
                            <RhythmBar
                                inhale={item.inhale_sec}
                                holdIn={item.hold_in_sec}
                                exhale={item.exhale_sec}
                                holdOut={item.hold_out_sec}
                                accentColor={colors.accent}
                                height={4}
                            />
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={patterns}
            renderItem={renderPattern}
            keyExtractor={(item: EnhancedPatternInfo) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
            snapToInterval={CARD_WIDTH + SPACING.md}
            decelerationRate="fast"
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: RADII.xl,
        padding: SPACING.lg,
        marginRight: SPACING.md,
        borderWidth: 1,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    gradientBg: {
        ...StyleSheet.absoluteFillObject,
    },
    selectedCard: {
        transform: [{ scale: 1 }],
    },
    highResonanceCard: {
        borderColor: 'rgba(16, 185, 129, 0.5)',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    topSection: {
        flex: 1,
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badges: {
        alignItems: 'flex-end',
        gap: SPACING.xs,
    },
    tierDots: {
        flexDirection: 'row',
        gap: 3,
    },
    tierDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    resonanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADII.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    resonanceBadgeHigh: {
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    resonanceText: {
        ...TYPOGRAPHY.mono,
        fontSize: 8,
        color: 'rgba(255,255,255,0.4)',
    },
    resonanceTextHigh: {
        color: '#10B981',
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    tag: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bottomSection: {
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    timingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    timing: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },
    lockReason: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default PatternPicker;
