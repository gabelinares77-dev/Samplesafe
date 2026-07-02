import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { ClearanceStatus, Sample, STATUS_LABELS, STATUS_ORDER } from '../types';

export interface SampleDraft {
  title: string;
  source: string;
  bpm?: number;
  key?: string;
  tags: string[];
  status: ClearanceStatus;
  notes: string;
}

interface Props {
  /** Existing sample when editing, undefined when adding. */
  initial?: Sample;
  onCancel: () => void;
  onSave: (draft: SampleDraft) => void;
}

export default function EditSampleScreen({ initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [bpm, setBpm] = useState(initial?.bpm ? String(initial.bpm) : '');
  const [key, setKey] = useState(initial?.key ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [status, setStatus] = useState<ClearanceStatus>(initial?.status ?? 'uncleared');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const bpmNum = parseInt(bpm, 10);
    onSave({
      title: title.trim(),
      source: source.trim(),
      bpm: Number.isFinite(bpmNum) && bpmNum > 0 ? bpmNum : undefined,
      key: key.trim() || undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      status,
      notes: notes.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.navRow}>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.navLink}>Cancel</Text>
        </Pressable>
        <Text style={styles.navTitle}>{initial ? 'Edit sample' : 'New sample'}</Text>
        <Pressable onPress={save} hitSlop={12} disabled={!canSave}>
          <Text style={[styles.navLink, styles.saveLink, !canSave && styles.disabled]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Title *">
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Rhodes loop (verse)"
            placeholderTextColor={colors.textFaint}
          />
        </Field>

        <Field label="Source">
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="Original artist, record, or pack"
            placeholderTextColor={colors.textFaint}
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="BPM">
              <TextInput
                style={styles.input}
                value={bpm}
                onChangeText={setBpm}
                placeholder="120"
                placeholderTextColor={colors.textFaint}
                keyboardType="number-pad"
                maxLength={3}
              />
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="Key">
              <TextInput
                style={styles.input}
                value={key}
                onChangeText={setKey}
                placeholder="Am"
                placeholderTextColor={colors.textFaint}
                autoCapitalize="characters"
                maxLength={6}
              />
            </Field>
          </View>
        </View>

        <Field label="Tags (comma-separated)">
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="soul, keys, loop"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Clearance status">
          <View style={styles.statusRow}>
            {STATUS_ORDER.map((s) => {
              const active = status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.statusChip, active && styles.statusChipActive]}
                >
                  <Text style={[styles.statusText, active && styles.statusTextActive]}>
                    {STATUS_LABELS[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Notes">
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Clearance contacts, usage, deadlines…"
            placeholderTextColor={colors.textFaint}
            multiline
          />
        </Field>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navLink: {
    color: colors.textDim,
    fontSize: 16,
  },
  saveLink: {
    color: colors.accent,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
  navTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
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
});
