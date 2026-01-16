/**
 * ZenOne App Entry Point
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionScreen } from './screens/SessionScreen';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#1A1A2E' },
                }}
            >
                <Stack.Screen name="Session" component={SessionScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
