/**
 * History Screen - Session history, streaks, and insights
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore, type SessionRecord } from '../stores/sessionStore';

// =============================================================================
// COMPONENTS
// =============================================================================

const StreakCard: React.FC<{ current: number; longest: number; weeklyProgress: number; weeklyGoal: number }> = ({
    current,
    longest,
    weeklyProgress,
    weeklyGoal,
}) => (
    <View style={styles.streakCard}>
        <View style={styles.streakRow}>
            <View style={styles.streakItem}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakNumber}>{current}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
                <Text style={styles.streakEmoji}>🏆</Text>
                <Text style={styles.streakNumber}>{longest}</Text>
                <Text style={styles.streakLabel}>Best Streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
                <Text style={styles.streakEmoji}>📅</Text>
                <Text style={styles.streakNumber}>{weeklyProgress}/{weeklyGoal}</Text>
                <Text style={styles.streakLabel}>This Week</Text>
            </View>
        </View>
    </View>
);

const InsightsCard: React.FC = () => {
    const getInsights = useSessionStore(state => state.getInsights);
    const insights = getInsights();

    return (
        <View style={styles.insightsCard}>
            <Text style={styles.cardTitle}>📊 Insights</Text>
            <View style={styles.insightsGrid}>
                <View style={styles.insightItem}>
                    <Text style={styles.insightValue}>{insights.totalSessions}</Text>
                    <Text style={styles.insightLabel}>Sessions</Text>
                </View>
                <View style={styles.insightItem}>
                    <Text style={styles.insightValue}>{insights.totalMinutes}</Text>
                    <Text style={styles.insightLabel}>Minutes</Text>
                </View>
                <View style={styles.insightItem}>
                    <Text style={styles.insightValue}>
                        {insights.avgHeartRate ? `${insights.avgHeartRate}` : '--'}
                    </Text>
                    <Text style={styles.insightLabel}>Avg HR</Text>
                </View>
                <View style={styles.insightItem}>
                    <Text style={styles.insightValue}>{insights.avgCyclesPerSession.toFixed(1)}</Text>
                    <Text style={styles.insightLabel}>Avg Cycles</Text>
                </View>
            </View>
            {insights.favoritePattern && (
                <Text style={styles.favoritePattern}>
                    ⭐ Favorite: {insights.favoritePattern}
                </Text>
            )}
        </View>
    );
};

const SessionItem: React.FC<{ session: SessionRecord }> = ({ session }) => {
    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const durationMin = Math.floor(session.durationSec / 60);
    const durationSec = Math.round(session.durationSec % 60);

    return (
        <View style={styles.sessionItem}>
            <View style={styles.sessionLeft}>
                <Text style={styles.sessionPattern}>{session.patternLabel}</Text>
                <Text style={styles.sessionDate}>{dateStr} at {timeStr}</Text>
            </View>
            <View style={styles.sessionRight}>
                <Text style={styles.sessionDuration}>
                    {durationMin}:{durationSec.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.sessionCycles}>{session.cyclesCompleted} cycles</Text>
            </View>
        </View>
    );
};

// =============================================================================
// SCREEN
// =============================================================================

export const HistoryScreen: React.FC = () => {
    const sessions = useSessionStore(state => state.sessions);
    const streak = useSessionStore(state => state.streak);
    const weeklyProgress = useSessionStore(state => state.weeklyProgress);
    const weeklyGoal = useSessionStore(state => state.weeklyGoal);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Streak Card */}
                <StreakCard
                    current={streak.currentStreak}
                    longest={streak.longestStreak}
                    weeklyProgress={weeklyProgress}
                    weeklyGoal={weeklyGoal}
                />

                {/* Insights */}
                <InsightsCard />

                {/* Session History */}
                <Text style={styles.sectionTitle}>Recent Sessions</Text>

                {sessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🧘</Text>
                        <Text style={styles.emptyText}>No sessions yet</Text>
                        <Text style={styles.emptySubtext}>
                            Complete your first breathing session!
                        </Text>
                    </View>
                ) : (
                    sessions.slice(0, 20).map(session => (
                        <SessionItem key={session.id} session={session} />
                    ))
                )}

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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Streak Card
    streakCard: {
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    streakRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    streakItem: {
        alignItems: 'center',
        flex: 1,
    },
    streakDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#3A3A4E',
    },
    streakEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    streakLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },

    // Insights Card
    insightsCard: {
        backgroundColor: '#2A2A3E',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    insightsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    insightItem: {
        alignItems: 'center',
    },
    insightValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    insightLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    favoritePattern: {
        marginTop: 16,
        color: '#4ECDC4',
        fontSize: 14,
        textAlign: 'center',
    },

    // Session Item
    sessionItem: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sessionLeft: {
        flex: 1,
    },
    sessionRight: {
        alignItems: 'flex-end',
    },
    sessionPattern: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    sessionDate: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4ECDC4',
    },
    sessionCycles: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },

    bottomSpacer: {
        height: 40,
    },
});

export default HistoryScreen;
