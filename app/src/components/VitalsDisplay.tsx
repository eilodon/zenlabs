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
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    icon: {
        fontSize: 14,
        marginRight: 6,
    },
    value: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    unit: {
        color: '#666',
        fontSize: 12,
        marginLeft: 4,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default React.memo(VitalsDisplay);
