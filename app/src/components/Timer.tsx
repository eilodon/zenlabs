/**
 * Timer Display Component
 * Shows session duration
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
    isRunning: boolean;
    onTick?: (seconds: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onTick }) => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isRunning) {
            // Only reset if we are starting fresh? 
            // Actually, if we just toggle isRunning, resetting is correct behavior for a new session.
            // But if onTick changes, we DO NOT want to reset.
            // setSeconds(0) should be outside the effect or guarded.
            // Better: split the reset logic.
        }

        // This effect ONLY handles the interval
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((s) => {
                    const next = s + 1;
                    onTick?.(next);
                    return next;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, onTick]);

    // Separate effect for resetting when starting
    useEffect(() => {
        if (isRunning) {
            setSeconds(0);
        }
    }, [isRunning]);

    const formatTime = (sec: number) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.time}>{formatTime(seconds)}</Text>
            <Text style={styles.label}>Session Time</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    time: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '300',
        fontVariant: ['tabular-nums'],
        letterSpacing: 1,
    },
    label: {
        color: '#999',
        fontSize: 11,
        marginTop: 4,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
});

export default React.memo(Timer);
