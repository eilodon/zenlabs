/**
 * Haptics Utility - Tactile feedback for ZenOne
 * Adapted from Pandora UI design system
 * 
 * Uses expo-haptics for cross-platform vibration feedback
 */

import * as Haptics from 'expo-haptics';

export type HapticType = 'success' | 'warning' | 'error' | 'selection' | 'light' | 'medium' | 'heavy';

/**
 * Trigger haptic feedback
 * @param type - Type of haptic feedback
 */
export const haptic = async (type: HapticType = 'selection'): Promise<void> => {
    try {
        switch (type) {
            case 'success':
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                break;
            case 'warning':
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                );
                break;
            case 'error':
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                );
                break;
            case 'light':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'selection':
            default:
                await Haptics.selectionAsync();
                break;
        }
    } catch (error) {
        // Silently fail if haptics not available
        console.debug('[Haptics] Not available:', error);
    }
};

/**
 * Quick haptic shortcuts
 */
export const haptics = {
    success: () => haptic('success'),
    warning: () => haptic('warning'),
    error: () => haptic('error'),
    selection: () => haptic('selection'),
    light: () => haptic('light'),
    medium: () => haptic('medium'),
    heavy: () => haptic('heavy'),

    // Breathing session specific
    breathIn: () => haptic('light'),
    breathOut: () => haptic('light'),
    sessionStart: () => haptic('success'),
    sessionEnd: () => haptic('medium'),
    cycleComplete: () => haptic('light'),
};

export default haptics;
