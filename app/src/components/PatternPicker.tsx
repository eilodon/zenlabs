/**
 * PatternPicker Component
 * Scrollable list of breathing patterns
 * 
 * REFACTORED: Uses PatternInfo from store (aligned with SDK types)
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import type { PatternInfo } from '../stores/zenoneStore';

interface PatternPickerProps {
    patterns: PatternInfo[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const PatternPicker: React.FC<PatternPickerProps> = ({
    patterns,
    selectedId,
    onSelect,
}) => {
    const renderPattern = ({ item }: { item: PatternInfo }) => {
        const isSelected = item.id === selectedId;

        // Format timing string, skipping zeros
        const timingParts: number[] = [];
        if (item.inhale_sec > 0) timingParts.push(item.inhale_sec);
        if (item.hold_in_sec > 0) timingParts.push(item.hold_in_sec);
        if (item.exhale_sec > 0) timingParts.push(item.exhale_sec);
        if (item.hold_out_sec > 0) timingParts.push(item.hold_out_sec);
        const timing = timingParts.join('-');

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selected]}
                onPress={() => onSelect(item.id)}
            >
                <Text style={[styles.label, isSelected && styles.selectedText]}>
                    {item.label}
                </Text>
                <Text style={[styles.tag, isSelected && styles.selectedSubtext]}>
                    {item.tag}
                </Text>
                <Text style={[styles.timing, isSelected && styles.selectedSubtext]}>
                    {timing}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={patterns}
            renderItem={renderPattern}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#2A2A3E',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 120,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        backgroundColor: '#4ECDC420',
        borderColor: '#4ECDC4',
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedText: {
        color: '#4ECDC4',
    },
    tag: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 4,
    },
    selectedSubtext: {
        color: '#4ECDC4aa',
    },
    timing: {
        color: '#666',
        fontSize: 10,
        marginTop: 8,
        fontFamily: 'monospace',
    },
});

export default PatternPicker;
