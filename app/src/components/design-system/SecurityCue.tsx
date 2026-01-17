/**
 * SecurityCue Component
 * Privacy indicator showing where data is processed
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, TYPOGRAPHY } from './tokens';

export type SecurityMode = 'on-device' | 'hybrid' | 'cloud';

export interface SecurityCueProps {
    mode: SecurityMode;
}

const MODE_CONFIG: Record<SecurityMode, { color: string; label: string }> = {
    'on-device': { color: COLORS.success, label: 'On-device' },
    'hybrid': { color: COLORS.primary, label: 'Hybrid' },
    'cloud': { color: '#64748B', label: 'Cloud' },
};

export const SecurityCue: React.FC<SecurityCueProps> = ({ mode }) => {
    const config = MODE_CONFIG[mode];

    return (
        <View style={[styles.container, { borderColor: config.color }]}>
            <View style={[styles.dot, { backgroundColor: config.color }]} />
            <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
            <Ionicons name="lock-closed" size={10} color={config.color} style={styles.icon} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADII.full,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        ...TYPOGRAPHY.mono,
        fontSize: 10,
    },
    icon: {
        opacity: 0.7,
    },
});
