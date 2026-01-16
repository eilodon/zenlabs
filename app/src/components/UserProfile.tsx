/**
 * UserProfile Component - Display and manage user account
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useAuth } from '../services/authService';

export const UserProfile: React.FC = () => {
    const { user, isAuthenticated, isGuest, signOut, signInWithGoogle } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleUpgrade = async () => {
        const result = await signInWithGoogle();
        if (result) {
            Alert.alert('Success', 'Your account has been upgraded to Google!');
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out? Guest data will be preserved locally.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.displayName?.[0]?.toUpperCase() || '👤'}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.displayName}>
                        {user.displayName || 'Guest User'}
                    </Text>
                    <Text style={styles.email}>
                        {user.email || 'No email connected'}
                    </Text>
                    <View style={[styles.badge, isGuest && styles.guestBadge]}>
                        <Text style={styles.badgeText}>
                            {isGuest ? 'Guest' : 'Google'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Upgrade prompt for guests */}
            {isGuest && (
                <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
                    <View style={styles.upgradeContent}>
                        <Text style={styles.upgradeIcon}>☁️</Text>
                        <View style={styles.upgradeText}>
                            <Text style={styles.upgradeTitle}>Sync Your Data</Text>
                            <Text style={styles.upgradeDesc}>
                                Connect Google to save progress across devices
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.upgradeArrow}>→</Text>
                </TouchableOpacity>
            )}

            {/* Sign out button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    displayName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    email: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#4ECDC433',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    guestBadge: {
        backgroundColor: '#FF6B6B33',
    },
    badgeText: {
        color: '#4ECDC4',
        fontSize: 12,
        fontWeight: '600',
    },
    upgradeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4ECDC420',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#4ECDC440',
    },
    upgradeContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    upgradeIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    upgradeText: {
        flex: 1,
    },
    upgradeTitle: {
        color: '#4ECDC4',
        fontSize: 16,
        fontWeight: '600',
    },
    upgradeDesc: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    upgradeArrow: {
        color: '#4ECDC4',
        fontSize: 20,
    },
    signOutButton: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A3A4E',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    signOutText: {
        color: '#888',
        fontSize: 14,
    },
});

export default UserProfile;
