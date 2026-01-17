/**
 * Achievements Screen - Display user achievements and progress
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAchievementStore, type Achievement } from '../stores/achievementStore';

// =============================================================================
// COMPONENTS
// =============================================================================

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const isUnlocked = achievement.unlockedAt !== null;

    return (
        <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
            <View style={[styles.emojiContainer, !isUnlocked && styles.emojiLocked]}>
                <Text style={styles.emoji}>{achievement.emoji}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, !isUnlocked && styles.textLocked]}>
                    {achievement.name}
                </Text>
                <Text style={[styles.cardDescription, !isUnlocked && styles.textLocked]}>
                    {achievement.description}
                </Text>
                {isUnlocked && achievement.unlockedAt && (
                    <Text style={styles.unlockedDate}>
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                )}
            </View>
            {isUnlocked && <Text style={styles.checkmark}>✓</Text>}
        </View>
    );
};

const CategorySection: React.FC<{ title: string; achievements: Achievement[] }> = ({
    title,
    achievements
}) => {
    const unlocked = achievements.filter(a => a.unlockedAt !== null).length;

    return (
        <View>
            <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{title}</Text>
                <Text style={styles.categoryProgress}>
                    {unlocked}/{achievements.length}
                </Text>
            </View>
            {achievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </View>
    );
};

// =============================================================================
// SCREEN
// =============================================================================

export const AchievementsScreen: React.FC = () => {
    const achievements = useAchievementStore(state => state.achievements);
    const getUnlockedCount = useAchievementStore(state => state.getUnlockedCount);

    const totalUnlocked = getUnlockedCount();
    const totalAchievements = achievements.length;

    const categories = [
        { key: 'beginner', title: '🌱 Getting Started' },
        { key: 'consistency', title: '🔥 Consistency' },
        { key: 'mastery', title: '👑 Mastery' },
        { key: 'explorer', title: '🗺️ Explorer' },
        { key: 'time', title: '⏰ Time-based' },
    ] as const;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Achievements</Text>
                <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>
                        {totalUnlocked}/{totalAchievements}
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(totalUnlocked / totalAchievements) * 100}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressLabel}>
                    {Math.round((totalUnlocked / totalAchievements) * 100)}% Complete
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {categories.map(({ key, title }) => (
                    <CategorySection
                        key={key}
                        title={title}
                        achievements={achievements.filter(a => a.category === key)}
                    />
                ))}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3E',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    progressBadge: {
        backgroundColor: '#4ECDC433',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    progressText: {
        color: '#4ECDC4',
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2A2A3E',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4ECDC4',
        borderRadius: 4,
    },
    progressLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 12,
    },
    categoryTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    categoryProgress: {
        color: '#888',
        fontSize: 14,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    cardLocked: {
        opacity: 0.5,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3A3A4E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emojiLocked: {
        backgroundColor: '#252535',
    },
    emoji: {
        fontSize: 24,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cardDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    textLocked: {
        color: '#666',
    },
    unlockedDate: {
        color: '#4ECDC4',
        fontSize: 11,
        marginTop: 4,
    },
    checkmark: {
        color: '#4ECDC4',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AchievementsScreen;
