/**
 * HintChip Component
 * Pill-shaped hint buttons for pattern tips
 * Adapted from Pandora UI design system
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { haptics } from '../../utils/haptics';

type ChipState = 'default' | 'armed' | 'active';

interface HintChipProps {
    label: string;
    icon?: string;
    state?: ChipState;
    onPress?: () => void;
    disabled?: boolean;
}

const STATE_STYLES: Record<ChipState, {
    bg: string;
    text: string;
    border: string;
}> = {
    default: {
        bg: 'rgba(255, 255, 255, 0.08)',
        text: '#EDEDED',
        border: 'rgba(255, 255, 255, 0.12)',
    },
    armed: {
        bg: 'rgba(255, 255, 255, 0.04)',
        text: 'rgba(237, 237, 237, 0.7)',
        border: 'rgba(255, 255, 255, 0.08)',
    },
    active: {
        bg: '#3B82F6',
        text: '#FFFFFF',
        border: '#3B82F6',
    },
};

export const HintChip: React.FC<HintChipProps> = ({
    label,
    icon = '💡',
    state = 'default',
    onPress,
    disabled = false,
}) => {
    const stateStyle = STATE_STYLES[state];

    const handlePress = () => {
        if (disabled) return;
        haptics.selection();
        onPress?.();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    backgroundColor: stateStyle.bg,
                    borderColor: stateStyle.border,
                    opacity: disabled ? 0.3 : 1,
                },
            ]}
        >
            {icon && (
                <Text style={styles.icon}>{icon}</Text>
            )}
            <Text style={[styles.label, { color: stateStyle.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 44,
    },
    icon: {
        fontSize: 14,
        marginRight: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
    },
});

export default HintChip;
