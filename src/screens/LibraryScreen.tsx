import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SampleCard from '../components/SampleCard';
import { colors, radius, spacing } from '../theme';
import { ClearanceStatus, Sample, STATUS_LABELS, STATUS_ORDER } from '../types';

interface Props {
  samples: Sample[];
  onOpenSample: (id: string) => void;
  onAdd: () => void;
}

type Filter = ClearanceStatus | 'all';

export default function LibraryScreen({ samples, onOpenSample, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samples
      .filter((s) => filter === 'all' || s.status === filter)
      .filter(
        (s) =>
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.source.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [samples, query, filter]);

  const filters: Filter[] = ['all', ...STATUS_ORDER];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.appTitle}>SampleSafe</Text>
          <Text style={styles.subtitle}>
            {samples.length} sample{samples.length === 1 ? '' : 's'} in your library
          </Text>
        </View>
        <Pressable onPress={onAdd} style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search title, source, or tag…"
        placeholderTextColor={colors.textFaint}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />

      <View style={styles.filterRow}>
        {filters.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f === 'all' ? 'All' : STATUS_LABELS[f]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SampleCard sample={item} onPress={() => onOpenSample(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {samples.length === 0 ? 'No samples yet' : 'Nothing matches'}
            </Text>
            <Text style={styles.emptyText}>
              {samples.length === 0
                ? 'Add your first sample to start tracking clearance.'
                : 'Try a different search or filter.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  appTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  addBtnPressed: {
    opacity: 0.8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.accent,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    gap: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
});
