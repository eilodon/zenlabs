/**
 * RhythmBar Component
 * Visual timing indicator for breathing patterns
 * Shows proportional bars for inhale/holdIn/exhale/holdOut
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADII } from './tokens';

export interface RhythmBarProps {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
    accentColor?: string;
    height?: number;
}

export const RhythmBar: React.FC<RhythmBarProps> = ({
    inhale,
    holdIn,
    exhale,
    holdOut,
    accentColor = COLORS.primary,
    height = 4,
}) => {
    const total = inhale + holdIn + exhale + holdOut;
    if (total === 0) return null;

    const getWidth = (val: number) => `${(val / total) * 100}%`;

    return (
        <View style={[styles.container, { height }]}>
            {/* Inhale - Full accent color */}
            <View
                style={[
                    styles.segment,
                    { width: getWidth(inhale), backgroundColor: accentColor },
                ]}
            />

            {/* Hold In - Muted */}
            {holdIn > 0 && (
                <View
                    style={[
                        styles.segment,
                        { width: getWidth(holdIn), backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                />
            )}

            {/* Exhale - Faded accent */}
            <View
                style={[
                    styles.segment,
                    { width: getWidth(exhale), backgroundColor: accentColor, opacity: 0.6 },
                ]}
            />

            {/* Hold Out - Muted */}
            {holdOut > 0 && (
                <View
                    style={[
                        styles.segment,
                        { width: getWidth(holdOut), backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 2,
        borderRadius: RADII.full,
        overflow: 'hidden',
        opacity: 0.8,
    },
    segment: {
        borderRadius: 2,
    },
});
