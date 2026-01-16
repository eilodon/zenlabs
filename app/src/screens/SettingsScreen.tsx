/**
 * Settings Screen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Switch,
    ScrollView,
} from 'react-native';

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
    const [hapticEnabled, setHapticEnabled] = React.useState(true);
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [cameraEnabled, setCameraEnabled] = React.useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Feedback Section */}
                <Text style={styles.sectionTitle}>Feedback</Text>

                <SettingRow
                    label="Haptic Feedback"
                    description="Vibrate on phase transitions"
                >
                    <Switch
                        value={hapticEnabled}
                        onValueChange={setHapticEnabled}
                        trackColor={{ true: '#4ECDC4' }}
                    />
                </SettingRow>

                <SettingRow
                    label="Sound"
                    description="Ambient tones during session"
                >
                    <Switch
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                        trackColor={{ true: '#4ECDC4' }}
                    />
                </SettingRow>

                {/* Camera Section */}
                <Text style={styles.sectionTitle}>Heart Rate</Text>

                <SettingRow
                    label="Camera rPPG"
                    description="Detection via face camera"
                >
                    <Switch
                        value={cameraEnabled}
                        onValueChange={setCameraEnabled}
                        trackColor={{ true: '#4ECDC4' }}
                    />
                </SettingRow>

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>

                <View style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>ZenOne</Text>
                    <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                    <Text style={styles.aboutDescription}>
                        Cross-platform breathing & meditation app powered by Rust.
                    </Text>
                    <Text style={styles.aboutTech}>
                        Core: zenb-core + zenb-signals from AGOLOS
                    </Text>
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
    aboutTech: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
    },
});

export default SettingsScreen;
