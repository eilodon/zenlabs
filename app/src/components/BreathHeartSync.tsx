/**
 * BreathHeartSync - Dual wave visualization
 * 
 * Shows breath wave and heart wave syncing together
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BreathHeartSyncProps {
    phase: FfiPhase;
    progress: number;
    heartRate: number | null;
    coherence: number; // 0-100
}

const WAVE_POINTS = 60;
const WAVE_HEIGHT = 40;

export const BreathHeartSync: React.FC<BreathHeartSyncProps> = ({
    phase,
    progress,
    heartRate,
    coherence,
}) => {
    const breathPhase = useRef(0);
    const heartPhase = useRef(0);
    const animValue = useRef(new Animated.Value(0)).current;

    // Update breath phase based on current phase
    useEffect(() => {
        switch (phase) {
            case 'Inhale':
                breathPhase.current = progress * Math.PI;
                break;
            case 'HoldIn':
                breathPhase.current = Math.PI;
                break;
            case 'Exhale':
                breathPhase.current = Math.PI + progress * Math.PI;
                break;
            case 'HoldOut':
                breathPhase.current = 0;
                break;
        }
    }, [phase, progress]);

    // Animate heart phase based on HR
    useEffect(() => {
        const rate = heartRate ?? 60;
        const duration = 60000 / rate;

        const anim = Animated.loop(
            Animated.timing(animValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            })
        );

        anim.start();
        return () => anim.stop();
    }, [heartRate, animValue]);

    // Generate wave path
    const generateBreathWave = (): string => {
        const points: string[] = [];
        const width = SCREEN_WIDTH - 40;
        const centerY = WAVE_HEIGHT;

        for (let i = 0; i < WAVE_POINTS; i++) {
            const x = (i / WAVE_POINTS) * width;
            const normalizedPhase = breathPhase.current + (i / WAVE_POINTS) * Math.PI * 2;
            const y = centerY - Math.sin(normalizedPhase) * (WAVE_HEIGHT * 0.8);
            points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }

        return points.join(' ');
    };

    const generateHeartWave = (): string => {
        const points: string[] = [];
        const width = SCREEN_WIDTH - 40;
        const centerY = WAVE_HEIGHT * 3;

        for (let i = 0; i < WAVE_POINTS; i++) {
            const x = (i / WAVE_POINTS) * width;
            const normalizedPhase = heartPhase.current + (i / WAVE_POINTS) * Math.PI * 4;
            const y = centerY - Math.sin(normalizedPhase) * (WAVE_HEIGHT * 0.6);
            points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }

        return points.join(' ');
    };

    // Sync indicator (waves merge when coherent)
    const syncOpacity = coherence / 100;

    return (
        <View style={styles.container}>
            {/* Breath wave */}
            <View style={styles.waveContainer}>
                <View style={styles.labelRow}>
                    <View style={[styles.dot, { backgroundColor: '#4ECDC4' }]} />
                    <View style={styles.label}>
                        <View style={styles.labelText}>
                            {/* Text removed - using visual only */}
                        </View>
                    </View>
                </View>
                <WavePath
                    color="#4ECDC4"
                    points={generateBreathWave()}
                />
            </View>

            {/* Sync zone */}
            <Animated.View
                style={[
                    styles.syncZone,
                    { opacity: syncOpacity },
                ]}
            />

            {/* Heart wave */}
            <View style={styles.waveContainer}>
                <View style={styles.labelRow}>
                    <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
                </View>
                <WavePath
                    color="#FF6B6B"
                    points={generateHeartWave()}
                />
            </View>
        </View>
    );
};

// Simple SVG-like wave using View transforms
const WavePath: React.FC<{ color: string; points: string }> = ({ color, points }) => {
    // For React Native without SVG, we'll use a series of dots
    const dotCount = 30;
    const width = SCREEN_WIDTH - 40;

    return (
        <View style={styles.wavePath}>
            {Array.from({ length: dotCount }, (_, i) => {
                const x = (i / dotCount) * width;
                const phase = (i / dotCount) * Math.PI * 2;
                const y = 20 - Math.sin(phase) * 15;

                return (
                    <View
                        key={i}
                        style={[
                            styles.waveDot,
                            {
                                backgroundColor: color,
                                left: x,
                                top: y,
                                opacity: 0.5 + (i / dotCount) * 0.5,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
    },
    waveContainer: {
        height: 50,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    label: {
        flex: 1,
    },
    labelText: {},
    wavePath: {
        height: 40,
        position: 'relative',
    },
    waveDot: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    syncZone: {
        height: 20,
        backgroundColor: '#4ECDC420',
        marginVertical: 8,
        borderRadius: 4,
    },
});

export default React.memo(BreathHeartSync);
