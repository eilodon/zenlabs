/**
 * Session Screen - Main breathing session UI (Updated)
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
} from 'react-native';
import { BreathCircle, PatternPicker, VitalsDisplay, Timer } from '../components';
import { useZenOneStore } from '../stores/zenoneStore';
import { useZenOne } from '../hooks/useZenOne';

const PHASE_LABELS = {
    Inhale: 'Breathe In',
    HoldIn: 'Hold',
    Exhale: 'Breathe Out',
    HoldOut: 'Hold',
};

const PHASE_INSTRUCTIONS = {
    Inhale: 'Slowly fill your lungs',
    HoldIn: 'Keep the air in',
    Exhale: 'Release slowly',
    HoldOut: 'Stay empty',
};

// All 11 patterns from breath_patterns.rs
const ALL_PATTERNS = [
    { id: '4-7-8', label: 'Tranquility', tag: 'Sleep & Anxiety', description: 'Natural tranquilizer', inhale_sec: 4, hold_in_sec: 7, exhale_sec: 8, hold_out_sec: 0 },
    { id: 'box', label: 'Focus', tag: 'Concentration', description: 'Navy SEALs technique', inhale_sec: 4, hold_in_sec: 4, exhale_sec: 4, hold_out_sec: 4 },
    { id: 'calm', label: 'Balance', tag: 'Coherence', description: 'Restores HRV balance', inhale_sec: 4, hold_in_sec: 0, exhale_sec: 6, hold_out_sec: 0 },
    { id: 'coherence', label: 'Coherence', tag: 'Heart Health', description: 'HRV Golden Ratio', inhale_sec: 6, hold_in_sec: 0, exhale_sec: 6, hold_out_sec: 0 },
    { id: 'deep-relax', label: 'Deep Rest', tag: 'Stress Relief', description: 'Parasympathetic', inhale_sec: 4, hold_in_sec: 0, exhale_sec: 8, hold_out_sec: 0 },
    { id: '7-11', label: '7-11', tag: 'Deep Calm', description: 'Panic relief', inhale_sec: 7, hold_in_sec: 0, exhale_sec: 11, hold_out_sec: 0 },
    { id: 'awake', label: 'Energize', tag: 'Wake Up', description: 'Boost alertness', inhale_sec: 4, hold_in_sec: 0, exhale_sec: 2, hold_out_sec: 0 },
    { id: 'triangle', label: 'Triangle', tag: 'Yoga', description: 'Emotional stability', inhale_sec: 4, hold_in_sec: 4, exhale_sec: 4, hold_out_sec: 0 },
    { id: 'tactical', label: 'Tactical', tag: 'Advanced Focus', description: 'High-stress', inhale_sec: 5, hold_in_sec: 5, exhale_sec: 5, hold_out_sec: 5 },
    { id: 'buteyko', label: 'Light Air', tag: 'Health', description: 'Reduced breathing', inhale_sec: 3, hold_in_sec: 0, exhale_sec: 3, hold_out_sec: 4 },
    { id: 'wim-hof', label: 'Tummo Power', tag: 'Immunity', description: 'Charge the body', inhale_sec: 2, hold_in_sec: 0, exhale_sec: 1, hold_out_sec: 15 },
];

export const SessionScreen: React.FC = () => {
    const {
        patterns,
        selectedPatternId,
        isSessionActive,
        currentFrame,
        sessionStats,
        setPatterns,
        selectPattern,
        startSession,
        stopSession,
    } = useZenOneStore();

    // Initialize patterns and breathing timer
    useEffect(() => {
        setPatterns(ALL_PATTERNS);
    }, [setPatterns]);

    // Use the ZenOne hook for timing logic
    useZenOne();

    const sessionTimeRef = useRef(0);

    const handleStartStop = useCallback(() => {
        if (isSessionActive) {
            stopSession({
                durationSec: sessionTimeRef.current,
                cyclesCompleted: currentFrame.cyclesCompleted,
                patternId: selectedPatternId,
                avgHeartRate: null, // Would come from rPPG
            });
        } else {
            sessionTimeRef.current = 0;
            startSession();
        }
    }, [isSessionActive, currentFrame, selectedPatternId, startSession, stopSession]);

    const selectedPattern = patterns.find(p => p.id === selectedPatternId);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ZenOne</Text>
                {selectedPattern && (
                    <View style={styles.patternBadge}>
                        <Text style={styles.patternBadgeText}>{selectedPattern.label}</Text>
                    </View>
                )}
            </View>

            {/* Timer (during session) */}
            {isSessionActive && (
                <Timer
                    isRunning={isSessionActive}
                    onTick={(s) => { sessionTimeRef.current = s; }}
                />
            )}

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
                <Text style={styles.phaseInstruction}>
                    {PHASE_INSTRUCTIONS[currentFrame.phase]}
                </Text>
            </View>

            {/* Vitals Display */}
            <VitalsDisplay
                heartRate={currentFrame.heartRate}
                signalQuality={currentFrame.signalQuality}
                cyclesCompleted={currentFrame.cyclesCompleted}
            />

            {/* Pattern Picker (only when not in session) */}
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
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    {isSessionActive ? '⏹ End Session' : '▶️ Start Session'}
                </Text>
            </TouchableOpacity>

            {/* Session Stats (after session ends) */}
            {sessionStats && !isSessionActive && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>✨ Session Complete!</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Duration:</Text>
                        <Text style={styles.statsValue}>
                            {Math.floor(sessionStats.durationSec / 60)}:{(sessionStats.durationSec % 60).toFixed(0).padStart(2, '0')}
                        </Text>
                    </View>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Cycles:</Text>
                        <Text style={styles.statsValue}>{sessionStats.cyclesCompleted}</Text>
                    </View>
                    {sessionStats.avgHeartRate && (
                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Avg HR:</Text>
                            <Text style={styles.statsValue}>
                                {Math.round(sessionStats.avgHeartRate)} BPM
                            </Text>
                        </View>
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
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    patternBadge: {
        backgroundColor: '#4ECDC433',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    patternBadgeText: {
        color: '#4ECDC4',
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
        fontSize: 28,
        fontWeight: '600',
        marginTop: 24,
    },
    phaseInstruction: {
        color: '#888',
        fontSize: 16,
        marginTop: 8,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 14,
        marginLeft: 20,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    button: {
        backgroundColor: '#4ECDC4',
        marginHorizontal: 20,
        marginBottom: 24,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    stopButton: {
        backgroundColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
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
        borderRadius: 16,
    },
    statsTitle: {
        color: '#4ECDC4',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    statsLabel: {
        color: '#888',
        fontSize: 16,
    },
    statsValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SessionScreen;
