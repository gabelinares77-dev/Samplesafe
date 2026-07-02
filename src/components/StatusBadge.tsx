import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { ClearanceStatus, STATUS_LABELS } from '../types';

const STATUS_COLORS: Record<ClearanceStatus, { fg: string; bg: string }> = {
  cleared: { fg: colors.cleared, bg: colors.clearedBg },
  pending: { fg: colors.pending, bg: colors.pendingBg },
  uncleared: { fg: colors.uncleared, bg: colors.unclearedBg },
  royalty_free: { fg: colors.royaltyFree, bg: colors.royaltyFreeBg },
};

export function statusColor(status: ClearanceStatus): string {
  return STATUS_COLORS[status].fg;
}

export default function StatusBadge({ status }: { status: ClearanceStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.label, { color: c.fg }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
