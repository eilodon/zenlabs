/**
 * VitalsDisplay Component (Enhanced with HRV)
 * Shows heart rate, HRV, signal quality, and cycles
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
    hrv,
}) => {
    const getQualityLabel = (q: number) => {
        if (q > 0.8) return { label: 'Excellent', color: '#4ECDC4' };
        if (q > 0.5) return { label: 'Good', color: '#45B7D1' };
        if (q > 0.2) return { label: 'Fair', color: '#FFA500' };
        return { label: 'Searching...', color: '#888' };
    };

    const getHrvStatus = (rmssd: number) => {
        if (rmssd > 50) return { label: 'Relaxed', color: '#4ECDC4' };
        if (rmssd > 30) return { label: 'Normal', color: '#45B7D1' };
        return { label: 'Stressed', color: '#FF6B6B' };
    };

    const quality = getQualityLabel(signalQuality);
    const hrvStatus = hrv ? getHrvStatus(hrv.rmssd) : null;

    return (
        <View style={styles.container}>
            {/* Heart Rate */}
            <View style={styles.card}>
                <Text style={styles.icon}>❤️</Text>
                <Text style={styles.value}>
                    {heartRate ? Math.round(heartRate) : '--'}
                </Text>
                <Text style={styles.unit}>BPM</Text>
            </View>

            {/* HRV (if available) */}
            {hrv ? (
                <View style={styles.card}>
                    <Text style={styles.icon}>🧠</Text>
                    <Text style={[styles.value, { color: hrvStatus?.color, fontSize: 18 }]}>
                        {Math.round(hrv.rmssd)}ms
                    </Text>
                    <Text style={styles.unit}>HRV</Text>
                </View>
            ) : (
                /* Cycles */
                <View style={styles.card}>
                    <Text style={styles.icon}>🔄</Text>
                    <Text style={styles.value}>{cyclesCompleted}</Text>
                    <Text style={styles.unit}>Cycles</Text>
                </View>
            )}

            {/* Signal Quality */}
            <View style={styles.card}>
                <Text style={styles.icon}>📶</Text>
                <Text style={[styles.value, { color: quality.color, fontSize: 14 }]}>
                    {quality.label}
                </Text>
                <Text style={styles.unit}>Signal</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    card: {
        alignItems: 'center',
        backgroundColor: '#2A2A3E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 90,
    },
    icon: {
        fontSize: 20,
        marginBottom: 4,
    },
    value: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    unit: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
});

export default React.memo(VitalsDisplay);
