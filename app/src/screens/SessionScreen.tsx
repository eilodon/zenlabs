/**
 * Session Screen - Main breathing session UI
 * 
 * NOW WITH CAMERA INTEGRATION and SESSION PERSISTENCE!
 */

import React, { useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { BreathCircle, PatternPicker, VitalsDisplay, Timer } from '../components';
import { useZenOneStore } from '../stores/zenoneStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSessionStore } from '../stores/sessionStore';
import { useZenOne } from '../hooks/useZenOne';

const PHASE_LABELS: Record<string, string> = {
    Inhale: 'Breathe In',
    HoldIn: 'Hold',
    Exhale: 'Breathe Out',
    HoldOut: 'Hold',
};

const PHASE_INSTRUCTIONS: Record<string, string> = {
    Inhale: 'Slowly fill your lungs',
    HoldIn: 'Keep the air in',
    Exhale: 'Release slowly',
    HoldOut: 'Stay empty',
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
    } = useZenOneStore();

    const { cameraEnabled } = useSettingsStore();
    const addSession = useSessionStore(state => state.addSession);

    // Initialize SDK and load patterns via hook (with camera option)
    const { getSessionStats, camera } = useZenOne({ cameraEnabled });

    const sessionTimeRef = useRef(0);
    const avgSignalQualityRef = useRef<number[]>([]);

    const handleStartStop = useCallback(() => {
        if (isSessionActive) {
            // Get stats from SDK before stopping
            const stats = getSessionStats();
            const selectedPattern = patterns.find(p => p.id === selectedPatternId);

            const sessionData = {
                durationSec: stats?.duration_sec ?? sessionTimeRef.current,
                cyclesCompleted: stats?.cycles_completed ?? currentFrame.cyclesCompleted,
                patternId: stats?.pattern_id ?? selectedPatternId,
                avgHeartRate: stats?.avg_heart_rate ?? null,
            };

            // Save to zenone store
            stopSession(sessionData);

            // Save to session history (for streaks/insights)
            const avgQuality = avgSignalQualityRef.current.length > 0
                ? avgSignalQualityRef.current.reduce((a, b) => a + b, 0) / avgSignalQualityRef.current.length
                : 0;

            addSession({
                date: new Date().toISOString(),
                patternId: sessionData.patternId,
                patternLabel: selectedPattern?.label || sessionData.patternId,
                durationSec: sessionData.durationSec,
                cyclesCompleted: sessionData.cyclesCompleted,
                avgHeartRate: sessionData.avgHeartRate,
                avgSignalQuality: avgQuality,
            });

            avgSignalQualityRef.current = [];
        } else {
            sessionTimeRef.current = 0;
            avgSignalQualityRef.current = [];
            startSession();
        }
    }, [isSessionActive, currentFrame, selectedPatternId, patterns, startSession, stopSession, getSessionStats, addSession]);

    const selectedPattern = patterns.find(p => p.id === selectedPatternId);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ZenOne</Text>
                <View style={styles.headerRight}>
                    {cameraEnabled && isSessionActive && (
                        <View style={styles.cameraBadge}>
                            <Text style={styles.cameraBadgeText}>
                                {camera.isFaceDetected ? '👤 Face' : '📷 Scanning...'}
                            </Text>
                        </View>
                    )}
                    {selectedPattern && (
                        <View style={styles.patternBadge}>
                            <Text style={styles.patternBadgeText}>{selectedPattern.label}</Text>
                        </View>
                    )}
                </View>
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
                    {PHASE_LABELS[currentFrame.phase] || currentFrame.phase}
                </Text>
                <Text style={styles.phaseInstruction}>
                    {PHASE_INSTRUCTIONS[currentFrame.phase] || ''}
                </Text>
            </View>

            {/* Vitals Display */}
            <VitalsDisplay
                heartRate={currentFrame.heartRate}
                signalQuality={currentFrame.signalQuality}
                cyclesCompleted={currentFrame.cyclesCompleted}
            />

            {/* Pattern Picker (only when not in session) */}
            {!isSessionActive && patterns.length > 0 && (
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
                    {sessionStats.avgHeartRate !== null && (
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    cameraBadge: {
        backgroundColor: '#FF6B6B33',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cameraBadgeText: {
        color: '#FF6B6B',
        fontSize: 12,
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
