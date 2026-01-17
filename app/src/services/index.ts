/**
 * Services Index
 */

export { nextPhaseSkipZero, isPatternValid } from './phaseMachine';
export { recommendPatterns, getTopRecommendation, getPersonalizedGreeting } from './patternRecommender';
export { wearableService, useWearable, WEARABLE_PROVIDERS } from './wearableService';
export type { WearableProvider, WearableData, WearableDevice, ProviderConfig } from './wearableService';
export { breathingCoach, useCoaching } from './coachingService';
export type { CoachingContext, CoachingMessage } from './coachingService';
export { authService, useAuth, syncUserData } from './authService';
export type { UserProfile, AuthState, SessionSyncData } from './authService';
export { voiceGuidance } from './voiceGuidance';
export type { VoiceMode } from './voiceGuidance';
