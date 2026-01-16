/**
 * ZenOne SDK Entry Point
 * 
 * Factory for creating runtime instances.
 * Switch between MockRuntime (dev) and NativeRuntime (prod) here.
 */

import { MockRuntime } from './MockRuntime';
import type { IZenOneRuntime, RuntimeProvider, FfiBreathPattern, FfiFrame, FfiPhase, FfiSessionStats } from './ZenOneSDK';

// Re-export types
export type { IZenOneRuntime, FfiBreathPattern, FfiFrame, FfiPhase, FfiSessionStats, RuntimeProvider };

// ============================================================================
// RUNTIME FACTORY
// ============================================================================

let runtimeInstance: IZenOneRuntime | null = null;

/**
 * Get or create the ZenOne runtime instance
 * 
 * @param provider Which runtime to use ('mock' or 'native')
 * @param patternId Initial pattern ID
 */
export function getRuntime(
    provider: RuntimeProvider = 'mock',
    patternId: string = '4-7-8'
): IZenOneRuntime {
    if (!runtimeInstance) {
        switch (provider) {
            case 'native':
                // TODO: When UniFFI bindings are ready, use them here
                // import { ZenOneRuntime } from 'zenone-native';
                // runtimeInstance = new ZenOneRuntime(patternId);
                console.warn('[ZenOneSDK] Native runtime not available, falling back to mock');
                runtimeInstance = new MockRuntime(patternId);
                break;
            case 'mock':
            default:
                runtimeInstance = new MockRuntime(patternId);
                break;
        }
    }
    return runtimeInstance;
}

/**
 * Reset the runtime instance (for testing)
 */
export function resetRuntime(): void {
    if (runtimeInstance) {
        runtimeInstance.reset();
    }
    runtimeInstance = null;
}

/**
 * Create a new runtime instance (doesn't use singleton)
 */
export function createRuntime(
    provider: RuntimeProvider = 'mock',
    patternId: string = '4-7-8'
): IZenOneRuntime {
    switch (provider) {
        case 'native':
            console.warn('[ZenOneSDK] Native runtime not available, using mock');
            return new MockRuntime(patternId);
        case 'mock':
        default:
            return new MockRuntime(patternId);
    }
}
