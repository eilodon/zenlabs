/**
 * MockRuntime - Pure TypeScript implementation of ZenOne SDK
 * 
 * This provides the same interface as the Rust FFI but runs in pure JS.
 * Used for development and testing before native FFI is wired.
 * 
 * NOW WITH SIMULATED rPPG for heart rate from camera RGB values!
 * 
 * Uses migrated modules from AGOLOS:
 * - types/patterns.ts - Pattern definitions
 * - services/phaseMachine.ts - Phase transition logic
 */

import type { IZenOneRuntime, FfiBreathPattern, FfiFrame, FfiPhase, FfiSessionStats } from './ZenOneSDK';
import { BREATHING_PATTERNS } from '../types/patterns';
import type { BreathPattern, BreathPhase } from '../types/breath';
import { nextPhaseSkipZero, isPatternValid } from '../services/phaseMachine';

// Convert SDK Phase to internal BreathPhase
const SDK_TO_BREATH_PHASE: Record<FfiPhase, BreathPhase> = {
    'Inhale': 'inhale',
    'HoldIn': 'holdIn',
    'Exhale': 'exhale',
    'HoldOut': 'holdOut',
};

const BREATH_TO_SDK_PHASE: Record<BreathPhase, FfiPhase> = {
    'inhale': 'Inhale',
    'holdIn': 'HoldIn',
    'exhale': 'Exhale',
    'holdOut': 'HoldOut',
};

/**
 * Convert BreathPattern to FfiBreathPattern
 */
function toFfiPattern(pattern: BreathPattern): FfiBreathPattern {
    return {
        id: pattern.id,
        label: pattern.label,
        tag: pattern.tag,
        description: pattern.description,
        inhale_sec: pattern.timings.inhale,
        hold_in_sec: pattern.timings.holdIn,
        exhale_sec: pattern.timings.exhale,
        hold_out_sec: pattern.timings.holdOut,
        recommended_cycles: pattern.recommendedCycles,
        arousal_impact: pattern.arousalImpact,
    };
}

/**
 * Simple PPG signal buffer for heart rate estimation
 */
class PpgBuffer {
    private buffer: number[] = [];
    private timestamps: number[] = [];
    private readonly maxSize = 300; // ~10 seconds at 30fps
    private lastHrEstimate: number | null = null;
    private lastConfidence: number = 0;

    add(green: number, timestampUs: number): void {
        this.buffer.push(green);
        this.timestamps.push(timestampUs);

        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
            this.timestamps.shift();
        }
    }

    estimateHeartRate(): { bpm: number | null; confidence: number } {
        if (this.buffer.length < 90) { // Need ~3 seconds
            return { bpm: this.lastHrEstimate, confidence: this.lastConfidence * 0.9 };
        }

        // Detrend the signal (remove slow drift)
        const detrended = this.detrend(this.buffer);

        // Find peaks using simple threshold crossing
        const peaks = this.findPeaks(detrended);

        if (peaks.length < 3) {
            return { bpm: this.lastHrEstimate, confidence: this.lastConfidence * 0.9 };
        }

        // Calculate sampling rate
        const durationUs = this.timestamps[this.timestamps.length - 1] - this.timestamps[0];
        const samplingRateHz = (this.buffer.length - 1) / (durationUs / 1_000_000);

        // Calculate inter-peak intervals
        const intervals: number[] = [];
        for (let i = 1; i < peaks.length; i++) {
            const intervalSamples = peaks[i] - peaks[i - 1];
            const intervalMs = (intervalSamples / samplingRateHz) * 1000;

            // Filter to reasonable heart rate range (40-180 BPM)
            if (intervalMs > 333 && intervalMs < 1500) {
                intervals.push(intervalMs);
            }
        }

        if (intervals.length < 2) {
            return { bpm: this.lastHrEstimate, confidence: this.lastConfidence * 0.9 };
        }

        // Calculate BPM from average interval
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = 60000 / avgInterval;

        // Calculate confidence based on interval consistency
        const variance = this.calculateVariance(intervals);
        const cv = Math.sqrt(variance) / avgInterval; // Coefficient of variation
        const confidence = Math.max(0.3, Math.min(0.95, 1 - cv * 2));

        // Smooth the estimate
        if (this.lastHrEstimate !== null) {
            const smoothedBpm = this.lastHrEstimate * 0.7 + bpm * 0.3;
            this.lastHrEstimate = smoothedBpm;
        } else {
            this.lastHrEstimate = bpm;
        }
        this.lastConfidence = confidence;

        return {
            bpm: Math.round(this.lastHrEstimate * 10) / 10,
            confidence
        };
    }

    private detrend(signal: number[]): number[] {
        // Simple linear detrending
        const n = signal.length;
        const mean = signal.reduce((a, b) => a + b, 0) / n;
        return signal.map((v, i) => v - mean);
    }

    private findPeaks(signal: number[]): number[] {
        const peaks: number[] = [];
        const threshold = Math.max(...signal) * 0.3;

        for (let i = 2; i < signal.length - 2; i++) {
            if (signal[i] > threshold &&
                signal[i] > signal[i - 1] &&
                signal[i] > signal[i - 2] &&
                signal[i] > signal[i + 1] &&
                signal[i] > signal[i + 2]) {
                peaks.push(i);
            }
        }

        return peaks;
    }

    private calculateVariance(values: number[]): number {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    }

    clear(): void {
        this.buffer = [];
        this.timestamps = [];
        this.lastHrEstimate = null;
        this.lastConfidence = 0;
    }
}

