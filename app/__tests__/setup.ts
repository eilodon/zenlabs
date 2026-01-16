/**
 * Jest setup file
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
    Camera: {
        requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(() => Promise.resolve()),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(() => Promise.resolve()),
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-auth-session
jest.mock('expo-auth-session/providers/google', () => ({
    useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock react-native
jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
    Alert: { alert: jest.fn() },
    StyleSheet: { create: (styles: object) => styles },
}));

// Mock zustand persist middleware to avoid AsyncStorage issues
jest.mock('zustand/middleware', () => ({
    persist: (fn: Function) => fn,
    createJSONStorage: () => ({}),
}));
