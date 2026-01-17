/**
 * KineticSnackbar Component
 * Animated toast notification with auto-dismiss
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, TYPOGRAPHY, SHADOWS } from './tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SnackbarKind = 'success' | 'warn' | 'error' | 'info';

export interface KineticSnackbarProps {
    kind?: SnackbarKind;
    text: string;
    onClose: () => void;
    duration?: number;
}

const KIND_CONFIG: Record<SnackbarKind, { color: string; icon: string; bgColor: string }> = {
    success: {
        color: COLORS.success,
        icon: 'checkmark-circle',
        bgColor: COLORS.successFaded,
    },
    warn: {
        color: COLORS.warn,
        icon: 'warning',
        bgColor: COLORS.warnFaded,
    },
    error: {
        color: COLORS.error,
        icon: 'alert-circle',
        bgColor: COLORS.errorFaded,
    },
    info: {
        color: COLORS.primary,
        icon: 'information-circle',
        bgColor: COLORS.primaryFaded,
    },
};

export const KineticSnackbar: React.FC<KineticSnackbarProps> = ({
    kind = 'success',
    text,
    onClose,
    duration = 3500,
}) => {
    const translateY = React.useRef(new Animated.Value(100)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;
    const [closing, setClosing] = useState(false);

    const config = KIND_CONFIG[kind];

    useEffect(() => {
        // Enter animation
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20,
                stiffness: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-dismiss timer
        const dismissTimer = setTimeout(() => {
            setClosing(true);
        }, duration);

        return () => clearTimeout(dismissTimer);
    }, [translateY, opacity, duration]);

    useEffect(() => {
        if (closing) {
            // Exit animation
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 100,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => onClose());
        }
    }, [closing, translateY, opacity, onClose]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    borderColor: config.color + '50',
                },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon as any} size={18} color={config.color} />
            </View>
            <Text style={styles.text} numberOfLines={2}>{text}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 32,
        left: 20,
        right: 20,
        maxWidth: SCREEN_WIDTH - 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.elevated,
        borderRadius: RADII.lg,
        borderWidth: 1,
        ...SHADOWS.card,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: RADII.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        flex: 1,
    },
});
