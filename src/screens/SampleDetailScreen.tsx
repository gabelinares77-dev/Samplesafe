import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusBadge from '../components/StatusBadge';
import TagChip from '../components/TagChip';
import { colors, radius, spacing } from '../theme';
import { ClearanceStatus, Sample, STATUS_LABELS, STATUS_ORDER } from '../types';

interface Props {
  sample: Sample;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetStatus: (status: ClearanceStatus) => void;
}

export default function SampleDetailScreen({
  sample,
  onBack,
  onEdit,
  onDelete,
  onSetStatus,
}: Props) {
  const confirmDelete = () => {
    Alert.alert('Delete sample', `Remove “${sample.title}” from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.navLink}>‹ Library</Text>
        </Pressable>
        <Pressable onPress={onEdit} hitSlop={12}>
          <Text style={styles.navLink}>Edit</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{sample.title}</Text>
      <Text style={styles.source}>{sample.source}</Text>
      <StatusBadge status={sample.status} />

      {(sample.bpm || sample.key) && (
        <View style={styles.metaRow}>
          {sample.bpm ? (
            <View style={styles.metaBox}>
              <Text style={styles.metaValue}>{sample.bpm}</Text>
              <Text style={styles.metaLabel}>BPM</Text>
            </View>
          ) : null}
          {sample.key ? (
            <View style={styles.metaBox}>
              <Text style={styles.metaValue}>{sample.key}</Text>
              <Text style={styles.metaLabel}>Key</Text>
            </View>
          ) : null}
        </View>
      )}

      {sample.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {sample.tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clearance status</Text>
        <View style={styles.statusRow}>
          {STATUS_ORDER.map((s) => {
            const active = sample.status === s;
            return (
              <Pressable
                key={s}
                onPress={() => onSetStatus(s)}
                style={[styles.statusChip, active && styles.statusChipActive]}
              >
                <Text style={[styles.statusText, active && styles.statusTextActive]}>
                  {STATUS_LABELS[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {sample.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{sample.notes}</Text>
        </View>
      ) : null}

      <Text style={styles.dates}>
        Added {new Date(sample.createdAt).toLocaleDateString()} · Updated{' '}
        {new Date(sample.updatedAt).toLocaleDateString()}
      </Text>

      <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}>
        <Text style={styles.deleteText}>Delete sample</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navLink: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  source: {
    color: colors.textDim,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  metaValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metaLabel: {
    color: colors.textFaint,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  statusText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextActive: {
    color: colors.accent,
  },
  notes: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  dates: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: spacing.md,
  },
  deleteBtn: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.uncleared,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: colors.uncleared,
    fontSize: 15,
    fontWeight: '600',
  },
});
