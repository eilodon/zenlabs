//! ZenOne FFI Bridge
//!
//! This crate exposes the ZenOne Rust core to mobile platforms via UniFFI.

use zenb_core::{
    breath_patterns::{builtin_patterns, BreathPattern, PatternTimings, ColorTheme, PatternTier},
    phase_machine::{Phase, PhaseMachine, PhaseDurations},
};
use zenb_signals::rppg::EnsembleProcessor;
use std::sync::Mutex;
use std::time::Instant;

uniffi::include_scaffolding!("zenone");

// ============================================================================
// FFI-SAFE TYPES
// ============================================================================

/// Breathing pattern info (FFI-safe)
#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiBreathPattern {
    pub id: String,
    pub label: String,
    pub tag: String,
    pub description: String,
    pub inhale_sec: f32,
    pub hold_in_sec: f32,
    pub exhale_sec: f32,
    pub hold_out_sec: f32,
    pub recommended_cycles: u32,
    pub arousal_impact: f32,
}

impl From<&BreathPattern> for FfiBreathPattern {
    fn from(p: &BreathPattern) -> Self {
        FfiBreathPattern {
            id: p.id.clone(),
            label: p.label.clone(),
            tag: p.tag.clone(),
            description: p.description.clone(),
            inhale_sec: p.timings.inhale,
            hold_in_sec: p.timings.hold_in,
            exhale_sec: p.timings.exhale,
            hold_out_sec: p.timings.hold_out,
            recommended_cycles: p.recommended_cycles,
            arousal_impact: p.arousal_impact,
        }
    }
}

/// Current phase (FFI-safe enum)
#[derive(Debug, Clone, Copy, PartialEq, Eq, uniffi::Enum)]
pub enum FfiPhase {
    Inhale,
    HoldIn,
    Exhale,
    HoldOut,
}

impl From<Phase> for FfiPhase {
    fn from(p: Phase) -> Self {
        match p {
            Phase::Inhale => FfiPhase::Inhale,
            Phase::HoldIn => FfiPhase::HoldIn,
            Phase::Exhale => FfiPhase::Exhale,
            Phase::HoldOut => FfiPhase::HoldOut,
        }
    }
}

/// Frame result from process_frame
#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiFrame {
    pub phase: FfiPhase,
    pub phase_progress: f32,
    pub cycles_completed: u64,
    pub heart_rate: Option<f32>,
    pub signal_quality: f32,
}

/// Session statistics
#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiSessionStats {
    pub duration_sec: f32,
    pub cycles_completed: u64,
    pub pattern_id: String,
    pub avg_heart_rate: Option<f32>,
}

// ============================================================================
// RUNTIME
// ============================================================================

/// ZenOne Runtime - Main API for native apps
#[derive(uniffi::Object)]
pub struct ZenOneRuntime {
    inner: Mutex<RuntimeInner>,
}

struct RuntimeInner {
    phase_machine: PhaseMachine,
    processor: EnsembleProcessor,
    current_pattern_id: String,
    session: Option<SessionState>,
    last_timestamp_us: i64,
}

struct SessionState {
    start_time: Instant,
    pattern_id: String,
    hr_samples: Vec<f32>,
}

#[uniffi::export]
impl ZenOneRuntime {
    /// Create a new runtime with default pattern (4-7-8)
    #[uniffi::constructor]
    pub fn new() -> Self {
        Self::with_pattern("4-7-8".to_string())
    }
    
    /// Create with specific pattern
    #[uniffi::constructor]
    pub fn with_pattern(pattern_id: String) -> Self {
        let patterns = builtin_patterns();
        let pattern = patterns.get(&pattern_id)
            .or_else(|| patterns.get("4-7-8"))
            .unwrap();
        
        let durations = pattern.to_phase_durations();
        
        ZenOneRuntime {
            inner: Mutex::new(RuntimeInner {
                phase_machine: PhaseMachine::new(durations),
                processor: EnsembleProcessor::new(),
                current_pattern_id: pattern_id,
                session: None,
                last_timestamp_us: 0,
            }),
        }
    }
    
    /// Get all available patterns
    pub fn get_patterns(&self) -> Vec<FfiBreathPattern> {
        builtin_patterns()
            .values()
            .map(|p| FfiBreathPattern::from(p))
            .collect()
    }
    
    /// Load a pattern by ID
    pub fn load_pattern(&self, pattern_id: String) -> bool {
        let patterns = builtin_patterns();
        if let Some(pattern) = patterns.get(&pattern_id) {
            let mut inner = self.inner.lock().unwrap();
            inner.phase_machine = PhaseMachine::new(pattern.to_phase_durations());
            inner.current_pattern_id = pattern_id;
            true
        } else {
            false
        }
    }
    
    /// Process a camera frame (RGB mean values)
    pub fn process_frame(&self, r: f32, g: f32, b: f32, timestamp_us: i64) -> FfiFrame {
        let mut inner = self.inner.lock().unwrap();
        
        // Calculate delta time
        let dt_us = if inner.last_timestamp_us > 0 {
            (timestamp_us - inner.last_timestamp_us).max(0) as u64
        } else {
            33_333 // ~30fps
        };
        inner.last_timestamp_us = timestamp_us;
        
        // rPPG processing
        inner.processor.add_sample(r, g, b);
        let ppg_result = inner.processor.process();
        
        // Update phase machine
        let (_transitions, _cycles) = inner.phase_machine.tick(dt_us);
        
        // Track HR for session
        if let Some(ref mut session) = inner.session {
            if let Some(ref result) = ppg_result {
                session.hr_samples.push(result.bpm);
            }
        }
        
        FfiFrame {
            phase: FfiPhase::from(inner.phase_machine.phase),
            phase_progress: inner.phase_machine.cycle_phase_norm(),
            cycles_completed: inner.phase_machine.cycle_index,
            heart_rate: ppg_result.as_ref().map(|r| r.bpm),
            signal_quality: ppg_result.as_ref().map(|r| r.confidence).unwrap_or(0.0),
        }
    }
    
    /// Start a breathing session
    pub fn start_session(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.session = Some(SessionState {
            start_time: Instant::now(),
            pattern_id: inner.current_pattern_id.clone(),
            hr_samples: Vec::new(),
        });
    }
    
    /// Stop session and get stats
    pub fn stop_session(&self) -> FfiSessionStats {
        let mut inner = self.inner.lock().unwrap();
        
        if let Some(session) = inner.session.take() {
            let duration = session.start_time.elapsed();
            let avg_hr = if !session.hr_samples.is_empty() {
                Some(session.hr_samples.iter().sum::<f32>() / session.hr_samples.len() as f32)
            } else {
                None
            };
            
            FfiSessionStats {
                duration_sec: duration.as_secs_f32(),
                cycles_completed: inner.phase_machine.cycle_index,
                pattern_id: session.pattern_id,
                avg_heart_rate: avg_hr,
            }
        } else {
            FfiSessionStats {
                duration_sec: 0.0,
                cycles_completed: 0,
                pattern_id: String::new(),
                avg_heart_rate: None,
            }
        }
    }
    
    /// Check if session is active
    pub fn is_session_active(&self) -> bool {
        self.inner.lock().unwrap().session.is_some()
    }
    
    /// Get current pattern ID
    pub fn current_pattern_id(&self) -> String {
        self.inner.lock().unwrap().current_pattern_id.clone()
    }
}
