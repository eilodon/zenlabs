/**
 * ZenOne SDK Interface Definitions
 * 
 * These types mirror rust-core/lib.rs FFI types.
 * When native FFI is wired, these will come from the UniFFI bindings.
 */

// ============================================================================
// FFI-COMPATIBLE TYPES (matching rust-core)
// ============================================================================

export interface FfiBreathPattern {
    id: string;
    label: string;
    tag: string;
    description: string;
    inhale_sec: number;
    hold_in_sec: number;
    exhale_sec: number;
    hold_out_sec: number;
    recommended_cycles: number;
    arousal_impact: number;
}

export type FfiPhase = 'Inhale' | 'HoldIn' | 'Exhale' | 'HoldOut';

export interface FfiFrame {
    phase: FfiPhase;
    phase_progress: number;  // 0.0 - 1.0
    cycles_completed: number;
    heart_rate: number | null;
    signal_quality: number;  // 0.0 - 1.0
}

export interface FfiSessionStats {
    duration_sec: number;
    cycles_completed: number;
    pattern_id: string;
    avg_heart_rate: number | null;
}

// ============================================================================
// SDK RUNTIME INTERFACE
// ============================================================================

/**
 * IZenOneRuntime - Interface mirroring ZenOneRuntime from Rust
 * 
 * This abstraction allows swapping between:
 * - MockRuntime (pure TS, for development)
 * - NativeRuntime (real UniFFI, for production)
 */
export interface IZenOneRuntime {
    /**
     * Get all available breathing patterns
     */
    getPatterns(): FfiBreathPattern[];

    /**
     * Load a pattern by ID
     * @returns true if pattern exists and was loaded
     */
    loadPattern(patternId: string): boolean;

    /**
     * Process a camera frame (or simulated tick)
     * @param r Red channel mean (0-255)
     * @param g Green channel mean (0-255)
     * @param b Blue channel mean (0-255)
     * @param timestampUs Timestamp in microseconds
     * @returns Current frame state
     */
    processFrame(r: number, g: number, b: number, timestampUs: number): FfiFrame;

    /**
     * Start a breathing session
     */
    startSession(): void;

    /**
     * Stop session and get stats
     */
    stopSession(): FfiSessionStats;

    /**
     * Check if session is active
     */
    isSessionActive(): boolean;

    /**
     * Get current pattern ID
     */
    currentPatternId(): string;

    /**
     * Reset the runtime state
     */
    reset(): void;
}

// ============================================================================
// RUNTIME PROVIDER TYPE
// ============================================================================

export type RuntimeProvider = 'mock' | 'native';
