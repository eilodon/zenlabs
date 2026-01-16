/**
 * ParticleField - Animated background for session screen
 * 
 * Features:
 * - Floating particles
 * - Phase-responsive colors
 * - Depth effect with varying sizes
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleFieldProps {
    phase: FfiPhase;
    intensity?: number; // 0-1, controls particle count/movement
}

const PARTICLE_COUNT = 30;

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    delay: number;
}

const PHASE_COLORS: Record<FfiPhase, string> = {
    Inhale: '#4ECDC4',
    HoldIn: '#45B7D1',
    Exhale: '#96CEB4',
    HoldOut: '#DDA0DD',
};

export const ParticleField: React.FC<ParticleFieldProps> = ({
    phase,
    intensity = 0.5,
}) => {
    const color = PHASE_COLORS[phase];

    // Generate random particles
    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            id: i,
            x: Math.random() * SCREEN_WIDTH,
            y: Math.random() * SCREEN_HEIGHT,
            size: 2 + Math.random() * 4,
            speed: 15000 + Math.random() * 20000,
            opacity: 0.2 + Math.random() * 0.4,
            delay: Math.random() * 5000,
        }));
    }, []);

    return (
        <View style={styles.container}>
            {particles.map((p) => (
                <FloatingParticle
                    key={p.id}
                    particle={p}
                    color={color}
                    intensity={intensity}
                />
            ))}
        </View>
    );
};

interface FloatingParticleProps {
    particle: Particle;
    color: string;
    intensity: number;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({
    particle,
    color,
    intensity,
}) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(opacity, {
            toValue: particle.opacity * intensity,
            duration: 1000,
            delay: particle.delay,
            useNativeDriver: true,
        }).start();

        // Float up animation
        const floatUp = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -100 - Math.random() * 100,
                    duration: particle.speed,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );

        // Slight horizontal drift
        const drift = Animated.loop(
            Animated.sequence([
                Animated.timing(translateX, {
                    toValue: 20 + Math.random() * 30,
                    duration: particle.speed / 2,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: -20 - Math.random() * 30,
                    duration: particle.speed / 2,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        floatUp.start();
        drift.start();

        return () => {
            floatUp.stop();
            drift.stop();
        };
    }, [translateY, translateX, opacity, particle, intensity]);

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: color,
                    opacity,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    particle: {
        position: 'absolute',
    },
});

export default React.memo(ParticleField);
