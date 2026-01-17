/**
 * hrvCoherence tests
 */

import { HrvCoherenceCalculator } from '../../../src/vitals/hrvCoherence';

describe('HrvCoherenceCalculator', () => {
    it('returns null when there are not enough samples', () => {
        const calculator = new HrvCoherenceCalculator();
        const start = 1700000000000;

        for (let i = 0; i < 10; i += 1) {
            calculator.addHeartRate(60, start + i * 1000);
        }

        expect(calculator.getMetrics()).toBeNull();
    });

    it('calculates metrics when enough samples exist', () => {
        const calculator = new HrvCoherenceCalculator();
        const start = 1700000000000;

        for (let i = 0; i < 11; i += 1) {
            const bpm = i % 2 === 0 ? 60 : 65;
            calculator.addHeartRate(bpm, start + i * 1000);
        }

        const metrics = calculator.getMetrics();
        expect(metrics).not.toBeNull();
        if (!metrics) return;

        expect(metrics.coherenceScore).toBeGreaterThanOrEqual(0);
        expect(metrics.coherenceScore).toBeLessThanOrEqual(100);
        expect(metrics.rmssd).toBeGreaterThan(0);
        expect(metrics.sdnn).toBeGreaterThanOrEqual(0);
        expect(metrics.meanRR).toBeGreaterThan(900);
        expect(metrics.meanRR).toBeLessThan(1100);
    });

    it('resets metrics and history', () => {
        const calculator = new HrvCoherenceCalculator();
        const start = 1700000000000;

        for (let i = 0; i < 11; i += 1) {
            calculator.addHeartRate(60, start + i * 1000);
        }

        expect(calculator.getMetrics()).not.toBeNull();
        calculator.reset();
        expect(calculator.getMetrics()).toBeNull();
    });
});
