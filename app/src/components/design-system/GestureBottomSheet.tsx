/**
 * GestureBottomSheet Component
 * Swipeable bottom sheet with spring physics
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, TYPOGRAPHY, DURATIONS } from './tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

export interface GestureBottomSheetProps {
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    title?: string;
    maxHeight?: number;
}

export const GestureBottomSheet: React.FC<GestureBottomSheetProps> = ({
    open,
    onClose,
    children,
    title,
    maxHeight = SCREEN_HEIGHT * 0.75,
}) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const dragOffset = useRef(0);

    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                damping: DURATIONS.spring.damping,
                stiffness: DURATIONS.spring.stiffness,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: DURATIONS.normal,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, backdropOpacity]);

    const animateOut = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: DURATIONS.slow,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: DURATIONS.normal,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [translateY, backdropOpacity, onClose]);

    useEffect(() => {
        if (open) {
            animateIn();
        }
    }, [open, animateIn]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
            onPanResponderGrant: () => {
                dragOffset.current = 0;
            },
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy);
                    dragOffset.current = gesture.dy;
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > DISMISS_THRESHOLD || gesture.vy > 0.5) {
                    animateOut();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        damping: DURATIONS.spring.damping,
                        stiffness: DURATIONS.spring.stiffness,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (!open) return null;

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={animateOut}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.wrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Backdrop */}
                <Animated.View
                    style={[styles.backdrop, { opacity: backdropOpacity }]}
                >
                    <TouchableOpacity style={styles.backdropTouch} onPress={animateOut} />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    style={[
                        styles.sheet,
                        { maxHeight, transform: [{ translateY }] },
                    ]}
                >
                    {/* Drag Handle */}
                    <View {...panResponder.panHandlers} style={styles.handleArea}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={animateOut}>
                                <Ionicons name="close" size={16} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Content */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    backdropTouch: {
        flex: 1,
    },
    sheet: {
        backgroundColor: COLORS.elevated,
        borderTopLeftRadius: RADII.xl,
        borderTopRightRadius: RADII.xl,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    handleArea: {
        width: '100%',
        alignItems: 'center',
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    handle: {
        width: 48,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADII.full,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        ...TYPOGRAPHY.subheading,
        color: COLORS.text,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: RADII.full,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
});
