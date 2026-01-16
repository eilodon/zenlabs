/**
 * patternRecommender tests
 */

import {
    recommendPatterns,
    getTopRecommendation,
    getPersonalizedGreeting,
} from '../../../src/services/patternRecommender';

describe('patternRecommender', () => {
    describe('recommendPatterns', () => {
        it('should return array of recommendations', () => {
            const recommendations = recommendPatterns();
            expect(Array.isArray(recommendations)).toBe(true);
            expect(recommendations.length).toBeGreaterThan(0);
        });

        it('should respect limit parameter', () => {
            const recommendations = recommendPatterns(5);
            expect(recommendations.length).toBeLessThanOrEqual(5);
        });

        it('should include patternId, score, and reason', () => {
            const recommendations = recommendPatterns(3);
            recommendations.forEach(r => {
                expect(r.patternId).toBeDefined();
                expect(typeof r.patternId).toBe('string');
                expect(r.score).toBeDefined();
                expect(typeof r.score).toBe('number');
                expect(r.reason).toBeDefined();
                expect(typeof r.reason).toBe('string');
            });
        });

        it('should return sorted by score descending', () => {
            const recommendations = recommendPatterns(5);
            for (let i = 1; i < recommendations.length; i++) {
                expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
            }
        });
    });

    describe('getTopRecommendation', () => {
        it('should return single recommendation or null', () => {
            const top = getTopRecommendation();
            expect(top === null || typeof top === 'object').toBe(true);
        });

        it('should return top scored pattern', () => {
            const top = getTopRecommendation();
            const all = recommendPatterns(10);

            if (top && all.length > 0) {
                expect(top.score).toBe(all[0].score);
            }
        });
    });

    describe('getPersonalizedGreeting', () => {
        it('should return a string greeting', () => {
            const greeting = getPersonalizedGreeting();
            expect(typeof greeting).toBe('string');
            expect(greeting.length).toBeGreaterThan(0);
        });
    });
});
