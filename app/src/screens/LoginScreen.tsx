/**
 * Login Screen - Google Sign-In with Guest option
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/authService';

interface LoginScreenProps {
    onComplete: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onComplete }) => {
    const { signInWithGoogle, continueAsGuest } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState<'google' | 'guest' | null>(null);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setLoadingType('google');

        const user = await signInWithGoogle();

        setIsLoading(false);
        setLoadingType(null);

        if (user) {
            onComplete();
        }
    };

    const handleGuestContinue = async () => {
        setIsLoading(true);
        setLoadingType('guest');

        await continueAsGuest();

        setIsLoading(false);
        setLoadingType(null);

        onComplete();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🧘</Text>
                    <Text style={styles.title}>ZenOne</Text>
                    <Text style={styles.subtitle}>Breathe Better. Live Better.</Text>
                </View>

                {/* Benefits */}
                <View style={styles.benefits}>
                    <View style={styles.benefitRow}>
                        <Text style={styles.benefitIcon}>☁️</Text>
                        <View style={styles.benefitText}>
                            <Text style={styles.benefitTitle}>Sync Across Devices</Text>
                            <Text style={styles.benefitDesc}>Your progress, everywhere</Text>
                        </View>
                    </View>
                    <View style={styles.benefitRow}>
                        <Text style={styles.benefitIcon}>📊</Text>
                        <View style={styles.benefitText}>
                            <Text style={styles.benefitTitle}>Personalized Insights</Text>
                            <Text style={styles.benefitDesc}>AI-powered recommendations</Text>
                        </View>
                    </View>
                    <View style={styles.benefitRow}>
                        <Text style={styles.benefitIcon}>🏆</Text>
                        <View style={styles.benefitText}>
                            <Text style={styles.benefitTitle}>Never Lose Progress</Text>
                            <Text style={styles.benefitDesc}>Streaks & achievements saved</Text>
                        </View>
                    </View>
                </View>

                {/* Sign In Buttons */}
                <View style={styles.buttons}>
                    {/* Google Sign-In (Primary) */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {loadingType === 'google' ? (
                            <ActivityIndicator color="#1A1A2E" />
                        ) : (
                            <>
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.googleText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Skip (Guest) */}
                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={handleGuestContinue}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {loadingType === 'guest' ? (
                            <ActivityIndicator color="#888" />
                        ) : (
                            <Text style={styles.guestText}>Continue as Guest</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.guestNote}>
                        Guest data is stored locally only
                    </Text>
                </View>

                {/* Terms */}
                <Text style={styles.terms}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 8,
    },
    benefits: {
        marginBottom: 48,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    benefitIcon: {
        fontSize: 28,
        marginRight: 16,
        width: 40,
        textAlign: 'center',
    },
    benefitText: {
        flex: 1,
    },
    benefitTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    benefitDesc: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    buttons: {
        marginBottom: 24,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 12,
    },
    googleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#3A3A4E',
    },
    dividerText: {
        color: '#888',
        marginHorizontal: 16,
        fontSize: 14,
    },
    guestButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3A3A4E',
        paddingVertical: 16,
        borderRadius: 12,
    },
    guestText: {
        fontSize: 16,
        color: '#888',
    },
    guestNote: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginTop: 12,
    },
    terms: {
        textAlign: 'center',
        color: '#666',
        fontSize: 11,
        lineHeight: 16,
    },
});

export default LoginScreen;
