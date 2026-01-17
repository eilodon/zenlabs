/**
 * PatternPicker V2 - Premium pattern selection UI
 * 
 * Features:
 * - Category icons per pattern
 * - Gradient backgrounds based on theme
 * - Timing visualization bar
 * - Selected card glow effect
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import type { PatternInfo } from '../stores/zenoneStore';

interface PatternPickerProps {
    patterns: PatternInfo[];
    selectedId: string;
    onSelect: (id: string) => void;
}

// Pattern category icons and themes
const PATTERN_CONFIG: Record<string, {
    icon: string;
    theme: 'warm' | 'cool' | 'neutral';
}> = {
    '4-7-8': { icon: '☾', theme: 'warm' },
    'box': { icon: '◇', theme: 'neutral' },
    'coherence': { icon: '♡', theme: 'cool' },
    'deep-relax': { icon: '☁', theme: 'warm' },
    'awake': { icon: '☀', theme: 'warm' },
    'focus': { icon: '◎', theme: 'neutral' },
    '7-11': { icon: '∿', theme: 'cool' },
    'wim-hof': { icon: '❄', theme: 'cool' },
    'tactical': { icon: '⬡', theme: 'neutral' },
    'resonance': { icon: '≋', theme: 'cool' },
    'energize': { icon: '⚡', theme: 'warm' },
};

// Theme colors for gradients
const THEME_COLORS = {
    warm: {
        primary: '#F97316',
        secondary: '#BE123C',
        bg: 'rgba(249, 115, 22, 0.12)',
        border: 'rgba(249, 115, 22, 0.4)',
        accent: '#FF8F6A',
    },
    cool: {
        primary: '#06B6D4',
        secondary: '#2563EB',
        bg: 'rgba(6, 182, 212, 0.12)',
        border: 'rgba(6, 182, 212, 0.4)',
        accent: '#7AFFF3',
    },
    neutral: {
        primary: '#FFFFFF',
        secondary: '#6B7280',
        bg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.25)',
        accent: '#E8E8E8',
    },
};

// Timing bar component
const TimingBar: React.FC<{
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
    themeColors: typeof THEME_COLORS.warm;
}> = ({ inhale, holdIn, exhale, holdOut, themeColors }) => {
    const total = inhale + holdIn + exhale + holdOut;
    if (total === 0) return null;

    const segments = [
        { value: inhale, color: themeColors.primary },
        { value: holdIn, color: themeColors.secondary },
        { value: exhale, color: themeColors.primary },
        { value: holdOut, color: themeColors.secondary },
    ].filter(s => s.value > 0);

    return (
        <View style={styles.timingBarContainer}>
            <View style={styles.timingBar}>
                {segments.map((seg, i) => (
                    <View
                        key={i}
                        style={[
                            styles.timingSegment,
                            {
                                flex: seg.value / total,
                                backgroundColor: seg.color,
                                opacity: i % 2 === 0 ? 0.9 : 0.5,
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export const PatternPicker: React.FC<PatternPickerProps> = ({
    patterns,
    selectedId,
    onSelect,
}) => {
    const renderPattern = ({ item }: { item: PatternInfo }) => {
        const isSelected = item.id === selectedId;

        // Get config or fallback
        const config = PATTERN_CONFIG[item.id] || { icon: '●', theme: 'neutral' as const };
        const themeColors = THEME_COLORS[config.theme];

        // Format timing string
        const timingParts: number[] = [];
        if (item.inhale_sec > 0) timingParts.push(item.inhale_sec);
        if (item.hold_in_sec > 0) timingParts.push(item.hold_in_sec);
        if (item.exhale_sec > 0) timingParts.push(item.exhale_sec);
        if (item.hold_out_sec > 0) timingParts.push(item.hold_out_sec);
        const timing = timingParts.join('-');

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: isSelected
                            ? themeColors.bg
                            : 'rgba(42, 42, 62, 0.6)',
                        borderColor: isSelected
                            ? themeColors.border
                            : 'transparent',
                    },
                    isSelected && {
                        shadowColor: themeColors.primary,
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 8,
                    }
                ]}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.7}
            >
                {/* Icon badge */}
                <View style={[
                    styles.iconBadge,
                    {
                        backgroundColor: isSelected
                            ? themeColors.primary + '30'
                            : 'rgba(255,255,255,0.08)',
                    }
                ]}>
                    <Text style={[
                        styles.icon,
                        { color: isSelected ? themeColors.accent : '#888' }
                    ]}>
                        {config.icon}
                    </Text>
                </View>

                {/* Pattern name */}
                <Text style={[
                    styles.label,
                    isSelected && { color: themeColors.accent }
                ]}>
                    {item.label}
                </Text>

                {/* Tag / description */}
                <Text style={[
                    styles.tag,
                    isSelected && { color: themeColors.primary }
                ]}>
                    {item.tag}
                </Text>

                {/* Timing bar */}
                <TimingBar
                    inhale={item.inhale_sec}
                    holdIn={item.hold_in_sec}
                    exhale={item.exhale_sec}
                    holdOut={item.hold_out_sec}
                    themeColors={themeColors}
                />

                {/* Timing text */}
                <Text style={[
                    styles.timing,
                    isSelected && { color: themeColors.primary + '99' }
                ]}>
                    {timing}
                </Text>

                {/* Selected indicator dot */}
                {isSelected && (
                    <View style={[
                        styles.selectedDot,
                        { backgroundColor: themeColors.primary }
                    ]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={patterns}
            renderItem={renderPattern}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        minWidth: 148,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        fontSize: 20,
    },
    label: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    tag: {
        color: '#888',
        fontSize: 11,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    timingBarContainer: {
        width: '100%',
        marginTop: 12,
        marginBottom: 6,
    },
    timingBar: {
        height: 4,
        borderRadius: 2,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    timingSegment: {
        height: '100%',
    },
    timing: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'monospace',
        marginTop: 4,
        fontWeight: '600',
    },
    selectedDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 7,
        height: 7,
        borderRadius: 4,
    },
});

export default PatternPicker;
