/**
 * PatternPicker Component
 * Scrollable list of breathing patterns
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

export interface PatternInfo {
    id: string;
    label: string;
    tag: string;
    description: string;
    inhale_sec: number;
    hold_in_sec: number;
    exhale_sec: number;
    hold_out_sec: number;
}

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
        const timing = `${item.inhale_sec}-${item.hold_in_sec}-${item.exhale_sec}-${item.hold_out_sec}`;

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selected]}
                onPress={() => onSelect(item.id)}
            >
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.tag}>{item.tag}</Text>
                <Text style={styles.timing}>{timing}</Text>
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
    },
    selected: {
        backgroundColor: '#4ECDC4',
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tag: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 4,
    },
    timing: {
        color: '#888',
        fontSize: 10,
        marginTop: 8,
    },
});

export default PatternPicker;
