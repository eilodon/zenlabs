/**
 * PhaseText - Animated typography for breathing phase
 * 
 * Features:
 * - Smooth scale transitions
 * - Opacity fade
 * - Phase-based colors
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import type { FfiPhase } from '../sdk';

interface PhaseTextProps {
    phase: FfiPhase;
    progress: number;
}

const PHASE_LABELS: Record<FfiPhase, string> = {
    Inhale: 'BREATHE IN',
    HoldIn: 'HOLD',
    Exhale: 'BREATHE OUT',
    HoldOut: 'REST',
};

const PHASE_COLORS: Record<FfiPhase, string> = {
    Inhale: '#4ECDC4',
    HoldIn: '#45B7D1',
    Exhale: '#96CEB4',
    HoldOut: '#DDA0DD',
};

export const PhaseText: React.FC<PhaseTextProps> = ({ phase, progress }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const prevPhaseRef = useRef<FfiPhase>(phase);

    // Animate on phase change
    useEffect(() => {
        if (prevPhaseRef.current !== phase) {
            prevPhaseRef.current = phase;

            Animated.parallel([
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 6,
                        tension: 100,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [phase, scaleAnim, opacityAnim]);

    // Initial fade in
    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [opacityAnim]);

    // Progress-based subtle pulse
    const pulseScale = 1 + Math.sin(progress * Math.PI * 2) * 0.03;

    return (
        <Animated.Text
            style={[
                styles.text,
                {
                    color: PHASE_COLORS[phase],
                    opacity: opacityAnim,
                    transform: [
                        { scale: Animated.multiply(scaleAnim, pulseScale) },
                    ],
                },
            ]}
        >
            {PHASE_LABELS[phase]}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
});

export default React.memo(PhaseText);
