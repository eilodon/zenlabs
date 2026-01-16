/**
 * Leaderboard - Friend rankings (opt-in)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch } from 'react-native';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatar?: string;
    weeklyMinutes: number;
    streakDays: number;
    level: number;
    isCurrentUser: boolean;
}

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId: string;
    onOptInChange?: (optedIn: boolean) => void;
    isOptedIn?: boolean;
}

// Mock data for demo
const MOCK_ENTRIES: LeaderboardEntry[] = [
    { rank: 1, userId: '1', displayName: 'Sarah M.', weeklyMinutes: 245, streakDays: 42, level: 15, isCurrentUser: false },
    { rank: 2, userId: '2', displayName: 'Mike T.', weeklyMinutes: 198, streakDays: 28, level: 12, isCurrentUser: false },
    { rank: 3, userId: '3', displayName: 'Emma K.', weeklyMinutes: 156, streakDays: 21, level: 10, isCurrentUser: false },
    { rank: 4, userId: 'current', displayName: 'You', weeklyMinutes: 120, streakDays: 7, level: 5, isCurrentUser: true },
    { rank: 5, userId: '4', displayName: 'Alex J.', weeklyMinutes: 89, streakDays: 14, level: 8, isCurrentUser: false },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
    entries = MOCK_ENTRIES,
    currentUserId,
    onOptInChange,
    isOptedIn = false,
}) => {
    const [filter, setFilter] = useState<'weekly' | 'streak'>('weekly');

    const sortedEntries = [...entries].sort((a, b) => {
        if (filter === 'weekly') {
            return b.weeklyMinutes - a.weeklyMinutes;
        }
        return b.streakDays - a.streakDays;
    }).map((e, i) => ({ ...e, rank: i + 1 }));

    const renderEntry = ({ item }: { item: LeaderboardEntry }) => (
        <View style={[styles.entryRow, item.isCurrentUser && styles.currentUserRow]}>
            <View style={styles.rankColumn}>
                <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>
                    {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
                </Text>
            </View>
            <View style={styles.userColumn}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.displayName.charAt(0)}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.userName, item.isCurrentUser && styles.currentUserName]}>
                        {item.displayName}
                    </Text>
                    <Text style={styles.userLevel}>Level {item.level}</Text>
                </View>
            </View>
            <View style={styles.statColumn}>
                <Text style={styles.statValue}>
                    {filter === 'weekly' ? `${item.weeklyMinutes}` : `${item.streakDays}`}
                </Text>
                <Text style={styles.statLabel}>
                    {filter === 'weekly' ? 'min' : 'days'}
                </Text>
            </View>
        </View>
    );

    if (!isOptedIn) {
        return (
            <View style={styles.optInContainer}>
                <Text style={styles.optInEmoji}>👥</Text>
                <Text style={styles.optInTitle}>Join the Community</Text>
                <Text style={styles.optInDesc}>
                    See how you stack up against friends. Your data stays private—only your stats are shared.
                </Text>
                <TouchableOpacity
                    style={styles.optInButton}
                    onPress={() => onOptInChange?.(true)}
                >
                    <Text style={styles.optInButtonText}>Join Leaderboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Leaderboard</Text>
                <View style={styles.optOutRow}>
                    <Text style={styles.optOutLabel}>Visible</Text>
                    <Switch
                        value={isOptedIn}
                        onValueChange={onOptInChange}
                        trackColor={{ false: '#3A3A4E', true: '#4ECDC480' }}
                        thumbColor={isOptedIn ? '#4ECDC4' : '#888'}
                    />
                </View>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'weekly' && styles.filterActive]}
                    onPress={() => setFilter('weekly')}
                >
                    <Text style={[styles.filterText, filter === 'weekly' && styles.filterTextActive]}>
                        Weekly Minutes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'streak' && styles.filterActive]}
                    onPress={() => setFilter('streak')}
                >
                    <Text style={[styles.filterText, filter === 'streak' && styles.filterTextActive]}>
                        Streak
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Entries */}
            <FlatList
                data={sortedEntries}
                renderItem={renderEntry}
                keyExtractor={(item) => item.userId}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    optOutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    optOutLabel: {
        color: '#888',
        fontSize: 12,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#2A2A3E',
        borderRadius: 8,
        alignItems: 'center',
    },
    filterActive: {
        backgroundColor: '#4ECDC420',
        borderWidth: 1,
        borderColor: '#4ECDC4',
    },
    filterText: {
        color: '#888',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#4ECDC4',
    },
    entryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
    },
    currentUserRow: {
        backgroundColor: '#4ECDC420',
        borderWidth: 1,
        borderColor: '#4ECDC4',
    },
    rankColumn: {
        width: 40,
    },
    rank: {
        fontSize: 16,
        color: '#888',
        fontWeight: '600',
    },
    topRank: {
        fontSize: 20,
    },
    userColumn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#1A1A2E',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    currentUserName: {
        color: '#4ECDC4',
    },
    userLevel: {
        color: '#888',
        fontSize: 12,
    },
    statColumn: {
        alignItems: 'flex-end',
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#888',
        fontSize: 11,
    },
    // Opt-in screen
    optInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    optInEmoji: {
        fontSize: 64,
        marginBottom: 24,
    },
    optInTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    optInDesc: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    optInButton: {
        backgroundColor: '#4ECDC4',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
    },
    optInButtonText: {
        color: '#1A1A2E',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default React.memo(Leaderboard);
