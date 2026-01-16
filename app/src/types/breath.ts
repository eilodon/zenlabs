/**
 * ZenOne Breathing Types
 * Migrated from AGOLOS/ZenOne
 */

export type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
export type CueType = 'inhale' | 'exhale' | 'hold' | 'finish';

export type BreathingType =
    | '4-7-8'
    | 'box'
    | 'calm'
    | 'coherence'
    | 'deep-relax'
    | '7-11'
    | 'awake'
    | 'triangle'
    | 'tactical'
    | 'buteyko'
    | 'wim-hof';

export type PatternTier = 1 | 2 | 3;

export type ColorTheme = 'warm' | 'cool' | 'neutral';
export type Language = 'en' | 'vi';

export type SoundPack = 'synth' | 'breath' | 'bells' | 'real-zen' | 'voice-full' | 'voice-12';

export type QualityTier = 'auto' | 'low' | 'medium' | 'high';

export type SignalQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface HRVMetrics {
    rmssd: number;
    sdnn: number;
    stressIndex: number;
}

export interface AffectiveState {
    valence: number;
    arousal: number;
    dominance?: number;
    mood_label: 'anxious' | 'calm' | 'focused' | 'neutral' | 'distracted';
}

export interface VitalSigns {
    heartRate: number;
    respirationRate?: number;
    hrv?: HRVMetrics;
    affective?: AffectiveState;
    confidence: number;
    signalQuality: SignalQuality;
    snr: number;
    motionLevel: number;
}

// --- Active Inference Belief State ---

export type BeliefState = {
    arousal: number;          // 0.0 (Coma) -> 1.0 (Panic)
    attention: number;        // 0.0 (Dissociated) -> 1.0 (Hyper-focused)
    rhythm_alignment: number; // 0.0 (Arrhythmia) -> 1.0 (Resonance)
    valence: number;          // -1.0 to 1.0

    arousal_variance: number;
    attention_variance: number;
    rhythm_variance: number;

    prediction_error: number;
    innovation: number;
    mahalanobis_distance: number;
    confidence: number;
};

export type Observation = {
    timestamp: number;
    delta_time: number;
    user_interaction?: 'pause' | 'resume' | 'touch';
    visibilty_state: 'visible' | 'hidden';
    heart_rate?: number;
    hr_confidence?: number;
    respiration_rate?: number;
    stress_index?: number;
    facial_valence?: number;
};

// --- Kernel Event Types ---

export type KernelEvent =
    | { type: 'BOOT'; timestamp: number }
    | { type: 'LOAD_PROTOCOL'; patternId: BreathingType; timestamp: number }
    | { type: 'START_SESSION'; timestamp: number }
    | { type: 'TICK'; dt: number; observation: Observation; timestamp: number }
    | { type: 'BELIEF_UPDATE'; belief: BeliefState; timestamp: number }
    | { type: 'PHASE_TRANSITION'; from: BreathPhase; to: BreathPhase; timestamp: number }
    | { type: 'CYCLE_COMPLETE'; count: number; timestamp: number }
    | { type: 'INTERRUPTION'; kind: 'pause' | 'background'; timestamp: number }
    | { type: 'RESUME'; timestamp: number }
    | { type: 'HALT'; reason: string; timestamp: number }
    | { type: 'SAFETY_INTERDICTION'; riskLevel: number; action: string; timestamp: number }
    | { type: 'SYMPATHETIC_OVERRIDE'; fromPattern: string; toPattern: string; reason: string; timestamp: number }
    | { type: 'LOAD_SAFETY_REGISTRY'; registry: Record<string, SafetyProfile>; timestamp: number }
    | { type: 'ADJUST_TEMPO'; scale: number; reason: string; timestamp: number }
    | { type: 'AI_INTERVENTION'; intent: string; parameters: Record<string, unknown>; timestamp: number }
    | { type: 'AI_VOICE_MESSAGE'; text: string; sentiment: string; timestamp: number }
    | { type: 'AI_STATUS_CHANGE'; status: 'connecting' | 'connected' | 'thinking' | 'speaking' | 'disconnected'; timestamp: number };

// --- Safety Profile ---

export type SafetyProfile = {
    patternId: BreathingType;
    cummulative_stress_score: number;
    last_incident_timestamp: number;
    safety_lock_until: number;
    resonance_history: number[];
    resonance_score: number;
};

// --- User Settings ---

export type UserSettings = {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    hapticStrength: 'light' | 'medium' | 'heavy';
    theme: ColorTheme;
    quality: QualityTier;
    reduceMotion: boolean;
    showTimer: boolean;
    language: Language;
    soundPack: SoundPack;
    streak: number;
    lastBreathDate: string;
    lastUsedPattern: BreathingType;
    safetyRegistry: Record<string, SafetyProfile>;
    cameraVitalsEnabled: boolean;
    showKernelMonitor: boolean;
    aiCoachEnabled: boolean;
    apiKey?: string;
    developerMode?: boolean;
};

export type SessionHistoryItem = {
    id: string;
    timestamp: number;
    durationSec: number;
    patternId: BreathingType;
    cycles: number;
    finalBelief: BeliefState;
};

export type SessionStats = {
    durationSec: number;
    cyclesCompleted: number;
    patternId: BreathingType;
    timestamp: number;
};

export type BreathPattern = {
    id: BreathingType;
    label: string;
    tag: string;
    description: string;
    timings: Record<BreathPhase, number>;
    colorTheme: ColorTheme;
    recommendedCycles: number;
    tier: PatternTier;
    arousalImpact: number; // -1 (Sedative) to 1 (Stimulant)
};
