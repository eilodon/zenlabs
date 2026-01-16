/**
 * BreathCircle Component
 * Animated breathing visualization circle
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BreathCircleProps {
    phase: 'Inhale' | 'HoldIn' | 'Exhale' | 'HoldOut';
    progress: number; // 0.0 - 1.0
    size?: number;
}

const PHASE_COLORS = {
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
    const getScale = () => {
        switch (phase) {
            case 'Inhale':
                return 0.6 + progress * 0.4; // 0.6 -> 1.0
            case 'HoldIn':
                return 1.0;
            case 'Exhale':
                return 1.0 - progress * 0.4; // 1.0 -> 0.6
            case 'HoldOut':
                return 0.6;
        }
    };

    const scale = getScale();
    const color = PHASE_COLORS[phase];

    return (
        <View style={[styles.container, { width: size, height: size }]}>
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
            <View style={styles.innerCircle}>
                <View style={styles.phaseText}>
                    {/* Phase text would go here */}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        opacity: 0.8,
    },
    innerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    phaseText: {},
});

export default BreathCircle;
