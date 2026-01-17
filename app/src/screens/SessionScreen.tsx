/**
 * Session Screen - Main breathing session UI
 * 
 * NOW WITH CAMERA INTEGRATION and SESSION PERSISTENCE!
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowOrb, PatternPicker, VitalsDisplay, Timer, SessionManager, SessionComplete } from '../components';
import { useZenOneStore } from '../stores/zenoneStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSessionStore } from '../stores/sessionStore';


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
    const width = useWindowDimensions().width;
    const height = useWindowDimensions().height;

    // Granular selectors to prevent unnecessary re-renders
    const patterns = useZenOneStore(s => s.patterns);
    const selectedPatternId = useZenOneStore(s => s.selectedPatternId);
    const isSessionActive = useZenOneStore(s => s.isSessionActive);
    const currentFrame = useZenOneStore(s => s.currentFrame);
    const sessionStats = useZenOneStore(s => s.sessionStats);

    const selectPattern = useZenOneStore(s => s.selectPattern);
    const startSession = useZenOneStore(s => s.startSession);
    const stopSession = useZenOneStore(s => s.stopSession);
    const setSessionStats = useZenOneStore(s => s.setSessionStats);

    const { cameraEnabled } = useSettingsStore();
    const streak = useSessionStore(s => s.streak);

    const sessionTimeRef = useRef(0);

    // Stable callback for Timer to prevent effect thrashing
    const handleTimerTick = useCallback((s: number) => {
        sessionTimeRef.current = s;
    }, []);

    // We will initiate stop here, but SessionManager handles the data saving
    const handleStartStop = useCallback(() => {
        console.log('SessionScreen: handleStartStop pressed. Current isSessionActive:', isSessionActive);
        if (isSessionActive) {
            console.log('SessionScreen: Calling stopSession');
            // Signal stop - SessionManager will detect and save stats
            stopSession(null as any); // Temporary cast, we will update store types
        } else {
            console.log('SessionScreen: Calling startSession');
            sessionTimeRef.current = 0;
            startSession();
        }
    }, [isSessionActive, startSession, stopSession]);

    // Dynamic layout calculations
    const isLandscape = width > height;
    const orbSize = Math.min(width * 0.85, height * 0.45);
    const spacerHeight = height * 0.02;

    const selectedPattern = patterns.find(p => p.id === selectedPatternId);

    return (
        <SafeAreaView style={styles.container}>
            <SessionManager />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ZenOne</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Text style={styles.settingsIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content Area - Flex Grow to push controls down */}
            <View style={styles.mainContent}>

                {/* Timer / Phase Label (Top of Orb) */}
                <View style={styles.topMetaContainer}>
                    {isSessionActive ? (
                        <View style={styles.activeMeta}>
                            <Text style={styles.phaseLabel}>
                                {PHASE_LABELS[currentFrame.phase] || currentFrame.phase}
                            </Text>
                            <Timer
                                isRunning={isSessionActive}
                                onTick={handleTimerTick}
                            />
                        </View>
                    ) : (
                        <Text style={styles.welcomeText}>
                            {selectedPattern ? selectedPattern.label : 'Select a Pattern'}
                        </Text>
                    )}
                </View>

                {/* Main Orb */}
                <View style={[styles.circleContainer, { height: orbSize, width: width }]}>
                    <GlowOrb
                        phase={currentFrame.phase}
                        progress={currentFrame.phaseProgress}
                        size={orbSize}
                        heartRate={currentFrame.heartRate}
                        signalQuality={currentFrame.signalQuality}
                        theme={selectedPattern?.tag === 'Sleep' ? 'warm' : 'cool'}
                    />
                </View>

                {/* Vitals Display - Floating below Orb */}
                <View style={[styles.vitalsContainer, { marginTop: -orbSize * 0.15 }]}>
                    <VitalsDisplay
                        heartRate={currentFrame.heartRate}
                        signalQuality={currentFrame.signalQuality}
                        cyclesCompleted={currentFrame.cyclesCompleted}
                    />
                </View>

                {/* Phase Instruction (Bottom of Orb) */}
                {isSessionActive && (
                    <Text style={styles.phaseInstruction}>
                        {PHASE_INSTRUCTIONS[currentFrame.phase] || ''}
                    </Text>
                )}
            </View>

            {/* Bottom Controls Area */}
            <View style={styles.bottomControls}>

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

                {/* Start/Stop Button - Premium Pill Shape */}
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        isSessionActive && styles.stopButton
                    ]}
                    onPress={handleStartStop}
                    activeOpacity={0.9}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonIcon}>
                            {isSessionActive ? '⏹' : '▶'}
                        </Text>
                        <Text style={styles.startText}>
                            {isSessionActive ? 'END SESSION' : 'START BREATHING'}
                        </Text>
                        {!isSessionActive && (
                            <Text style={styles.buttonArrow}>›</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Navigation Bar Placeholder (if needed, otherwise margin) */}
                <View style={{ height: 10 }} />
            </View>

            {/* Session Stats Modal/Overlay */}
            {sessionStats && !isSessionActive && (
                <View style={StyleSheet.absoluteFill}>
                    <SessionComplete
                        stats={{
                            durationSec: sessionStats.durationSec,
                            cycles: sessionStats.cyclesCompleted,
                            avgHeartRate: sessionStats.avgHeartRate,
                            hrvChange: null, // Not yet available
                            streakDays: streak.currentStreak,
                            // newBadge: undefined // Gamification not linked yet
                        }}
                        onContinue={() => setSessionStats(null as any)} // Clear stats to close modal
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050508', // Deep organic black
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cameraBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    cameraBadgeText: {
        color: '#FF8F8F',
        fontSize: 11,
        fontWeight: '600',
    },
    settingsButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
    },
    settingsIcon: {
        fontSize: 18,
    },

    // Main Content
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    topMetaContainer: {
        height: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    activeMeta: {
        alignItems: 'center',
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    phaseLabel: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '300',
        letterSpacing: 2,
        marginBottom: 4,
    },
    circleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    vitalsContainer: {
        zIndex: 2,
        alignItems: 'center',
    },
    phaseInstruction: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '400',
        letterSpacing: 0.5,
    },

    // Bottom Controls
    bottomControls: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        zIndex: 100, // Ensure button is always clickable
    },
    pickerContainer: {
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: '#fff',
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 8,
    },
    stopButton: {
        backgroundColor: 'rgba(255, 77, 77, 0.15)',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        shadowColor: '#FF4D4D',
        shadowOpacity: 0.1,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        fontSize: 18,
        marginRight: 10,
        color: '#000',
    },
    startText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    buttonArrow: {
        color: '#000',
        fontSize: 20,
        marginLeft: 8,
        opacity: 0.5,
    },

    // Stats Floating Card (Toast style)
    statsFloatingCard: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(23, 23, 33, 0.95)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    statsTitle: {
        color: '#4ECDC4',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
    },
    statsSummary: {
        color: '#ccc',
        fontSize: 13,
    },
});


export default SessionScreen;
