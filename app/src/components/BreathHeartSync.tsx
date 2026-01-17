/**
 * BreathHeartSync - Dual wave visualization
 * 
 * Shows breath wave and heart wave syncing together
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { FfiPhase } from '../sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BreathHeartSyncProps {
    phase: FfiPhase;
    progress: number;
    heartRate: number | null;
    coherence: number; // 0-100
}

const DOT_COUNT = 30;
const WAVE_HEIGHT = 40;
const WAVE_WIDTH = SCREEN_WIDTH - 40;
const WAVE_CENTER = WAVE_HEIGHT / 2;
const BREATH_AMPLITUDE = WAVE_HEIGHT * 0.4;
const HEART_AMPLITUDE = WAVE_HEIGHT * 0.3;
const HEART_FRAME_MS = 1000 / 30;

export const BreathHeartSync: React.FC<BreathHeartSyncProps> = ({
    phase,
    progress,
    heartRate,
    coherence,
}) => {
    const breathPhase = useMemo(() => {
        switch (phase) {
            case 'Inhale':
                return progress * Math.PI;
            case 'HoldIn':
                return Math.PI;
            case 'Exhale':
                return Math.PI + progress * Math.PI;
            case 'HoldOut':
                return 0;
            default:
                return 0;
        }
    }, [phase, progress]);

    const [heartPhase, setHeartPhase] = useState(0);

    // Animate heart phase based on HR
    useEffect(() => {
        let rafId: number | null = null;
        let lastUpdate = 0;
        const rate = Math.min(180, Math.max(40, heartRate ?? 60));
        const radiansPerMs = (Math.PI * 2 * rate) / 60000;

        const tick = (time: number) => {
            if (lastUpdate === 0) {
                lastUpdate = time;
            }
            const delta = time - lastUpdate;
            if (delta >= HEART_FRAME_MS) {
                lastUpdate = time;
                setHeartPhase((prev) => (prev + delta * radiansPerMs) % (Math.PI * 2));
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [heartRate]);

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
                    phaseOffset={breathPhase}
                    amplitude={BREATH_AMPLITUDE}
                />
            </View>

            {/* Sync zone */}
            <View style={[styles.syncZone, { opacity: syncOpacity }]} />

            {/* Heart wave */}
            <View style={styles.waveContainer}>
                <View style={styles.labelRow}>
                    <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
                </View>
                <WavePath
                    color="#FF6B6B"
                    phaseOffset={heartPhase}
                    amplitude={HEART_AMPLITUDE}
                    frequency={2}
                />
            </View>
        </View>
    );
};

// Simple SVG-like wave using View transforms
interface WavePathProps {
    color: string;
    phaseOffset: number;
    amplitude: number;
    frequency?: number;
}

const WavePath: React.FC<WavePathProps> = ({
    color,
    phaseOffset,
    amplitude,
    frequency = 1,
}) => {
    const dots = useMemo(() => {
        const count = DOT_COUNT;
        return Array.from({ length: count }, (_, i) => {
            const ratio = count <= 1 ? 0 : i / (count - 1);
            return { ratio, x: ratio * WAVE_WIDTH };
        });
    }, []);

    return (
        <View style={styles.wavePath}>
            {dots.map((dot, i) => {
                const wavePhase = phaseOffset + dot.ratio * Math.PI * 2 * frequency;
                const y = WAVE_CENTER - Math.sin(wavePhase) * amplitude;

                return (
                    <View
                        key={i}
                        style={[
                            styles.waveDot,
                            {
                                backgroundColor: color,
                                left: dot.x,
                                top: y,
                                opacity: 0.4 + dot.ratio * 0.6,
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
