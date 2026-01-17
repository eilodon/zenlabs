/**
 * Design System Tokens
 * Consistent theming values for ZenOne UI
 */

export const COLORS = {
    // Surface colors
    surface: '#0B0B0C',
    elevated: '#161719',
    overlay: '#1E1E24',

    // Text colors
    text: '#EDEDED',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    textMuted: 'rgba(255, 255, 255, 0.2)',

    // Primary accent
    primary: '#4ECDC4',
    primaryFaded: 'rgba(78, 205, 196, 0.2)',

    // Status colors
    success: '#16A34A',
    successFaded: 'rgba(22, 163, 74, 0.2)',
    warn: '#F59E0B',
    warnFaded: 'rgba(245, 158, 11, 0.2)',
    error: '#DC2626',
    errorFaded: 'rgba(220, 38, 38, 0.2)',

    // Theme colors
    warm: {
        primary: '#F97316',
        gradient: ['rgba(249, 115, 22, 0.1)', 'rgba(190, 18, 60, 0.2)'],
        border: 'rgba(249, 115, 22, 0.3)',
        shadow: 'rgba(249, 115, 22, 0.3)',
    },
    cool: {
        primary: '#06B6D4',
        gradient: ['rgba(6, 182, 212, 0.1)', 'rgba(37, 99, 235, 0.2)'],
        border: 'rgba(6, 182, 212, 0.3)',
        shadow: 'rgba(6, 182, 212, 0.3)',
    },
    neutral: {
        primary: '#FFFFFF',
        gradient: ['rgba(255, 255, 255, 0.1)', 'rgba(107, 114, 128, 0.2)'],
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: 'rgba(255, 255, 255, 0.15)',
    },
};

export const DURATIONS = {
    fast: 150,
    normal: 250,
    slow: 400,
    spring: {
        damping: 25,
        stiffness: 300,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADII = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const TYPOGRAPHY = {
    heading: {
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    subheading: {
        fontSize: 18,
        fontWeight: '600' as const,
        letterSpacing: 0,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
        letterSpacing: 0.25,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        letterSpacing: 0.4,
    },
    mono: {
        fontSize: 10,
        fontWeight: '500' as const,
        letterSpacing: 1,
        fontFamily: 'monospace',
    },
};

export const SHADOWS = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    }),
};
