/**
 * DailyQuestCard - Display daily quests with progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGamificationStore, type DailyQuest } from '../stores/gamificationStore';

interface DailyQuestCardProps {
    compact?: boolean;
}

export const DailyQuestCard: React.FC<DailyQuestCardProps> = ({ compact = false }) => {
    const { getAvailableQuests } = useGamificationStore();
    const quests = getAvailableQuests();

    const completedCount = quests.filter((q) => q.completed).length;

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={styles.compactTitle}>Daily Quests</Text>
                <View style={styles.compactProgress}>
                    <Text style={styles.compactText}>
                        {completedCount}/{quests.length}
                    </Text>
                    <View style={styles.dots}>
                        {quests.map((q, i) => (
                            <View
                                key={i}
                                style={[styles.dot, q.completed && styles.dotComplete]}
                            />
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Daily Quests</Text>
                <Text style={styles.progress}>
                    {completedCount}/{quests.length} Complete
                </Text>
            </View>
            {quests.map((quest) => (
                <QuestRow key={quest.id} quest={quest} />
            ))}
        </View>
    );
};

const QuestRow: React.FC<{ quest: DailyQuest }> = ({ quest }) => {
    const getProgressText = (): string => {
        const req = quest.requirement;
        switch (req.type) {
            case 'sessions':
                return `${quest.progress}/${req.count} sessions`;
            case 'minutes':
                return `${quest.progress}/${req.count} min`;
            case 'cycles':
                return `${quest.progress}/${req.count} cycles`;
            default:
                return quest.completed ? 'Done!' : 'Not yet';
        }
    };

    const getMaxProgress = (): number => {
        const req = quest.requirement;
        switch (req.type) {
            case 'sessions':
            case 'minutes':
            case 'cycles':
                return req.count;
            default:
                return 1;
        }
    };

    const progressPercent = (quest.progress / getMaxProgress()) * 100;

    return (
        <View style={[styles.questRow, quest.completed && styles.questComplete]}>
            <Text style={styles.questEmoji}>{quest.emoji}</Text>
            <View style={styles.questContent}>
                <Text style={[styles.questTitle, quest.completed && styles.questTitleComplete]}>
                    {quest.title}
                </Text>
                <Text style={styles.questDesc}>{quest.description}</Text>
                {!quest.completed && (
                    <View style={styles.questProgress}>
                        <View style={styles.questProgressBar}>
                            <View
                                style={[styles.questProgressFill, { width: `${progressPercent}%` }]}
                            />
                        </View>
                        <Text style={styles.questProgressText}>{getProgressText()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.questReward}>
                <Text style={styles.questXp}>+{quest.xpReward}</Text>
                <Text style={styles.questXpLabel}>XP</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    progress: {
        color: '#4ECDC4',
        fontSize: 14,
    },
    questRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#3A3A4E',
    },
    questComplete: {
        opacity: 0.6,
    },
    questEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    questContent: {
        flex: 1,
    },
    questTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    questTitleComplete: {
        textDecorationLine: 'line-through',
    },
    questDesc: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    questProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    questProgressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#3A3A4E',
        borderRadius: 2,
        marginRight: 8,
        overflow: 'hidden',
    },
    questProgressFill: {
        height: '100%',
        backgroundColor: '#4ECDC4',
    },
    questProgressText: {
        color: '#888',
        fontSize: 11,
        minWidth: 60,
    },
    questReward: {
        alignItems: 'center',
        marginLeft: 12,
    },
    questXp: {
        color: '#FFD93D',
        fontSize: 16,
        fontWeight: 'bold',
    },
    questXpLabel: {
        color: '#888',
        fontSize: 10,
    },
    // Compact styles
    compactContainer: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compactTitle: {
        color: '#888',
        fontSize: 14,
    },
    compactProgress: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    dots: {
        flexDirection: 'row',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3A3A4E',
    },
    dotComplete: {
        backgroundColor: '#4ECDC4',
    },
});

export default React.memo(DailyQuestCard);
