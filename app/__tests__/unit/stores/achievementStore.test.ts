/**
 * achievementStore tests
 */

import { useAchievementStore, ACHIEVEMENTS } from '../../../src/stores/achievementStore';

describe('achievementStore', () => {
    beforeEach(() => {
        // Reset store - use the actual API
        useAchievementStore.getState().initializeAchievements();
    });

    describe('ACHIEVEMENTS constant', () => {
        it('should have at least 10 achievements', () => {
            expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
        });

        it('should have unique IDs', () => {
            const ids = ACHIEVEMENTS.map(a => a.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have valid categories', () => {
            const validCategories = ['beginner', 'consistency', 'mastery', 'explorer', 'time'];
            ACHIEVEMENTS.forEach(a => {
                expect(validCategories).toContain(a.category);
            });
        });
    });

    describe('getUnlockedCount', () => {
        it('should return 0 when no achievements unlocked', () => {
            const count = useAchievementStore.getState().getUnlockedCount();
            expect(count).toBe(0);
        });
    });

    describe('getAchievementsByCategory', () => {
        it('should return achievements for valid category', () => {
            const beginner = useAchievementStore.getState().getAchievementsByCategory('beginner');
            expect(Array.isArray(beginner)).toBe(true);
        });
    });
});
