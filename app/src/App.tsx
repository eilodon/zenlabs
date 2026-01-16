/**
 * ZenOne App Entry Point (with Onboarding)
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SessionScreen, SettingsScreen, OnboardingScreen } from './screens';
import { StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                    height: 60,
                },
                tabBarActiveTintColor: '#4ECDC4',
                tabBarInactiveTintColor: '#888',
            }}
        >
            <Tab.Screen
                name="Breathe"
                component={SessionScreen}
                options={{
                    tabBarIcon: ({ color }: { color: string }) => <Text style={{ fontSize: 20 }}>🧘</Text>,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color }: { color: string }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            setShowOnboarding(value !== 'true');
        } catch {
            setShowOnboarding(true);
        }
        setIsLoading(false);
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch { }
        setShowOnboarding(false);
    };

    if (isLoading) {
        return null; // Splash screen would go here
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {showOnboarding ? (
                    <Stack.Screen name="Onboarding">
                        {() => <OnboardingScreen onComplete={completeOnboarding} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Main" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
