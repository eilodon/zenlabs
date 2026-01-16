/**
 * WearableSettings Component - Connect to fitness wearables
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useWearable, type WearableProvider, WEARABLE_PROVIDERS } from '../services/wearableService';

export const WearableSettings: React.FC = () => {
    const {
        provider,
        setProvider,
        isConnected,
        isLoading,
        heartRate,
        connect,
        availableProviders,
    } = useWearable();

    const handleSelectProvider = async (p: WearableProvider) => {
        if (p === provider) return;

        await setProvider(p);

        // Connect for non-camera providers
        const success = await connect();
        if (!success) {
            Alert.alert(
                'Connection Failed',
                `Could not connect to ${WEARABLE_PROVIDERS[p].name}. Please check your device settings.`
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Heart Rate Source</Text>

            {availableProviders.map((prov) => (
                <TouchableOpacity
                    key={prov.id}
                    style={[
                        styles.providerCard,
                        provider === prov.id && styles.providerSelected,
                    ]}
                    onPress={() => handleSelectProvider(prov.id)}
                    disabled={isLoading}
                >
                    <View style={styles.providerIcon}>
                        <Text style={styles.providerEmoji}>{prov.icon}</Text>
                    </View>
                    <View style={styles.providerContent}>
                        <Text style={styles.providerName}>{prov.name}</Text>
                        <Text style={styles.providerDescription}>
                            {prov.description}
                        </Text>
                        {prov.models.length > 0 && provider === prov.id && (
                            <Text style={styles.providerModels}>
                                Supports: {prov.models.slice(0, 3).join(', ')}
                                {prov.models.length > 3 ? '...' : ''}
                            </Text>
                        )}
                    </View>
                    <View style={styles.providerStatus}>
                        {isLoading && provider === prov.id ? (
                            <ActivityIndicator size="small" color="#4ECDC4" />
                        ) : provider === prov.id && isConnected ? (
                            <View style={styles.connectedBadge}>
                                <Text style={styles.connectedText}>✓</Text>
                            </View>
                        ) : provider === prov.id ? (
                            <View style={styles.selectedDot} />
                        ) : null}
                    </View>
                </TouchableOpacity>
            ))}

            {/* Connection status */}
            {isConnected && (
                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>Connected</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusEmoji}>❤️</Text>
                        <Text style={styles.statusValue}>
                            {heartRate ? `${Math.round(heartRate)} BPM` : 'Waiting...'}
                        </Text>
                    </View>
                </View>
            )}
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
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    providerSelected: {
        borderColor: '#4ECDC4',
    },
    providerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3A3A4E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    providerEmoji: {
        fontSize: 24,
    },
    providerContent: {
        flex: 1,
    },
    providerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    providerDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    providerModels: {
        color: '#4ECDC4',
        fontSize: 11,
        marginTop: 4,
    },
    providerStatus: {
        width: 30,
        alignItems: 'center',
    },
    selectedDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ECDC4',
    },
    connectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusCard: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        alignItems: 'center',
    },
    statusLabel: {
        color: '#4ECDC4',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    statusValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default WearableSettings;