/**
 * MockRuntime - Simulates ZenOneRuntime from Rust
 */
export class MockRuntime implements IZenOneRuntime {
    private currentPatternIdVal: string = '4-7-8';
    private currentPattern: BreathPattern;
    private sessionActive: boolean = false;
    private sessionStartTime: number = 0;
    private hrSamples: number[] = [];

    // Phase machine state
    private currentPhase: BreathPhase = 'inhale';
    private phaseElapsedUs: number = 0;
    private cyclesCompleted: number = 0;
    private lastTimestampUs: number = 0;

    // rPPG processing
    private ppgBuffer: PpgBuffer = new PpgBuffer();

    constructor(patternId: string = '4-7-8') {
        this.currentPatternIdVal = patternId;
        this.currentPattern = BREATHING_PATTERNS[patternId] || BREATHING_PATTERNS['4-7-8'];
    }

    getPatterns(): FfiBreathPattern[] {
        return Object.values(BREATHING_PATTERNS).map(toFfiPattern);
    }

    loadPattern(patternId: string): boolean {
        const pattern = BREATHING_PATTERNS[patternId];
        if (pattern && isPatternValid(pattern)) {
            this.currentPatternIdVal = patternId;
            this.currentPattern = pattern;
            this.reset();
            return true;
        }
        return false;
    }

    processFrame(r: number, g: number, b: number, timestampUs: number): FfiFrame {
        // Calculate delta time
        const dtUs = this.lastTimestampUs > 0
            ? Math.max(0, timestampUs - this.lastTimestampUs)
            : 33333; // ~30fps default
        this.lastTimestampUs = timestampUs;

        // Update phase elapsed time
        this.phaseElapsedUs += dtUs;

        // Get current phase duration in microseconds
        const phaseDurationUs = this.getPhaseDurationUs(this.currentPhase);

        // Check for phase transition
        if (phaseDurationUs > 0 && this.phaseElapsedUs >= phaseDurationUs) {
            const nextPhase = nextPhaseSkipZero(this.currentPhase, this.currentPattern);

            // Check for cycle completion (when we return to inhale)
            if (nextPhase === 'inhale' && this.currentPhase !== 'inhale') {
                this.cyclesCompleted++;
            }

            this.currentPhase = nextPhase;
            this.phaseElapsedUs = 0;
        }

        // Calculate progress (0.0 - 1.0)
        const progress = phaseDurationUs > 0
            ? Math.min(1.0, this.phaseElapsedUs / phaseDurationUs)
            : 0;

        // Process rPPG if we have camera data
        let heartRate: number | null = null;
        let signalQuality = 0;

        if (this.sessionActive && (r > 0 || g > 0 || b > 0)) {
            // Add green channel to PPG buffer (strongest PPG signal)
            this.ppgBuffer.add(g, timestampUs);

            // Estimate heart rate
            const hrResult = this.ppgBuffer.estimateHeartRate();
            heartRate = hrResult.bpm;
            signalQuality = hrResult.confidence;

            if (heartRate !== null) {
                this.hrSamples.push(heartRate);
            }
        } else if (this.sessionActive) {
            // No camera data - use simulated heart rate
            heartRate = 65 + Math.sin(timestampUs / 2_000_000) * 5;
            signalQuality = 0.85;
            this.hrSamples.push(heartRate);
        }

        return {
            phase: BREATH_TO_SDK_PHASE[this.currentPhase],
            phase_progress: progress,
            cycles_completed: this.cyclesCompleted,
            heart_rate: heartRate,
            signal_quality: signalQuality,
        };
    }

    startSession(): void {
        this.sessionActive = true;
        this.sessionStartTime = Date.now();
        this.hrSamples = [];
        this.ppgBuffer.clear();
        this.reset();
    }

    stopSession(): FfiSessionStats {
        const durationSec = (Date.now() - this.sessionStartTime) / 1000;
        const avgHr = this.hrSamples.length > 0
            ? this.hrSamples.reduce((a, b) => a + b, 0) / this.hrSamples.length
            : null;

        const stats: FfiSessionStats = {
            duration_sec: durationSec,
            cycles_completed: this.cyclesCompleted,
            pattern_id: this.currentPatternIdVal,
            avg_heart_rate: avgHr ? Math.round(avgHr * 10) / 10 : null,
        };

        this.sessionActive = false;
        this.ppgBuffer.clear();
        return stats;
    }

    isSessionActive(): boolean {
        return this.sessionActive;
    }

    currentPatternId(): string {
        return this.currentPatternIdVal;
    }

    reset(): void {
        this.currentPhase = 'inhale';
        this.phaseElapsedUs = 0;
        this.cyclesCompleted = 0;
        this.lastTimestampUs = 0;
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private getPhaseDurationUs(phase: BreathPhase): number {
        const seconds = this.currentPattern.timings[phase];
        return seconds * 1_000_000; // Convert to microseconds
    }
}
