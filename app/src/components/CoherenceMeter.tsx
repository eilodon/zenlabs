/**
 * CoherenceMeter - Visual HRV coherence display
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { type CoherenceState } from '../vitals/hrvCoherence';
import { type PhilosophicalState } from '../vitals/philosophicalState';

interface CoherenceMeterProps {
    coherence: CoherenceState;
    philosophicalState: PhilosophicalState;
    showDetails?: boolean;
}

export const CoherenceMeter: React.FC<CoherenceMeterProps> = ({
    coherence,
    philosophicalState,
    showDetails = false,
}) => {
    const fillAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fillAnim, {
            toValue: coherence.score / 100,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        // Pulse glow when high coherence
        if (coherence.level === 'high') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [coherence, fillAnim, glowAnim]);

    const fillWidth = fillAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const getTrendIcon = (): string => {
        switch (coherence.trend) {
            case 'improving': return '↑';
            case 'declining': return '↓';
            default: return '→';
        }
    };

    return (
        <View style={styles.container}>
            {/* Philosophical state label */}
            <View style={styles.stateRow}>
                <Animated.View
                    style={[
                        styles.stateIndicator,
                        {
                            backgroundColor: philosophicalState.color,
                            opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.6, 1],
                            }),
                        },
                    ]}
                />
                <View>
                    <Text style={[styles.stateName, { color: philosophicalState.color }]}>
                        {philosophicalState.vietnamese}
                    </Text>
                    <Text style={styles.stateEnglish}>{philosophicalState.english}</Text>
                </View>
            </View>

            {/* Coherence bar */}
            <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            {
                                width: fillWidth,
                                backgroundColor: coherence.color,
                            },
                        ]}
                    />
                </View>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>{Math.round(coherence.score)}%</Text>
                    <Text style={[styles.trendText, { color: coherence.color }]}>
                        {getTrendIcon()}
                    </Text>
                </View>
            </View>

            {/* Details */}
            {showDetails && (
                <Text style={styles.description}>{philosophicalState.description}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
    },
    stateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stateIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    stateName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    stateEnglish: {
        fontSize: 12,
        color: '#888',
    },
    barContainer: {
        marginTop: 8,
    },
    barBackground: {
        height: 8,
        backgroundColor: '#3A3A4E',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    scoreText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    trendText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
    },
});

export default React.memo(CoherenceMeter);
