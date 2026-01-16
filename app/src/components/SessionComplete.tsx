/**
 * SessionComplete - Celebration screen after session ends
 * 
 * Features:
 * - Confetti animation
 * - Stats summary
 * - Achievement reveal
 * - Share card
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionStats {
    durationSec: number;
    cycles: number;
    avgHeartRate: number | null;
    hrvChange: number | null; // percentage change
    streakDays: number;
    newBadge?: { id: string; name: string; emoji: string };
}

interface SessionCompleteProps {
    stats: SessionStats;
    onContinue: () => void;
    onShare?: () => void;
}

// Confetti particle
interface Confetti {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
    size: number;
}

const CONFETTI_COLORS = ['#4ECDC4', '#FFD93D', '#FF6B6B', '#C9B1FF', '#6BCB77', '#FF9F45'];
const CONFETTI_COUNT = 50;

export const SessionComplete: React.FC<SessionCompleteProps> = ({
    stats,
    onContinue,
    onShare,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const badgeScale = useRef(new Animated.Value(0)).current;
    const [showConfetti, setShowConfetti] = useState(true);

    // Generate confetti particles
    const confetti: Confetti[] = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 1000,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
    }));

    // Entry animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        // Badge animation with delay
        if (stats.newBadge) {
            Animated.sequence([
                Animated.delay(800),
                Animated.spring(badgeScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        // Hide confetti after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, [fadeAnim, slideAnim, badgeScale, stats.newBadge]);

    const formatDuration = (sec: number): string => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            {/* Confetti */}
            {showConfetti && (
                <View style={styles.confettiContainer}>
                    {confetti.map((c) => (
                        <ConfettiParticle key={c.id} particle={c} />
                    ))}
                </View>
            )}

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Header */}
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.title}>Well Done!</Text>
                <Text style={styles.subtitle}>Session Complete</Text>

                {/* Stats card */}
                <View style={styles.statsCard}>
                    <StatRow label="Duration" value={formatDuration(stats.durationSec)} />
                    <StatRow label="Cycles" value={stats.cycles.toString()} />
                    {stats.avgHeartRate && (
                        <StatRow
                            label="Avg HR"
                            value={`${Math.round(stats.avgHeartRate)} BPM`}
                            trend={stats.avgHeartRate < 70 ? 'good' : undefined}
                        />
                    )}
                    {stats.hrvChange !== null && (
                        <StatRow
                            label="HRV"
                            value={`${stats.hrvChange > 0 ? '+' : ''}${stats.hrvChange}%`}
                            trend={stats.hrvChange > 0 ? 'good' : 'neutral'}
                        />
                    )}
                    {stats.streakDays > 0 && (
                        <StatRow
                            label="Streak"
                            value={`🔥 ${stats.streakDays} days`}
                            highlight
                        />
                    )}
                </View>

                {/* New badge */}
                {stats.newBadge && (
                    <Animated.View
                        style={[
                            styles.badgeContainer,
                            { transform: [{ scale: badgeScale }] },
                        ]}
                    >
                        <Text style={styles.badgeLabel}>NEW ACHIEVEMENT!</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeEmoji}>{stats.newBadge.emoji}</Text>
                            <Text style={styles.badgeName}>{stats.newBadge.name}</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    {onShare && (
                        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                            <Text style={styles.shareText}>Share</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

// Stat row component
interface StatRowProps {
    label: string;
    value: string;
    trend?: 'good' | 'neutral' | 'bad';
    highlight?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, trend, highlight }) => (
    <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text
            style={[
                styles.statValue,
                trend === 'good' && styles.statGood,
                highlight && styles.statHighlight,
            ]}
        >
            {value}
        </Text>
    </View>
);

// Confetti particle animation
const ConfettiParticle: React.FC<{ particle: Confetti }> = ({ particle }) => {
    const translateY = useRef(new Animated.Value(-50)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT + 50,
                duration: 3000 + Math.random() * 2000,
                delay: particle.delay,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(rotate, {
                toValue: 1,
                duration: 3000,
                delay: particle.delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 3000,
                delay: particle.delay + 1500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, rotate, opacity, particle.delay]);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${particle.rotation + 720}deg`],
    });

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    left: particle.x,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    opacity,
                    transform: [{ translateY }, { rotate: spin }],
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    confetti: {
        position: 'absolute',
        top: -20,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
    },
    statsCard: {
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A4E',
    },
    statLabel: {
        fontSize: 16,
        color: '#888',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    statGood: {
        color: '#4ECDC4',
    },
    statHighlight: {
        color: '#FFD93D',
    },
    badgeContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    badgeLabel: {
        fontSize: 12,
        color: '#4ECDC4',
        letterSpacing: 2,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#3A3A4E',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    badgeEmoji: {
        fontSize: 40,
        marginBottom: 8,
    },
    badgeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    shareButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    shareText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4ECDC4',
    },
    continueButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        backgroundColor: '#4ECDC4',
    },
    continueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
    },
});

export default React.memo(SessionComplete);
