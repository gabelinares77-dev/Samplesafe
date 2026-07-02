import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export default function TagChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '500',
  },
});
