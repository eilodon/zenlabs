/**
 * GlowOrb V2 - Premium breathing visualization
 * 
 * Features:
 * - Multi-layer gradients
 * - Heartbeat pulse tied to real HR
 * - Coherence rings (HRV-based)
 * - Breath trail particles
 * - Phase-based color transitions
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlowOrbProps {
    phase: FfiPhase;
    progress: number;
    size?: number;
    heartRate?: number | null;
    signalQuality?: number;
    coherence?: number; // 0-1, HRV coherence score
}

// Premium color palette with gradients
const PHASE_COLORS: Record<FfiPhase, {
    primary: string;
    secondary: string;
    tertiary: string;
    glow: string;
    accent: string;
}> = {
    Inhale: {
        primary: '#00D9C0',
        secondary: '#4ECDC4',
        tertiary: '#7EDDD6',
        glow: '#00D9C050',
        accent: '#00FFF0',
    },
    HoldIn: {
        primary: '#00B4D8',
        secondary: '#48CAE4',
        tertiary: '#90E0EF',
        glow: '#00B4D850',
        accent: '#00E5FF',
    },
    Exhale: {
        primary: '#52B788',
        secondary: '#74C69D',
        tertiary: '#95D5B2',
        glow: '#52B78850',
        accent: '#40F99B',
    },
    HoldOut: {
        primary: '#9D4EDD',
        secondary: '#C77DFF',
        tertiary: '#E0AAFF',
        glow: '#9D4EDD50',
        accent: '#FF6FF0',
    },
};

// Particle configuration
const PARTICLE_COUNT = 12;
const RING_COUNT = 3;

export const GlowOrb: React.FC<GlowOrbProps> = ({
    phase,
    progress,
    size = 280,
    heartRate,
    signalQuality = 0,
    coherence = 0.5,
}) => {
    const colors = PHASE_COLORS[phase];

    // Animated values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const ringAnim1 = useRef(new Animated.Value(0)).current;
    const ringAnim2 = useRef(new Animated.Value(0)).current;
    const ringAnim3 = useRef(new Animated.Value(0)).current;
    const trailOpacity = useRef(new Animated.Value(0)).current;

    // Continuous pulse animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    // Heartbeat glow tied to real HR
    useEffect(() => {
        if (heartRate && heartRate > 0) {
            const beatDuration = 60000 / heartRate / 2;
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.9,
                        duration: beatDuration * 0.3,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.4,
                        duration: beatDuration * 1.7,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );
            glow.start();
            return () => glow.stop();
        }
    }, [heartRate, glowAnim]);

    // Slow rotation for ambient effect
    useEffect(() => {
        const rotate = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 45000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        rotate.start();
        return () => rotate.stop();
    }, [rotateAnim]);

    // Coherence rings animation
    useEffect(() => {
        const animateRings = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const r1 = animateRings(ringAnim1, 0);
        const r2 = animateRings(ringAnim2, 1000);
        const r3 = animateRings(ringAnim3, 2000);

        r1.start();
        r2.start();
        r3.start();

        return () => {
            r1.stop();
            r2.stop();
            r3.stop();
        };
    }, [ringAnim1, ringAnim2, ringAnim3]);

    // Breath trail on inhale/exhale
    useEffect(() => {
        if (phase === 'Inhale') {
            Animated.timing(trailOpacity, {
                toValue: 0.6,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else if (phase === 'Exhale') {
            Animated.timing(trailOpacity, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(trailOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [phase, trailOpacity]);

    // Calculate scale based on phase
    const getScale = (): number => {
        switch (phase) {
            case 'Inhale':
                return 0.55 + progress * 0.45;
            case 'HoldIn':
                return 1.0;
            case 'Exhale':
                return 1.0 - progress * 0.45;
            case 'HoldOut':
                return 0.55;
            default:
                return 0.75;
        }
    };

    const scale = getScale();
    const orbSize = size * scale;

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spinReverse = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'],
    });

    // Generate particles
    const particles = useMemo(() => {
        return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            angle: (360 / PARTICLE_COUNT) * i,
            size: 4 + Math.random() * 4,
            distance: 0.65 + Math.random() * 0.1,
            opacity: 0.5 + Math.random() * 0.4,
        }));
    }, []);

    // Coherence ring renders
    const renderRing = (anim: Animated.Value, index: number) => {
        const ringScale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.5 + index * 0.2],
        });
        const ringOpacity = anim.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [coherence * 0.8, coherence * 0.5, 0],
        });

        return (
            <Animated.View
                key={index}
                style={[
                    styles.coherenceRing,
                    {
                        width: orbSize,
                        height: orbSize,
                        borderRadius: orbSize / 2,
                        borderColor: colors.accent,
                        opacity: ringOpacity,
                        transform: [{ scale: ringScale }],
                    },
                ]}
            />
        );
    };

    return (
        <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
            {/* Coherence rings */}
            {coherence > 0.3 && (
                <>
                    {renderRing(ringAnim1, 0)}
                    {renderRing(ringAnim2, 1)}
                    {renderRing(ringAnim3, 2)}
                </>
            )}

            {/* Outer glow layers */}
            <Animated.View
                style={[
                    styles.glowLayer,
                    {
                        width: orbSize * 1.6,
                        height: orbSize * 1.6,
                        borderRadius: orbSize * 0.8,
                        backgroundColor: colors.glow,
                        opacity: glowAnim,
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.glowLayer,
                    {
                        width: orbSize * 1.35,
                        height: orbSize * 1.35,
                        borderRadius: orbSize * 0.675,
                        backgroundColor: colors.tertiary + '30',
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.glowLayer,
                    {
                        width: orbSize * 1.15,
                        height: orbSize * 1.15,
                        borderRadius: orbSize * 0.575,
                        backgroundColor: colors.secondary + '50',
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />

            {/* Main orb with gradient effect */}
            <Animated.View
                style={[
                    styles.orb,
                    {
                        width: orbSize,
                        height: orbSize,
                        borderRadius: orbSize / 2,
                        backgroundColor: colors.primary,
                        transform: [{ scale: pulseAnim }],
                        shadowColor: colors.accent,
                    },
                ]}
            >
                {/* Top highlight */}
                <View
                    style={[
                        styles.highlight,
                        {
                            width: orbSize * 0.5,
                            height: orbSize * 0.2,
                            borderRadius: orbSize * 0.1,
                            top: orbSize * 0.12,
                        },
                    ]}
                />
                {/* Inner glow */}
                <View
                    style={[
                        styles.innerGlow,
                        {
                            width: orbSize * 0.5,
                            height: orbSize * 0.5,
                            borderRadius: orbSize * 0.25,
                            backgroundColor: colors.secondary + '80',
                        },
                    ]}
                />
                {/* Center bright spot */}
                <View
                    style={[
                        styles.centerSpot,
                        {
                            width: orbSize * 0.2,
                            height: orbSize * 0.2,
                            borderRadius: orbSize * 0.1,
                            backgroundColor: colors.accent + 'AA',
                        },
                    ]}
                />
            </Animated.View>

            {/* Orbiting particles - outer ring */}
            <Animated.View
                style={[
                    styles.particleRing,
                    {
                        width: orbSize * 1.4,
                        height: orbSize * 1.4,
                        transform: [{ rotate: spin }],
                    },
                ]}
            >
                {particles.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.particle,
                            {
                                width: p.size,
                                height: p.size,
                                borderRadius: p.size / 2,
                                backgroundColor: colors.accent,
                                opacity: trailOpacity.interpolate({
                                    inputRange: [0, 0.6],
                                    outputRange: [p.opacity * 0.3, p.opacity],
                                }),
                                transform: [
                                    { rotate: `${p.angle}deg` },
                                    { translateX: (orbSize * 1.4 * p.distance) / 2 },
                                ],
                            },
                        ]}
                    />
                ))}
            </Animated.View>

            {/* Inner particles - counter rotation */}
            <Animated.View
                style={[
                    styles.particleRing,
                    {
                        width: orbSize * 1.1,
                        height: orbSize * 1.1,
                        transform: [{ rotate: spinReverse }],
                    },
                ]}
            >
                {particles.slice(0, 6).map((p, i) => (
                    <View
                        key={i}
                        style={[
                            styles.particle,
                            {
                                width: 3,
                                height: 3,
                                borderRadius: 1.5,
                                backgroundColor: colors.tertiary,
                                opacity: 0.6,
                                transform: [
                                    { rotate: `${p.angle * 2}deg` },
                                    { translateX: (orbSize * 1.1) / 2 },
                                ],
                            },
                        ]}
                    />
                ))}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowLayer: {
        position: 'absolute',
    },
    orb: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 15,
    },
    highlight: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    innerGlow: {
        position: 'absolute',
    },
    centerSpot: {
        position: 'absolute',
    },
    particleRing: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
    },
    coherenceRing: {
        position: 'absolute',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
});

export default React.memo(GlowOrb);
