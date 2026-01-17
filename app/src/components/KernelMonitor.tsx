/**
 * KernelMonitor Component
 * Debug dashboard for monitoring app state and metrics
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, TYPOGRAPHY, SHADOWS } from './design-system';
import { useZenOneStore } from '../stores/zenoneStore';
import { useSettingsStore } from '../stores/settingsStore';

export interface KernelMonitorProps {
    visible: boolean;
    onClose: () => void;
}

interface LogEntry {
    time: number;
    type: 'event' | 'state' | 'error' | 'warn';
    message: string;
}

// Progress Bar Component
const ProgressBar: React.FC<{
    label: string;
    value: number;
    color: string;
    maxValue?: number;
}> = ({ label, value, color, maxValue = 1 }) => {
    const percent = Math.min(100, (value / maxValue) * 100);

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={[styles.progressValue, { color }]}>{value.toFixed(2)}</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

// Metric Card Component
const MetricCard: React.FC<{
    icon: string;
    label: string;
    value: string | number;
    color?: string;
}> = ({ icon, label, value, color = COLORS.text }) => (
    <View style={styles.metricCard}>
        <Ionicons name={icon as any} size={14} color={COLORS.textTertiary} />
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
);

export const KernelMonitor: React.FC<KernelMonitorProps> = ({ visible, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<ScrollView>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Get state from stores
    const currentFrame = useZenOneStore(s => s.currentFrame);
    const isSessionActive = useZenOneStore(s => s.isSessionActive);
    const selectedPatternId = useZenOneStore(s => s.selectedPatternId);
    const settings = useSettingsStore();

    // Add log entry
    const addLog = (type: LogEntry['type'], message: string) => {
        setLogs(prev => [...prev.slice(-49), { time: Date.now(), type, message }]);
    };

    // Log state changes
    useEffect(() => {
        if (visible) {
            addLog('state', `Phase: ${currentFrame.phase}, Progress: ${currentFrame.phaseProgress.toFixed(2)}`);
        }
    }, [currentFrame.phase, visible]);

    // Pulse animation
    useEffect(() => {
        if (isSessionActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isSessionActive, pulseAnim]);

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'error': return COLORS.error;
            case 'warn': return COLORS.warn;
            case 'event': return COLORS.primary;
            default: return COLORS.textTertiary;
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Animated.View style={[styles.statusDot, {
                            transform: [{ scale: pulseAnim }],
                            backgroundColor: isSessionActive ? COLORS.success : COLORS.textMuted,
                        }]} />
                        <Text style={styles.title}>KERNEL MONITOR</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Status Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="pulse" size={12} color={COLORS.textTertiary} /> STATUS
                        </Text>
                        <View style={styles.metricsGrid}>
                            <MetricCard
                                icon="play"
                                label="Session"
                                value={isSessionActive ? 'ACTIVE' : 'IDLE'}
                                color={isSessionActive ? COLORS.success : COLORS.textTertiary}
                            />
                            <MetricCard
                                icon="layers"
                                label="Pattern"
                                value={selectedPatternId}
                            />
                            <MetricCard
                                icon="repeat"
                                label="Cycles"
                                value={currentFrame.cyclesCompleted}
                            />
                            <MetricCard
                                icon="heart"
                                label="HR"
                                value={currentFrame.heartRate ?? '--'}
                                color={currentFrame.heartRate ? COLORS.error : COLORS.textTertiary}
                            />
                        </View>
                    </View>

                    {/* Breath State Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="analytics" size={12} color={COLORS.textTertiary} /> BREATH STATE
                        </Text>
                        <View style={styles.stateCard}>
                            <ProgressBar
                                label="Phase Progress"
                                value={currentFrame.phaseProgress}
                                color={COLORS.primary}
                            />
                            <ProgressBar
                                label="Signal Quality"
                                value={currentFrame.signalQuality}
                                color={currentFrame.signalQuality > 0.7 ? COLORS.success : COLORS.warn}
                            />
                        </View>
                    </View>

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="cog" size={12} color={COLORS.textTertiary} /> SETTINGS
                        </Text>
                        <View style={styles.settingsGrid}>
                            <Text style={styles.settingItem}>
                                🔊 Sound: {settings.soundEnabled ? 'ON' : 'OFF'}
                            </Text>
                            <Text style={styles.settingItem}>
                                📳 Haptic: {settings.hapticEnabled ? 'ON' : 'OFF'}
                            </Text>
                            <Text style={styles.settingItem}>
                                🎤 Voice: {settings.voiceMode}
                            </Text>
                            <Text style={styles.settingItem}>
                                🌐 Lang: {settings.language.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {/* Event Log Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="terminal" size={12} color={COLORS.textTertiary} /> EVENT LOG
                        </Text>
                        <View style={styles.logContainer}>
                            {logs.length === 0 ? (
                                <Text style={styles.emptyLog}>No events yet</Text>
                            ) : (
                                logs.slice().reverse().map((log, i) => (
                                    <View key={i} style={styles.logEntry}>
                                        <Text style={styles.logTime}>
                                            {new Date(log.time).toISOString().split('T')[1].slice(0, 12)}
                                        </Text>
                                        <Text style={[styles.logType, { color: getLogColor(log.type) }]}>
                                            [{log.type.toUpperCase()}]
                                        </Text>
                                        <Text style={styles.logMessage} numberOfLines={1}>
                                            {log.message}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(11, 11, 12, 0.95)',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    title: {
        ...TYPOGRAPHY.mono,
        fontSize: 12,
        color: COLORS.success,
        letterSpacing: 2,
    },
    closeBtn: {
        padding: SPACING.sm,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textTertiary,
        letterSpacing: 2,
        marginBottom: SPACING.md,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    metricCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: RADII.md,
        padding: SPACING.md,
        gap: SPACING.xs,
    },
    metricLabel: {
        ...TYPOGRAPHY.mono,
        fontSize: 9,
        color: COLORS.textTertiary,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    stateCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: RADII.lg,
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    progressContainer: {
        gap: SPACING.xs,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    progressValue: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    settingsGrid: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: RADII.lg,
        padding: SPACING.md,
        gap: SPACING.xs,
    },
    settingItem: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    logContainer: {
        backgroundColor: '#000',
        borderRadius: RADII.lg,
        padding: SPACING.md,
        maxHeight: 200,
    },
    emptyLog: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
        color: COLORS.textMuted,
        textAlign: 'center',
        padding: SPACING.lg,
    },
    logEntry: {
        flexDirection: 'row',
        gap: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    logTime: {
        ...TYPOGRAPHY.mono,
        fontSize: 9,
        color: COLORS.textMuted,
        width: 70,
    },
    logType: {
        ...TYPOGRAPHY.mono,
        fontSize: 9,
        fontWeight: '700',
        width: 50,
    },
    logMessage: {
        ...TYPOGRAPHY.mono,
        fontSize: 9,
        color: COLORS.textSecondary,
        flex: 1,
    },
});

export default KernelMonitor;
