/**
 * Session Screen - Main breathing session UI
 */

import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { BreathCircle } from '../components/BreathCircle';
import { PatternPicker } from '../components/PatternPicker';
import { useZenOneStore } from '../stores/zenoneStore';

// TODO: Import from native bridge
// import { ZenOneRuntime } from '../native/ZenOneRuntime';

const PHASE_LABELS = {
    Inhale: 'Breathe In',
    HoldIn: 'Hold',
    Exhale: 'Breathe Out',
    HoldOut: 'Hold',
};

export const SessionScreen: React.FC = () => {
    const {
        patterns,
        selectedPatternId,
        isSessionActive,
        currentFrame,
        sessionStats,
        selectPattern,
        startSession,
        stopSession,
        updateFrame,
    } = useZenOneStore();

    // Demo patterns (will be loaded from Rust core)
    useEffect(() => {
        const demoPatterns = [
            { id: '4-7-8', label: 'Tranquility', tag: 'Sleep', description: '', inhale_sec: 4, hold_in_sec: 7, exhale_sec: 8, hold_out_sec: 0 },
            { id: 'box', label: 'Focus', tag: 'Concentration', description: '', inhale_sec: 4, hold_in_sec: 4, exhale_sec: 4, hold_out_sec: 4 },
            { id: 'calm', label: 'Balance', tag: 'Coherence', description: '', inhale_sec: 4, hold_in_sec: 0, exhale_sec: 6, hold_out_sec: 0 },
            { id: 'coherence', label: 'Coherence', tag: 'Heart Health', description: '', inhale_sec: 6, hold_in_sec: 0, exhale_sec: 6, hold_out_sec: 0 },
        ];
        useZenOneStore.getState().setPatterns(demoPatterns);
    }, []);

    const handleStartStop = useCallback(() => {
        if (isSessionActive) {
            // Stop session
            stopSession({
                durationSec: 0, // Would come from Rust
                cyclesCompleted: currentFrame.cyclesCompleted,
                patternId: selectedPatternId,
                avgHeartRate: null,
            });
        } else {
            startSession();
        }
    }, [isSessionActive, currentFrame, selectedPatternId, startSession, stopSession]);

    const formatTime = (sec: number) => {
        const min = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${min}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ZenOne</Text>
                {currentFrame.heartRate && (
                    <View style={styles.hrBadge}>
                        <Text style={styles.hrText}>❤️ {Math.round(currentFrame.heartRate)} BPM</Text>
                    </View>
                )}
            </View>

            {/* Main Circle */}
            <View style={styles.circleContainer}>
                <BreathCircle
                    phase={currentFrame.phase}
                    progress={currentFrame.phaseProgress}
                    size={280}
                />
                <Text style={styles.phaseLabel}>
                    {PHASE_LABELS[currentFrame.phase]}
                </Text>
                <Text style={styles.cycleCount}>
                    Cycle {currentFrame.cyclesCompleted}
                </Text>
            </View>

            {/* Pattern Picker */}
            {!isSessionActive && (
                <View style={styles.pickerContainer}>
                    <Text style={styles.sectionTitle}>Choose Pattern</Text>
                    <PatternPicker
                        patterns={patterns}
                        selectedId={selectedPatternId}
                        onSelect={selectPattern}
                    />
                </View>
            )}

            {/* Start/Stop Button */}
            <TouchableOpacity
                style={[styles.button, isSessionActive && styles.stopButton]}
                onPress={handleStartStop}
            >
                <Text style={styles.buttonText}>
                    {isSessionActive ? 'End Session' : 'Start Session'}
                </Text>
            </TouchableOpacity>

            {/* Session Stats (after session ends) */}
            {sessionStats && !isSessionActive && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Session Complete!</Text>
                    <Text style={styles.statsText}>
                        Duration: {formatTime(sessionStats.durationSec)}
                    </Text>
                    <Text style={styles.statsText}>
                        Cycles: {sessionStats.cyclesCompleted}
                    </Text>
                    {sessionStats.avgHeartRate && (
                        <Text style={styles.statsText}>
                            Avg HR: {Math.round(sessionStats.avgHeartRate)} BPM
                        </Text>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    hrBadge: {
        backgroundColor: '#FF6B6B33',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    hrText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
    },
    circleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    phaseLabel: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        marginTop: 24,
    },
    cycleCount: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 14,
        marginLeft: 20,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#4ECDC4',
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#FF6B6B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsCard: {
        backgroundColor: '#2A2A3E',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    statsTitle: {
        color: '#4ECDC4',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsText: {
        color: '#fff',
        fontSize: 16,
        marginVertical: 2,
    },
});

export default SessionScreen;
