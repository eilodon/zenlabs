/**
 * useZenOne Hook - Bridge to ZenOne SDK
 * 
 * REFACTORED to use SDK abstraction layer instead of pure JS implementation.
 * Uses either MockRuntime (dev) or NativeRuntime (production).
 * 
 * NOW WITH CAMERA INTEGRATION for real heart rate detection!
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useZenOneStore } from '../stores/zenoneStore';
import { getRuntime, type IZenOneRuntime, type FfiBreathPattern } from '../sdk';
import { useCamera, type CameraFrame } from './useCamera';
import * as Haptics from 'expo-haptics';

// Frame update interval (16ms ≈ 60fps)
const FRAME_INTERVAL_MS = 16;

interface UseZenOneOptions {
    cameraEnabled?: boolean;
}

export function useZenOne(options: UseZenOneOptions = {}) {
    const { cameraEnabled = false } = options;

    const {
        selectedPatternId,
        isSessionActive,
        setPatterns,
        updateFrame,
    } = useZenOneStore();

    // SDK Runtime instance
    const runtimeRef = useRef<IZenOneRuntime | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPhaseRef = useRef<string | null>(null);

    // Camera frame buffer for heart rate calculation
    const frameBufferRef = useRef<CameraFrame[]>([]);
    const [cameraReady, setCameraReady] = useState(false);

    // Camera integration
    const handleCameraFrame = useCallback((frame: CameraFrame) => {
        // Add to buffer (keep last 5 seconds at 30fps = 150 frames)
        frameBufferRef.current.push(frame);
        if (frameBufferRef.current.length > 150) {
            frameBufferRef.current.shift();
        }
    }, []);

    const camera = useCamera({
        enabled: cameraEnabled && isSessionActive,
        onFrame: handleCameraFrame,
    });

    // Initialize runtime and load patterns on mount
    useEffect(() => {
        const runtime = getRuntime('mock', selectedPatternId);
        runtimeRef.current = runtime;

        // Load patterns from SDK (not hardcoded!)
        const patterns = runtime.getPatterns();
        setPatterns(patterns.map(toPatternInfo));

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Load pattern when selection changes
    useEffect(() => {
        if (runtimeRef.current && selectedPatternId) {
            runtimeRef.current.loadPattern(selectedPatternId);
        }
    }, [selectedPatternId]);

    // Process frame - called by interval when session is active
    const processFrame = useCallback(() => {
        if (!runtimeRef.current || !isSessionActive) return;

        const timestampUs = Date.now() * 1000; // Convert to microseconds

        // Get RGB from camera frame buffer if available
        let r = 0, g = 0, b = 0;
        if (frameBufferRef.current.length > 0) {
            const latestFrame = frameBufferRef.current[frameBufferRef.current.length - 1];
            r = latestFrame.r;
            g = latestFrame.g;
            b = latestFrame.b;
        }

        // Call SDK processFrame with real camera data
        const frame = runtimeRef.current.processFrame(r, g, b, timestampUs);

        // Haptic feedback on phase change
        if (frame.phase !== lastPhaseRef.current) {
            lastPhaseRef.current = frame.phase;

            // Different haptic patterns for different phases
            switch (frame.phase) {
                case 'Inhale':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                    break;
                case 'Exhale':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
                    break;
                case 'HoldIn':
                case 'HoldOut':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
                    break;
            }
        }

        // Update store
        updateFrame({
            phase: frame.phase,
            phaseProgress: frame.phase_progress,
            cyclesCompleted: frame.cycles_completed,
            heartRate: frame.heart_rate,
            signalQuality: frame.signal_quality,
        });
    }, [isSessionActive, updateFrame]);

    // Start/stop frame processing based on session state
    useEffect(() => {
        let rafId: number | null = null;
        let lastTime = 0;

        const loop = (time: number) => {
            // Throttle to ~60fps
            if (time - lastTime >= FRAME_INTERVAL_MS) {
                processFrame();
                lastTime = time;
            }
            rafId = requestAnimationFrame(loop);
        };

        if (isSessionActive) {
            // Reset phase tracking
            lastPhaseRef.current = null;
            frameBufferRef.current = [];

            // Start the runtime session
            if (runtimeRef.current) {
                runtimeRef.current.startSession();
            }

            // Start frame processing loop with requestAnimationFrame
            rafId = requestAnimationFrame(loop);
        }

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [isSessionActive, processFrame]);

    // Get session stats when stopping
    const getSessionStats = useCallback(() => {
        if (runtimeRef.current) {
            return runtimeRef.current.stopSession();
        }
        return null;
    }, []);

    return {
        runtime: runtimeRef.current,
        getSessionStats,
        // Camera exports
        camera,
        cameraEnabled,
        frameCount: frameBufferRef.current.length,
    };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert FfiBreathPattern to PatternInfo for UI components
 */
function toPatternInfo(pattern: FfiBreathPattern) {
    return {
        id: pattern.id,
        label: pattern.label,
        tag: pattern.tag,
        description: pattern.description,
        inhale_sec: pattern.inhale_sec,
        hold_in_sec: pattern.hold_in_sec,
        exhale_sec: pattern.exhale_sec,
        hold_out_sec: pattern.hold_out_sec,
    };
}
