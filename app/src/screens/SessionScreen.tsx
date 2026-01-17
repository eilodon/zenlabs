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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowOrb, PatternPicker, VitalsDisplay, Timer } from '../components';
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
                <GlowOrb
                    phase={currentFrame.phase}
                    progress={currentFrame.phaseProgress}
                    size={360}
                    heartRate={currentFrame.heartRate}
                    signalQuality={currentFrame.signalQuality}
                />
            </View>

            {/* Phase Text (during session) */}
            {isSessionActive && (
                <View style={styles.phaseContainer}>
                    <Text style={styles.phaseLabel}>
                        {PHASE_LABELS[currentFrame.phase] || currentFrame.phase}
                    </Text>
                    <Text style={styles.phaseInstruction}>
                        {PHASE_INSTRUCTIONS[currentFrame.phase] || ''}
                    </Text>
                </View>
            )}

            {/* Vitals Display */}
            <VitalsDisplay
                heartRate={currentFrame.heartRate}
                signalQuality={currentFrame.signalQuality}
                cyclesCompleted={currentFrame.cyclesCompleted}
            />

            {/* Pattern Picker (only when not in session) */}
            {!isSessionActive && patterns.length > 0 && (
                <View style={styles.pickerContainer}>
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
                activeOpacity={0.85}
            >
                <View style={styles.buttonInner}>
                    <Text style={[styles.buttonIcon, isSessionActive && styles.stopButtonIcon]}>
                        {isSessionActive ? '⏹' : '▶'}
                    </Text>
                    <Text style={[styles.buttonText, isSessionActive && styles.stopButtonText]}>
                        {isSessionActive ? 'END SESSION' : 'START BREATHING'}
                    </Text>
                    {!isSessionActive && (
                        <Text style={styles.buttonArrow}>›</Text>
                    )}
                </View>
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
        backgroundColor: '#0D0D12',
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
        maxHeight: 420,
    },
    phaseContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    phaseLabel: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
    },
    phaseInstruction: {
        color: '#555',
        fontSize: 13,
        marginTop: 4,
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
        backgroundColor: '#FAFAFA',
        marginHorizontal: 20,
        marginBottom: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        fontSize: 16,
        marginRight: 10,
        color: '#1A1A2E',
    },
    stopButtonIcon: {
        color: '#fff',
    },
    stopButton: {
        backgroundColor: '#FF4D4D',
    },
    buttonText: {
        color: '#1A1A2E',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    stopButtonText: {
        color: '#fff',
    },
    buttonArrow: {
        fontSize: 22,
        color: '#888',
        marginLeft: 10,
        fontWeight: '300',
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
