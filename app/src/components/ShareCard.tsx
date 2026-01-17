/**
 * ShareCard - Generate shareable session summary card
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { logger } from '../utils/logger';

interface ShareCardProps {
    sessionData: {
        duration: string;
        cycles: number;
        pattern: string;
        avgHeartRate: number | null;
        coherenceScore: number;
        streakDays: number;
        date: Date;
    };
    onClose?: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ sessionData, onClose }) => {
    const cardRef = useRef<View>(null);

    const handleShare = async () => {
        const message = generateShareText(sessionData);

        try {
            await Share.share({
                message,
                title: 'My ZenOne Session',
            });
        } catch (error) {
            logger.error('Share failed:', error);
        }
    };

    const generateShareText = (data: typeof sessionData): string => {
        const lines = [
            '🧘 ZenOne Session Complete!',
            '',
            `⏱️ Duration: ${data.duration}`,
            `🔄 Cycles: ${data.cycles}`,
            `🌬️ Pattern: ${data.pattern}`,
        ];

        if (data.avgHeartRate) {
            lines.push(`❤️ Avg HR: ${data.avgHeartRate} BPM`);
        }

        if (data.coherenceScore > 0) {
            lines.push(`✨ Coherence: ${Math.round(data.coherenceScore)}%`);
        }

        if (data.streakDays > 0) {
            lines.push(`🔥 ${data.streakDays} day streak!`);
        }

        lines.push('', '#ZenOne #Breathwork #Mindfulness');

        return lines.join('\n');
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            {/* Card Preview */}
            <View ref={cardRef} style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🧘 ZenOne</Text>
                    <Text style={styles.date}>{formatDate(sessionData.date)}</Text>
                </View>

                {/* Stats grid */}
                <View style={styles.statsGrid}>
                    <StatBox label="Duration" value={sessionData.duration} icon="⏱️" />
                    <StatBox label="Cycles" value={sessionData.cycles.toString()} icon="🔄" />
                    <StatBox label="Pattern" value={sessionData.pattern} icon="🌬️" />
                    {sessionData.avgHeartRate && (
                        <StatBox
                            label="Avg HR"
                            value={`${sessionData.avgHeartRate}`}
                            unit="BPM"
                            icon="❤️"
                        />
                    )}
                </View>

                {/* Coherence bar */}
                {sessionData.coherenceScore > 0 && (
                    <View style={styles.coherenceSection}>
                        <Text style={styles.coherenceLabel}>Coherence Score</Text>
                        <View style={styles.coherenceBar}>
                            <View
                                style={[
                                    styles.coherenceFill,
                                    { width: `${sessionData.coherenceScore}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.coherenceValue}>
                            {Math.round(sessionData.coherenceScore)}%
                        </Text>
                    </View>
                )}

                {/* Streak */}
                {sessionData.streakDays > 0 && (
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>
                            🔥 {sessionData.streakDays} Day Streak
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {onClose && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const StatBox: React.FC<{
    label: string;
    value: string;
    unit?: string;
    icon: string;
}> = ({ label, value, unit, icon }) => (
    <View style={styles.statBox}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>
            {value}
            {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#4ECDC440',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    date: {
        fontSize: 14,
        color: '#888',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        width: '47%',
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#888',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    coherenceSection: {
        marginBottom: 16,
    },
    coherenceLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    coherenceBar: {
        height: 8,
        backgroundColor: '#3A3A4E',
        borderRadius: 4,
        overflow: 'hidden',
    },
    coherenceFill: {
        height: '100%',
        backgroundColor: '#4ECDC4',
        borderRadius: 4,
    },
    coherenceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4ECDC4',
        marginTop: 4,
        textAlign: 'right',
    },
    streakBadge: {
        backgroundColor: '#FFD93D20',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'center',
    },
    streakText: {
        color: '#FFD93D',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    closeButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4ECDC4',
    },
    shareButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        backgroundColor: '#4ECDC4',
    },
    shareText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
    },
});

export default React.memo(ShareCard);
