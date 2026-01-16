/**
 * LevelBadge - Display user's current level
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGamificationStore } from '../stores/gamificationStore';

interface LevelBadgeProps {
    size?: 'small' | 'medium' | 'large';
    showXp?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
    size = 'medium',
    showXp = true,
}) => {
    const { getCurrentLevel, getXpProgress, totalXp } = useGamificationStore();
    const level = getCurrentLevel();
    const xpProgress = getXpProgress();

    const sizes = {
        small: { badge: 32, text: 14, title: 10 },
        medium: { badge: 48, text: 20, title: 12 },
        large: { badge: 64, text: 28, title: 14 },
    };

    const s = sizes[size];

    return (
        <View style={styles.container}>
            <View style={[styles.badge, { width: s.badge, height: s.badge, borderRadius: s.badge / 2 }]}>
                <Text style={[styles.levelNumber, { fontSize: s.text }]}>{level.level}</Text>
            </View>
            <View style={styles.info}>
                <Text style={[styles.title, { fontSize: s.title }]}>{level.title}</Text>
                {showXp && (
                    <View style={styles.xpContainer}>
                        <View style={styles.xpBar}>
                            <View
                                style={[
                                    styles.xpFill,
                                    { width: `${Math.min(xpProgress.percentage, 100)}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.xpText}>
                            {Math.round(xpProgress.current)}/{xpProgress.needed === Infinity ? '∞' : xpProgress.needed} XP
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    levelNumber: {
        color: '#1A1A2E',
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontWeight: '600',
        marginBottom: 4,
    },
    xpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    xpBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#3A3A4E',
        borderRadius: 3,
        marginRight: 8,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        backgroundColor: '#4ECDC4',
        borderRadius: 3,
    },
    xpText: {
        color: '#888',
        fontSize: 10,
        minWidth: 60,
    },
});

export default React.memo(LevelBadge);
