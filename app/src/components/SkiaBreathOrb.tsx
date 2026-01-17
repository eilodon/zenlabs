/**
 * SkiaBreathOrb - Premium GPU-Accelerated Breathing Visualization
 * 
 * Uses React Native Skia for:
 * - GPU-accelerated rendering (same engine as Flutter)
 * - Smooth 60fps animations via Reanimated SharedValues
 * - Multi-layer radial gradients with blur
 * - Glassmorphism effects
 * 
 * References:
 * - Shopify Engineering: React Native Skia
 * - State of React Native 2024: 3D Graphics
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
    Canvas,
    Circle,
    RadialGradient,
    vec,
    Blur,
    Group,
    Shadow,
    LinearGradient,
    Rect,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    useDerivedValue,
    Easing,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Color theme type
type ColorTheme = 'warm' | 'cool' | 'neutral';

interface SkiaBreathOrbProps {
    phase: FfiPhase;
    progress: number;
    size?: number;
    heartRate?: number | null;
    signalQuality?: number;
    coherence?: number;
    theme?: ColorTheme;
    aiSpeaking?: boolean;
}

// Premium color themes
const THEMES: Record<ColorTheme, {
    deep: string;
    mid: string;
    glow: string;
    accent: string;
    plasma1: string;
    plasma2: string;
}> = {
    warm: {
        deep: '#1a0505',
        mid: '#a3341e',
        glow: '#ffd39a',
        accent: '#ff8f6a',
        plasma1: '#ff6b35',
        plasma2: '#ff2d2d',
    },
    cool: {
        deep: '#000a12',
        mid: '#0b4f6e',
        glow: '#7afff3',
        accent: '#1ad3ff',
        plasma1: '#00d4ff',
        plasma2: '#4040ff',
    },
    neutral: {
        deep: '#0a0a10',
        mid: '#5e5e6e',
        glow: '#ffffff',
        accent: '#c8d6e5',
        plasma1: '#a0a0ff',
        plasma2: '#d0d0ff',
    },
};

// Phase-based color accents
const PHASE_COLORS: Record<FfiPhase, string> = {
    Inhale: '#00FFF0',
    HoldIn: '#00E5FF',
    Exhale: '#40F99B',
    HoldOut: '#FF6FF0',
};

export const SkiaBreathOrb: React.FC<SkiaBreathOrbProps> = ({
    phase,
    progress,
    size = 320,
    heartRate,
    signalQuality = 0,
    coherence = 0.5,
    theme = 'cool',
    aiSpeaking = false,
}) => {
    const colors = THEMES[theme];
    const phaseColor = PHASE_COLORS[phase];

    // Reanimated shared values for 60fps animations
    const pulseScale = useSharedValue(1);
    const glowIntensity = useSharedValue(0.5);
    const innerPulse = useSharedValue(0.9);

    // Breathing pulse animation
    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                withTiming(1.0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, [pulseScale]);

    // Inner core pulse (faster)
    useEffect(() => {
        innerPulse.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.85, { duration: 1500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, [innerPulse]);

    // Heartbeat glow
    useEffect(() => {
        if (heartRate && heartRate > 0) {
            const beatDuration = 60000 / heartRate / 2;
            glowIntensity.value = withRepeat(
                withSequence(
                    withTiming(1.0, { duration: beatDuration * 0.25, easing: Easing.out(Easing.cubic) }),
                    withTiming(0.35, { duration: beatDuration * 1.75, easing: Easing.in(Easing.quad) })
                ),
                -1,
                false
            );
        }
    }, [heartRate, glowIntensity]);

    // Calculate scale based on breath phase
    const getScale = (): number => {
        switch (phase) {
            case 'Inhale': return 0.55 + progress * 0.45;
            case 'HoldIn': return 1.0;
            case 'Exhale': return 1.0 - progress * 0.45;
            case 'HoldOut': return 0.55;
            default: return 0.75;
        }
    };

    const breathScale = getScale();
    const orbSize = size * breathScale;
    const center = vec(size / 2, size / 2);
    const radius = orbSize / 2;

    // Derived values for animations
    const glowRadius = useDerivedValue(() => radius * 1.8 * pulseScale.value);
    const midGlowRadius = useDerivedValue(() => radius * 1.4 * pulseScale.value);
    const mainRadius = useDerivedValue(() => radius * pulseScale.value);
    const innerRadius = useDerivedValue(() => radius * 0.5 * innerPulse.value);
    const coreRadius = useDerivedValue(() => radius * 0.25 * innerPulse.value);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Canvas style={{ width: size, height: size }}>
                {/* Layer 1: Outer glow (largest, most diffuse) */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 1.8}>
                    <RadialGradient
                        c={center}
                        r={radius * 1.8}
                        colors={[colors.glow + '25', colors.accent + '10', 'transparent']}
                    />
                    <Blur blur={35} />
                </Circle>

                {/* Layer 2: Mid glow - pulsating */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 1.5}>
                    <RadialGradient
                        c={center}
                        r={radius * 1.5}
                        colors={[colors.accent + '40', colors.mid + '20', 'transparent']}
                    />
                    <Blur blur={25} />
                </Circle>

                {/* Layer 3: Inner glow - stronger */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 1.2}>
                    <RadialGradient
                        c={center}
                        r={radius * 1.2}
                        colors={[colors.plasma1 + '50', colors.plasma2 + '30', 'transparent']}
                    />
                    <Blur blur={15} />
                </Circle>

                {/* Layer 4: Rim light (Fresnel simulation) */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 1.02} style="stroke" strokeWidth={2}>
                    <LinearGradient
                        start={vec(size / 2 - radius, size / 2 - radius)}
                        end={vec(size / 2 + radius, size / 2 + radius)}
                        colors={[colors.glow + '60', colors.accent + '30', colors.glow + '60']}
                    />
                </Circle>

                {/* Layer 5: Main orb body */}
                <Circle cx={size / 2} cy={size / 2} r={radius}>
                    <RadialGradient
                        c={vec(size / 2 - radius * 0.2, size / 2 - radius * 0.2)}
                        r={radius * 1.2}
                        colors={[colors.mid, colors.deep]}
                    />
                    <Shadow dx={0} dy={0} blur={40} color={colors.accent} />
                </Circle>

                {/* Layer 6: Inner bright core */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 0.5}>
                    <RadialGradient
                        c={center}
                        r={radius * 0.5}
                        colors={[colors.glow + '70', colors.accent + '40', 'transparent']}
                    />
                    <Blur blur={6} />
                </Circle>

                {/* Layer 7: Frosted glass effect */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 0.35}>
                    <RadialGradient
                        c={center}
                        r={radius * 0.35}
                        colors={[colors.glow + '45', colors.mid + '20']}
                    />
                    <Blur blur={3} />
                </Circle>

                {/* Layer 8: Phase-colored center spot */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 0.15}>
                    <RadialGradient
                        c={center}
                        r={radius * 0.15}
                        colors={[phaseColor, colors.glow + '80']}
                    />
                </Circle>

                {/* Layer 9: Tiny bright core */}
                <Circle cx={size / 2} cy={size / 2} r={radius * 0.06}>
                    <RadialGradient
                        c={center}
                        r={radius * 0.06}
                        colors={['#FFFFFF', phaseColor]}
                    />
                </Circle>

                {/* Layer 10: Top highlight (specular reflection) */}
                <Circle
                    cx={size / 2}
                    cy={size / 2 - radius * 0.3}
                    r={radius * 0.2}
                >
                    <RadialGradient
                        c={vec(size / 2, size / 2 - radius * 0.3)}
                        r={radius * 0.2}
                        colors={['rgba(255,255,255,0.45)', 'transparent']}
                    />
                </Circle>

                {/* Coherence rings (if coherence > 0.3) */}
                {coherence > 0.3 && (
                    <Group>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius * 1.3}
                            style="stroke"
                            strokeWidth={1.5}
                            color={phaseColor}
                            opacity={coherence * 0.5}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius * 1.5}
                            style="stroke"
                            strokeWidth={1}
                            color={phaseColor}
                            opacity={coherence * 0.3}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius * 1.7}
                            style="stroke"
                            strokeWidth={0.5}
                            color={phaseColor}
                            opacity={coherence * 0.15}
                        />
                    </Group>
                )}

                {/* AI Speaking indicator - animated ring */}
                {aiSpeaking && (
                    <Group>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius * 1.1}
                            style="stroke"
                            strokeWidth={3}
                        >
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(size, size)}
                                colors={[colors.plasma1, colors.plasma2, colors.plasma1]}
                            />
                        </Circle>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius * 1.15}
                            style="stroke"
                            strokeWidth={1}
                            color={colors.glow}
                            opacity={0.5}
                        />
                    </Group>
                )}
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default React.memo(SkiaBreathOrb);
