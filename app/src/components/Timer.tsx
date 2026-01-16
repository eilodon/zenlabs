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
        if (isRunning) {
            setSeconds(0);
            intervalRef.current = setInterval(() => {
                setSeconds((s) => {
                    const next = s + 1;
                    onTick?.(next);
                    return next;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, onTick]);

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
        paddingVertical: 8,
    },
    time: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '300',
        fontVariant: ['tabular-nums'],
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
});

export default React.memo(Timer);
