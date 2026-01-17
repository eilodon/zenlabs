/**
 * VitalsDisplay V2 - Compact inline stats
 * Shows heart rate, cycles, and signal in a single row
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VitalsDisplayProps {
    heartRate: number | null;
    signalQuality: number;
    cyclesCompleted: number;
    hrv?: {
        rmssd: number;
        sdnn: number;
    } | null;
}

export const VitalsDisplay: React.FC<VitalsDisplayProps> = ({
    heartRate,
    signalQuality,
    cyclesCompleted,
}) => {
    const getQualityLabel = (q: number) => {
        if (q > 0.8) return { label: 'Excellent', color: '#4ECDC4' };
        if (q > 0.5) return { label: 'Good', color: '#45B7D1' };
        if (q > 0.2) return { label: 'Fair', color: '#F59E0B' };
        return { label: 'Searching...', color: '#666' };
    };

    const quality = getQualityLabel(signalQuality);

    return (
        <View style={styles.container}>
            {/* Heart Rate */}
            <View style={styles.item}>
                <Text style={styles.icon}>❤️</Text>
                <Text style={styles.value}>
                    {heartRate ? Math.round(heartRate) : '--'}
                </Text>
                <Text style={styles.unit}>BPM</Text>
            </View>

            <View style={styles.divider} />

            {/* Cycles */}
            <View style={styles.item}>
                <Text style={styles.icon}>🔄</Text>
                <Text style={styles.value}>{cyclesCompleted}</Text>
                <Text style={styles.unit}>cycles</Text>
            </View>

            <View style={styles.divider} />

            {/* Signal */}
            <View style={styles.item}>
                <Text style={styles.icon}>📶</Text>
                <Text style={[styles.value, { color: quality.color }]}>
                    {quality.label}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: 20,
        borderRadius: 14,
        marginBottom: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    icon: {
        fontSize: 13,
        marginRight: 5,
    },
    value: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    unit: {
        color: '#777',
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
});

export default React.memo(VitalsDisplay);
