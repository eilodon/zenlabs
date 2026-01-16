/**
 * BreathCircle Component
 * Animated breathing visualization circle
 * 
 * REFACTORED: Uses FfiPhase type from SDK
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { FfiPhase } from '../sdk';

interface BreathCircleProps {
    phase: FfiPhase;
    progress: number; // 0.0 - 1.0
    size?: number;
}

const PHASE_COLORS: Record<FfiPhase, string> = {
    Inhale: '#4ECDC4',
    HoldIn: '#45B7D1',
    Exhale: '#96CEB4',
    HoldOut: '#DDA0DD',
};

export const BreathCircle: React.FC<BreathCircleProps> = ({
    phase,
    progress,
    size = 250,
}) => {
    // Scale based on phase
    const getScale = (): number => {
        switch (phase) {
            case 'Inhale':
                return 0.6 + progress * 0.4; // 0.6 -> 1.0
            case 'HoldIn':
                return 1.0;
            case 'Exhale':
                return 1.0 - progress * 0.4; // 1.0 -> 0.6
            case 'HoldOut':
                return 0.6;
            default:
                return 0.8;
        }
    };

    const scale = getScale();
    const color = PHASE_COLORS[phase] || '#4ECDC4';

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer glow */}
            <View
                style={[
                    styles.glow,
                    {
                        width: size * scale * 1.1,
                        height: size * scale * 1.1,
                        borderRadius: (size * scale * 1.1) / 2,
                        backgroundColor: color,
                        opacity: 0.2,
                    },
                ]}
            />
            {/* Main circle */}
            <View
                style={[
                    styles.circle,
                    {
                        width: size * scale,
                        height: size * scale,
                        borderRadius: (size * scale) / 2,
                        backgroundColor: color,
                    },
                ]}
            />
            {/* Inner circle */}
            <View style={[styles.innerCircle, { backgroundColor: color + '50' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
    },
    circle: {
        position: 'absolute',
        opacity: 0.9,
    },
    innerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default React.memo(BreathCircle);
