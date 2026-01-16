/**
 * ZenOne App Entry Point
 * 
 * Flow: Onboarding → Login → Main App
 * Wrapped with ErrorBoundary for crash protection
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    SessionScreen,
    SettingsScreen,
    OnboardingScreen,
    HistoryScreen,
    AchievementsScreen,
    LoginScreen,
} from './screens';
import { ErrorBoundary } from './components';
import { StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './stores/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ONBOARDING_KEY = '@zenone_onboarding_complete';

// Main app tabs
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1A1A2E',
                    borderTopColor: '#2A2A3E',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarActiveTintColor: '#4ECDC4',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Breathe"
                component={SessionScreen}
                options={{
                    tabBarIcon: () => <Text style={{ fontSize: 22 }}>🧘</Text>,
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text>,
                }}
            />
            <Tab.Screen
                name="Achievements"
                component={AchievementsScreen}
                options={{
                    tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏆</Text>,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: () => <Text style={{ fontSize: 22 }}>⚙️</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

function AppContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const { isAuthenticated, hasSeenLogin, markLoginSeen } = useAuthStore();

    useEffect(() => {
        checkInitialState();
    }, []);

    const checkInitialState = async () => {
        try {
            const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
            if (onboardingComplete !== 'true') {
                setShowOnboarding(true);
                setIsLoading(false);
                return;
            }

            if (!hasSeenLogin && !isAuthenticated) {
                setShowLogin(true);
            }
        } catch (error) {
            console.error('Init error:', error);
        }
        setIsLoading(false);
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch { }
        setShowOnboarding(false);
        setShowLogin(true);
    };

    const completeLogin = () => {
        markLoginSeen();
        setShowLogin(false);
    };

    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {showOnboarding ? (
                    <Stack.Screen name="Onboarding">
                        {() => <OnboardingScreen onComplete={completeOnboarding} />}
                    </Stack.Screen>
                ) : showLogin ? (
                    <Stack.Screen name="Login">
                        {() => <LoginScreen onComplete={completeLogin} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Main" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
