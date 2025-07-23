import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.fabContent}>
        <ThemedText style={styles.fabEmoji}>🍺</ThemedText>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabEmoji: {
    fontSize: 16,
    marginBottom: -4,
  },
  fabText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 