/**
 * GlowOrb V3 - Ultra Premium Breathing Visualization
 * 
 * Features:
 * - Color themes (warm/cool/neutral)
 * - Saturn ring orbital effect
 * - 7-layer glow for smooth gradients
 * - Rim light Fresnel simulation
 * - Frosted glass inner core
 * - Phase color morphing
 * - Enhanced heartbeat pulse
 * - Upgraded particle system
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Color theme type
type ColorTheme = 'warm' | 'cool' | 'neutral';

interface GlowOrbProps {
    phase: FfiPhase;
    progress: number;
    size?: number;
    heartRate?: number | null;
    signalQuality?: number;
    coherence?: number;
    theme?: ColorTheme;
}

// Premium color themes inspired by WebGL version
const THEMES: Record<ColorTheme, {
    deep: string;
    mid: string;
    glow: string;
    accent: string;
    ring: string;
}> = {
    warm: {
        deep: '#2b0505',
        mid: '#a3341e',
        glow: '#ffd39a',
        accent: '#ff8f6a',
        ring: '#ff6b35',
    },
    cool: {
        deep: '#00121a',
        mid: '#0b4f6e',
        glow: '#7afff3',
        accent: '#1ad3ff',
        ring: '#00d4ff',
    },
    neutral: {
        deep: '#0d0d12',
        mid: '#5e5e6e',
        glow: '#ffffff',
        accent: '#c8d6e5',
        ring: '#a0a0b0',
    },
};

// Phase-based color overrides
const PHASE_ACCENTS: Record<FfiPhase, string> = {
    Inhale: '#00FFF0',
    HoldIn: '#00E5FF',
    Exhale: '#40F99B',
    HoldOut: '#FF6FF0',
};

// Particle configuration
const PARTICLE_COUNT = 16;
const INNER_PARTICLE_COUNT = 8;

export const GlowOrb: React.FC<GlowOrbProps> = ({
    phase,
    progress,
    size = 360,
    heartRate,
    signalQuality = 0,
    coherence = 0.5,
    theme = 'cool',
}) => {
    const colors = THEMES[theme];
    const phaseAccent = PHASE_ACCENTS[phase];

    // Animated values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;
    const innerPulse = useRef(new Animated.Value(0.8)).current;
    const ringAnim1 = useRef(new Animated.Value(0)).current;
    const ringAnim2 = useRef(new Animated.Value(0)).current;
    const ringAnim3 = useRef(new Animated.Value(0)).current;
    const trailOpacity = useRef(new Animated.Value(0)).current;

    // Main breath pulse
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.06,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    // Inner core pulse (faster, smaller)
    useEffect(() => {
        const innerP = Animated.loop(
            Animated.sequence([
                Animated.timing(innerPulse, {
                    toValue: 1.1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(innerPulse, {
                    toValue: 0.85,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        innerP.start();
        return () => innerP.stop();
    }, [innerPulse]);

    // Heartbeat glow
    useEffect(() => {
        if (heartRate && heartRate > 0) {
            const beatDuration = 60000 / heartRate / 2;
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: beatDuration * 0.25,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.35,
                        duration: beatDuration * 1.75,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );
            glow.start();
            return () => glow.stop();
        }
    }, [heartRate, glowAnim]);

    // Particle rotation
    useEffect(() => {
        const rotate = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 40000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        rotate.start();
        return () => rotate.stop();
    }, [rotateAnim]);

    // Saturn ring is now static - no rotation animation needed

    // Coherence rings
    useEffect(() => {
        const animateRings = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 3500,
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
        const r2 = animateRings(ringAnim2, 1200);
        const r3 = animateRings(ringAnim3, 2400);

        r1.start(); r2.start(); r3.start();

        return () => { r1.stop(); r2.stop(); r3.stop(); };
    }, [ringAnim1, ringAnim2, ringAnim3]);

    // Phase trail
    useEffect(() => {
        if (phase === 'Inhale') {
            Animated.timing(trailOpacity, { toValue: 0.7, duration: 500, useNativeDriver: true }).start();
        } else if (phase === 'Exhale') {
            Animated.timing(trailOpacity, { toValue: 0.4, duration: 500, useNativeDriver: true }).start();
        } else {
            Animated.timing(trailOpacity, { toValue: 0.1, duration: 300, useNativeDriver: true }).start();
        }
    }, [phase, trailOpacity]);

    // Calculate scale
    const getScale = (): number => {
        switch (phase) {
            case 'Inhale': return 0.55 + progress * 0.45;
            case 'HoldIn': return 1.0;
            case 'Exhale': return 1.0 - progress * 0.45;
            case 'HoldOut': return 0.55;
            default: return 0.75;
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
            angle: (360 / PARTICLE_COUNT) * i + Math.random() * 10,
            size: 3 + Math.random() * 5,
            distance: 0.58 + Math.random() * 0.12,
            opacity: 0.4 + Math.random() * 0.5,
        }));
    }, []);

    const innerParticles = useMemo(() => {
        return Array.from({ length: INNER_PARTICLE_COUNT }, (_, i) => ({
            angle: (360 / INNER_PARTICLE_COUNT) * i,
            size: 2 + Math.random() * 2,
            distance: 0.42 + Math.random() * 0.08,
        }));
    }, []);

    // Coherence ring render
    const renderCoherenceRing = (anim: Animated.Value, index: number) => {
        const ringScale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.6 + index * 0.15],
        });
        const ringOpacity = anim.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [coherence * 0.7, coherence * 0.4, 0],
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
                        borderColor: phaseAccent,
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
                    {renderCoherenceRing(ringAnim1, 0)}
                    {renderCoherenceRing(ringAnim2, 1)}
                    {renderCoherenceRing(ringAnim3, 2)}
                </>
            )}

            {/* 7-Layer Glow System */}
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 2.0,
                height: orbSize * 2.0,
                borderRadius: orbSize,
                backgroundColor: colors.glow + '08',
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
            }]} />
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 1.7,
                height: orbSize * 1.7,
                borderRadius: orbSize * 0.85,
                backgroundColor: colors.glow + '12',
                transform: [{ scale: pulseAnim }],
            }]} />
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 1.5,
                height: orbSize * 1.5,
                borderRadius: orbSize * 0.75,
                backgroundColor: colors.accent + '18',
                transform: [{ scale: pulseAnim }],
            }]} />
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 1.35,
                height: orbSize * 1.35,
                borderRadius: orbSize * 0.675,
                backgroundColor: colors.mid + '25',
                transform: [{ scale: pulseAnim }],
            }]} />
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 1.2,
                height: orbSize * 1.2,
                borderRadius: orbSize * 0.6,
                backgroundColor: colors.accent + '35',
                transform: [{ scale: pulseAnim }],
            }]} />
            <Animated.View style={[styles.glowLayer, {
                width: orbSize * 1.1,
                height: orbSize * 1.1,
                borderRadius: orbSize * 0.55,
                backgroundColor: colors.mid + '50',
                transform: [{ scale: pulseAnim }],
            }]} />

            {/* Rim Light Layer (Fresnel simulation) */}
            <Animated.View style={[styles.rimLight, {
                width: orbSize * 1.02,
                height: orbSize * 1.02,
                borderRadius: orbSize * 0.51,
                borderColor: colors.glow + '40',
                transform: [{ scale: pulseAnim }],
            }]} />

            {/* Main Orb with gradient */}
            <Animated.View
                style={[
                    styles.orb,
                    {
                        width: orbSize,
                        height: orbSize,
                        borderRadius: orbSize / 2,
                        backgroundColor: colors.mid,
                        transform: [{ scale: pulseAnim }],
                        shadowColor: colors.accent,
                    },
                ]}
            >
                {/* Inner gradient overlay */}
                <View style={[styles.innerGradient, {
                    width: orbSize * 0.92,
                    height: orbSize * 0.92,
                    borderRadius: orbSize * 0.46,
                    backgroundColor: colors.deep + 'CC',
                }]} />

                {/* Frosted glass core */}
                <Animated.View style={[styles.frostedCore, {
                    width: orbSize * 0.55,
                    height: orbSize * 0.55,
                    borderRadius: orbSize * 0.275,
                    backgroundColor: colors.glow + '15',
                    transform: [{ scale: innerPulse }],
                }]} />

                {/* Inner core bright spot */}
                <Animated.View style={[styles.innerCore, {
                    width: orbSize * 0.3,
                    height: orbSize * 0.3,
                    borderRadius: orbSize * 0.15,
                    backgroundColor: colors.glow + '50',
                    transform: [{ scale: innerPulse }],
                }]} />

                {/* Center accent */}
                <View style={[styles.centerSpot, {
                    width: orbSize * 0.12,
                    height: orbSize * 0.12,
                    borderRadius: orbSize * 0.06,
                    backgroundColor: phaseAccent + 'DD',
                }]} />

                {/* Top highlight */}
                <View style={[styles.highlight, {
                    width: orbSize * 0.4,
                    height: orbSize * 0.15,
                    borderRadius: orbSize * 0.075,
                    top: orbSize * 0.12,
                }]} />
            </Animated.View>

            {/* Saturn Ring - Static horizontal ellipse */}
            <View
                style={[
                    styles.saturnRing,
                    {
                        width: orbSize * 1.4,
                        height: orbSize * 0.08,
                        borderRadius: orbSize * 0.7,
                        backgroundColor: colors.ring + '30',
                        borderColor: colors.ring + '60',
                    },
                ]}
            />

            {/* Outer Particles */}
            <Animated.View
                style={[styles.particleRing, {
                    width: orbSize * 1.4,
                    height: orbSize * 1.4,
                    transform: [{ rotate: spin }],
                }]}
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
                                backgroundColor: phaseAccent,
                                opacity: trailOpacity.interpolate({
                                    inputRange: [0, 0.7],
                                    outputRange: [p.opacity * 0.2, p.opacity],
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

            {/* Inner Particles */}
            <Animated.View
                style={[styles.particleRing, {
                    width: orbSize * 1.1,
                    height: orbSize * 1.1,
                    transform: [{ rotate: spinReverse }],
                }]}
            >
                {innerParticles.map((p, i) => (
                    <View
                        key={i}
                        style={[
                            styles.particle,
                            {
                                width: p.size,
                                height: p.size,
                                borderRadius: p.size / 2,
                                backgroundColor: colors.glow,
                                opacity: 0.5,
                                transform: [
                                    { rotate: `${p.angle}deg` },
                                    { translateX: (orbSize * 1.1 * p.distance) / 2 },
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
    rimLight: {
        position: 'absolute',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    orb: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 50,
        elevation: 20,
    },
    innerGradient: {
        position: 'absolute',
    },
    frostedCore: {
        position: 'absolute',
    },
    innerCore: {
        position: 'absolute',
    },
    centerSpot: {
        position: 'absolute',
    },
    highlight: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    },
    saturnRing: {
        position: 'absolute',
        borderWidth: 2,
        backgroundColor: 'transparent',
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
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
});

export default React.memo(GlowOrb);
