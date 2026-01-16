/**
 * Settings Screen (Upgraded with real state management)
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Switch,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useCamera } from '../hooks/useCamera';
import { WearableSettings, UserProfile } from '../components';

interface SettingRowProps {
    label: string;
    description?: string;
    children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
    <View style={styles.row}>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            {description && <Text style={styles.rowDescription}>{description}</Text>}
        </View>
        {children}
    </View>
);

export const SettingsScreen: React.FC = () => {
    const {
        hapticEnabled,
        soundEnabled,
        cameraEnabled,
        setHapticEnabled,
        setSoundEnabled,
        setCameraEnabled,
    } = useSettingsStore();

    // Camera for permission check
    const camera = useCamera({ enabled: false });

    const handleCameraToggle = async (value: boolean) => {
        if (value) {
            // Request permission first
            if (camera.hasPermission === null || camera.hasPermission === false) {
                const granted = await camera.requestPermission();
                if (!granted) {
                    Alert.alert(
                        'Camera Permission Required',
                        'Please enable camera access in Settings to use heart rate detection.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            }
        }
        setCameraEnabled(value);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* User Profile */}
                <UserProfile />

                {/* Feedback Section */}
                <Text style={styles.sectionTitle}>Feedback</Text>

                <SettingRow
                    label="Haptic Feedback"
                    description="Vibrate on phase transitions"
                >
                    <Switch
                        value={hapticEnabled}
                        onValueChange={setHapticEnabled}
                        trackColor={{ false: '#3A3A4E', true: '#4ECDC4' }}
                        thumbColor={hapticEnabled ? '#fff' : '#888'}
                    />
                </SettingRow>

                <SettingRow
                    label="Sound"
                    description="Ambient tones during session"
                >
                    <Switch
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                        trackColor={{ false: '#3A3A4E', true: '#4ECDC4' }}
                        thumbColor={soundEnabled ? '#fff' : '#888'}
                    />
                </SettingRow>

                {/* Camera Section */}
                <Text style={styles.sectionTitle}>Heart Rate</Text>

                <SettingRow
                    label="Camera rPPG"
                    description="Detect heart rate via face camera"
                >
                    <Switch
                        value={cameraEnabled}
                        onValueChange={handleCameraToggle}
                        trackColor={{ false: '#3A3A4E', true: '#4ECDC4' }}
                        thumbColor={cameraEnabled ? '#fff' : '#888'}
                    />
                </SettingRow>

                {cameraEnabled && (
                    <View style={styles.cameraInfo}>
                        <Text style={styles.cameraInfoText}>
                            💡 For best results, ensure good lighting and keep your face steady.
                        </Text>
                    </View>
                )}

                {/* Wearable Section */}
                <WearableSettings />

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>

                <View style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>ZenOne</Text>
                    <Text style={styles.aboutVersion}>Version 2.0.0</Text>
                    <Text style={styles.aboutDescription}>
                        Cross-platform breathing & meditation app with camera-based biometrics.
                    </Text>
                    <View style={styles.techBadges}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>🦀 Rust Core</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>💓 rPPG</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>🧠 Active Inference</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
    },
    sectionTitle: {
        color: '#888',
        fontSize: 14,
        marginLeft: 20,
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2A2A3E',
        marginHorizontal: 20,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
    },
    rowContent: {
        flex: 1,
        marginRight: 16,
    },
    rowLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    rowDescription: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    cameraInfo: {
        backgroundColor: '#4ECDC420',
        marginHorizontal: 20,
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4ECDC440',
    },
    cameraInfoText: {
        color: '#4ECDC4',
        fontSize: 13,
    },
    aboutCard: {
        backgroundColor: '#2A2A3E',
        marginHorizontal: 20,
        marginVertical: 8,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    aboutTitle: {
        color: '#4ECDC4',
        fontSize: 24,
        fontWeight: 'bold',
    },
    aboutVersion: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
    aboutDescription: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    techBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
    },
    badge: {
        backgroundColor: '#3A3A4E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
    },
});

export default SettingsScreen;
