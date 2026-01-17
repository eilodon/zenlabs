/**
 * useCamera Hook - expo-camera integration for rPPG
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera } from 'expo-camera';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface CameraFrame {
    r: number;
    g: number;
    b: number;
    timestamp: number;
}

interface UseCameraOptions {
    enabled: boolean;
    onFrame?: (frame: CameraFrame) => void;
    frameRate?: number;
}

interface UseCameraReturn {
    hasPermission: boolean | null;
    requestPermission: () => Promise<boolean>;
    isActive: boolean;
    isFaceDetected: boolean;
}

// =============================================================================
// SIMULATED RGB EXTRACTION
// =============================================================================

function simulateRgbExtraction(): CameraFrame {
    const now = Date.now();
    const heartRateHz = 1.2;
    const heartSignal = Math.sin(2 * Math.PI * heartRateHz * (now / 1000));
    const baseG = 128;
    const amplitude = 5;

    return {
        r: baseG + heartSignal * amplitude * 0.3 + Math.random() * 2,
        g: baseG + heartSignal * amplitude + Math.random() * 2,
        b: baseG + heartSignal * amplitude * 0.2 + Math.random() * 2,
        timestamp: now * 1000,
    };
}

// =============================================================================
// HOOK
// =============================================================================

export function useCamera(options: UseCameraOptions): UseCameraReturn {
    const { enabled, onFrame, frameRate = 30 } = options;

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);

    const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const faceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            const granted = status === 'granted';
            setHasPermission(granted);
            return granted;
        } catch (error) {
            logger.error('Camera permission error:', error);
            setHasPermission(false);
            return false;
        }
    }, []);

    useEffect(() => {
        const checkPermission = async () => {
            const { status } = await Camera.getCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        checkPermission();
    }, []);

    useEffect(() => {
        if (!enabled || !hasPermission) {
            setIsActive(false);
            setIsFaceDetected(false);

            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
                frameIntervalRef.current = null;
            }
            if (faceTimeoutRef.current) {
                clearTimeout(faceTimeoutRef.current);
                faceTimeoutRef.current = null;
            }
            return;
        }

        setIsActive(true);

        const faceDelay = 1000 + Math.random() * 1000;
        faceTimeoutRef.current = setTimeout(() => {
            setIsFaceDetected(true);
        }, faceDelay);

        const interval = 1000 / frameRate;
        frameIntervalRef.current = setInterval(() => {
            const frame = simulateRgbExtraction();
            onFrame?.(frame);
        }, interval);

        return () => {
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
                frameIntervalRef.current = null;
            }
            if (faceTimeoutRef.current) {
                clearTimeout(faceTimeoutRef.current);
                faceTimeoutRef.current = null;
            }
        };
    }, [enabled, hasPermission, frameRate, onFrame]);

    return {
        hasPermission,
        requestPermission,
        isActive,
        isFaceDetected,
    };
}

export default useCamera;
