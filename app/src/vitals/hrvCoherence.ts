/**
 * HRV Coherence Module - AGOLOS-inspired biofeedback
 * 
 * Calculates coherence score from heart rate variability.
 * Based on AGOLOS HrvEstimator concepts.
 */

// Types from AGOLOS - simplified for React Native
export interface HrvMetrics {
    rmssd: number;      // Root mean square of successive differences
    sdnn: number;       // Standard deviation of NN intervals
    meanRR: number;     // Mean RR interval (ms)
    coherenceScore: number;  // 0-100 coherence
}

export interface CoherenceState {
    level: 'low' | 'medium' | 'high';
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    color: string;
}

// RR interval buffer for HRV calculation
class RRBuffer {
    private intervals: number[] = [];
    private maxSize: number;

    constructor(maxSize: number = 60) {
        this.maxSize = maxSize;
    }

    add(rrMs: number): void {
        this.intervals.push(rrMs);
        if (this.intervals.length > this.maxSize) {
            this.intervals.shift();
        }
    }

    get(): number[] {
        return [...this.intervals];
    }

    clear(): void {
        this.intervals = [];
    }

    size(): number {
        return this.intervals.length;
    }
}

/**
 * HRV Coherence Calculator
 * 
 * Inspired by AGOLOS zenb-signals HrvEstimator
 */
export class HrvCoherenceCalculator {
    private rrBuffer: RRBuffer;
    private lastHR: number = 0;
    private lastTimestamp: number = 0;
    private coherenceHistory: number[] = [];

    constructor() {
        this.rrBuffer = new RRBuffer(60);
    }

    /**
     * Add heart rate sample and update metrics
     */
    addHeartRate(bpm: number, timestamp: number): void {
        if (bpm <= 0) return;

        // Calculate RR interval from BPM
        const rrMs = 60000 / bpm;

        // Only add if reasonable interval from last
        if (this.lastTimestamp > 0) {
            const timeDiff = timestamp - this.lastTimestamp;
            if (timeDiff > 500 && timeDiff < 3000) {
                this.rrBuffer.add(rrMs);
            }
        }

        this.lastHR = bpm;
        this.lastTimestamp = timestamp;
    }

    /**
     * Calculate current HRV metrics
     */
    getMetrics(): HrvMetrics | null {
        const intervals = this.rrBuffer.get();
        if (intervals.length < 10) return null;

        // Mean RR
        const meanRR = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // SDNN (Standard Deviation of NN intervals)
        const squaredDiffs = intervals.map(rr => Math.pow(rr - meanRR, 2));
        const sdnn = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length);

        // RMSSD (Root Mean Square of Successive Differences)
        const successiveDiffs: number[] = [];
        for (let i = 1; i < intervals.length; i++) {
            successiveDiffs.push(Math.pow(intervals[i] - intervals[i - 1], 2));
        }
        const rmssd = successiveDiffs.length > 0
            ? Math.sqrt(successiveDiffs.reduce((a, b) => a + b, 0) / successiveDiffs.length)
            : 0;

        // Coherence score (0-100)
        // Higher RMSSD indicates better HRV / coherence
        // Typical RMSSD: 20-50ms for healthy adults
        const normalizedRmssd = Math.min(rmssd / 50, 1);
        const coherenceScore = normalizedRmssd * 100;

        // Track history
        this.coherenceHistory.push(coherenceScore);
        if (this.coherenceHistory.length > 30) {
            this.coherenceHistory.shift();
        }

        return {
            rmssd,
            sdnn,
            meanRR,
            coherenceScore,
        };
    }

    /**
     * Get coherence state for UI display
     */
    getCoherenceState(): CoherenceState {
        const metrics = this.getMetrics();
        const score = metrics?.coherenceScore ?? 0;

        // Determine level
        let level: 'low' | 'medium' | 'high';
        let color: string;

        if (score < 30) {
            level = 'low';
            color = '#FF6B6B';
        } else if (score < 60) {
            level = 'medium';
            color = '#FFD93D';
        } else {
            level = 'high';
            color = '#4ECDC4';
        }

        // Determine trend
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (this.coherenceHistory.length >= 10) {
            const recent = this.coherenceHistory.slice(-5);
            const older = this.coherenceHistory.slice(-10, -5);
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

            if (recentAvg > olderAvg + 5) {
                trend = 'improving';
            } else if (recentAvg < olderAvg - 5) {
                trend = 'declining';
            }
        }

        return { level, score, trend, color };
    }

    reset(): void {
        this.rrBuffer.clear();
        this.coherenceHistory = [];
        this.lastHR = 0;
        this.lastTimestamp = 0;
    }
}

// Singleton instance
let coherenceCalculator: HrvCoherenceCalculator | null = null;

export function getCoherenceCalculator(): HrvCoherenceCalculator {
    if (!coherenceCalculator) {
        coherenceCalculator = new HrvCoherenceCalculator();
    }
    return coherenceCalculator;
}

export default HrvCoherenceCalculator;
