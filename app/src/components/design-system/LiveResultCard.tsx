/**
 * LiveResultCard Component
 * AI streaming result card with typewriter effect
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, TYPOGRAPHY, SHADOWS } from './tokens';
import { SecurityCue, SecurityMode } from './SecurityCue';

export interface LiveResultCardProps {
    title: string;
    content?: string;
    generating?: boolean;
    onDismiss?: () => void;
    mode?: SecurityMode;
    onThumbsUp?: () => void;
    onThumbsDown?: () => void;
    onCopy?: () => void;
}

export const LiveResultCard: React.FC<LiveResultCardProps> = ({
    title,
    content,
    generating = false,
    onDismiss,
    mode = 'cloud',
    onThumbsUp,
    onThumbsDown,
    onCopy,
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const pulseAnim = React.useRef(new Animated.Value(0.3)).current;
    const pulseLoopRef = React.useRef<Animated.CompositeAnimation | null>(null);

    // Typewriter effect
    useEffect(() => {
        if (!content || generating) {
            setDisplayedText('');
            setIsTyping(false);
            return;
        }

        setIsTyping(true);
        let i = 0;
        setDisplayedText('');

        const interval = setInterval(() => {
            if (i < content.length) {
                setDisplayedText(prev => prev + content[i]);
                i++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 15);

        return () => clearInterval(interval);
    }, [content, generating]);

    // Pulse animation for generating state
    useEffect(() => {
        pulseLoopRef.current?.stop();
        pulseLoopRef.current = null;

        if (generating) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
                ])
            );
            pulseLoopRef.current = loop;
            loop.start();
        } else {
            pulseAnim.setValue(0.3);
        }
        return () => {
            pulseLoopRef.current?.stop();
            pulseLoopRef.current = null;
        };
    }, [generating, pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SecurityCue mode={mode} />
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
                        <Ionicons name="close" size={14} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Title with status dot */}
            <View style={styles.titleRow}>
                <Animated.View
                    style={[
                        styles.statusDot,
                        {
                            backgroundColor: generating ? COLORS.primary : COLORS.textMuted,
                            opacity: generating ? pulseAnim : 1,
                        },
                    ]}
                />
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {generating ? (
                    <View style={styles.skeleton}>
                        <View style={[styles.skeletonLine, { width: '75%' }]} />
                        <View style={[styles.skeletonLine, { width: '50%' }]} />
                    </View>
                ) : (
                    <Text style={styles.text}>
                        {displayedText}
                        {isTyping && <Text style={styles.cursor}>|</Text>}
                    </Text>
                )}
            </View>

            {/* Actions */}
            {!generating && content && (
                <View style={styles.actions}>
                    {onCopy && (
                        <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
                            <Ionicons name="copy-outline" size={12} color={COLORS.textTertiary} />
                            <Text style={styles.actionText}>Copy</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.feedback}>
                        {onThumbsUp && (
                            <TouchableOpacity style={styles.thumbBtn} onPress={onThumbsUp}>
                                <Ionicons name="thumbs-up-outline" size={12} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                        {onThumbsDown && (
                            <TouchableOpacity style={styles.thumbBtn} onPress={onThumbsDown}>
                                <Ionicons name="thumbs-down-outline" size={12} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.elevated,
        borderRadius: RADII.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...SHADOWS.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    dismissBtn: {
        padding: SPACING.xs,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    title: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        minHeight: 60,
    },
    skeleton: {
        gap: SPACING.sm,
    },
    skeletonLine: {
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADII.sm,
    },
    text: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        lineHeight: 22,
    },
    cursor: {
        color: COLORS.primary,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADII.md,
    },
    actionText: {
        ...TYPOGRAPHY.mono,
        color: COLORS.textTertiary,
    },
    feedback: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    thumbBtn: {
        padding: SPACING.sm,
        borderRadius: RADII.md,
    },
});
