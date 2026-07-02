import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Sample } from '../types';
import StatusBadge from './StatusBadge';
import TagChip from './TagChip';

interface Props {
  sample: Sample;
  onPress: () => void;
}

export default function SampleCard({ sample, onPress }: Props) {
  const meta = [
    sample.bpm ? `${sample.bpm} BPM` : null,
    sample.key || null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {sample.title}
        </Text>
        <StatusBadge status={sample.status} />
      </View>
      <Text style={styles.source} numberOfLines={1}>
        {sample.source}
      </Text>
      {(meta.length > 0 || sample.tags.length > 0) && (
        <View style={styles.footer}>
          {meta.length > 0 && <Text style={styles.meta}>{meta.join(' · ')}</Text>}
          <View style={styles.tags}>
            {sample.tags.slice(0, 3).map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  pressed: {
    backgroundColor: colors.surfaceHigh,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  source: {
    color: colors.textDim,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  meta: {
    color: colors.textFaint,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
  },
});
