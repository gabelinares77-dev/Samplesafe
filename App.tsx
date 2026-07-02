import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import EditSampleScreen, { SampleDraft } from './src/screens/EditSampleScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SampleDetailScreen from './src/screens/SampleDetailScreen';
import { seedSamples } from './src/seed';
import { loadSamples, makeId, saveSamples } from './src/storage';
import { colors } from './src/theme';
import { ClearanceStatus, Sample } from './src/types';

type Screen =
  | { name: 'library' }
  | { name: 'detail'; id: string }
  | { name: 'add' }
  | { name: 'edit'; id: string };

export default function App() {
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'library' });

  useEffect(() => {
    (async () => {
      const stored = await loadSamples();
      if (stored.length > 0) {
        setSamples(stored);
      } else {
        const seeded = seedSamples(Date.now());
        setSamples(seeded);
        await saveSamples(seeded);
      }
    })();
  }, []);

  const update = (next: Sample[]) => {
    setSamples(next);
    saveSamples(next);
  };

  const addSample = (draft: SampleDraft) => {
    if (!samples) return;
    const now = Date.now();
    const sample: Sample = { id: makeId(), ...draft, createdAt: now, updatedAt: now };
    update([sample, ...samples]);
    setScreen({ name: 'detail', id: sample.id });
  };

  const editSample = (id: string, draft: SampleDraft) => {
    if (!samples) return;
    update(
      samples.map((s) =>
        s.id === id ? { ...s, ...draft, updatedAt: Date.now() } : s,
      ),
    );
    setScreen({ name: 'detail', id });
  };

  const setStatus = (id: string, status: ClearanceStatus) => {
    if (!samples) return;
    update(
      samples.map((s) =>
        s.id === id ? { ...s, status, updatedAt: Date.now() } : s,
      ),
    );
  };

  const deleteSample = (id: string) => {
    if (!samples) return;
    update(samples.filter((s) => s.id !== id));
    setScreen({ name: 'library' });
  };

  const current =
    samples && (screen.name === 'detail' || screen.name === 'edit')
      ? samples.find((s) => s.id === screen.id)
      : undefined;

  let body: React.ReactNode;
  if (!samples) {
    body = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  } else if (screen.name === 'add') {
    body = (
      <EditSampleScreen
        onCancel={() => setScreen({ name: 'library' })}
        onSave={addSample}
      />
    );
  } else if (screen.name === 'edit' && current) {
    body = (
      <EditSampleScreen
        initial={current}
        onCancel={() => setScreen({ name: 'detail', id: current.id })}
        onSave={(draft) => editSample(current.id, draft)}
      />
    );
  } else if (screen.name === 'detail' && current) {
    body = (
      <SampleDetailScreen
        sample={current}
        onBack={() => setScreen({ name: 'library' })}
        onEdit={() => setScreen({ name: 'edit', id: current.id })}
        onDelete={() => deleteSample(current.id)}
        onSetStatus={(status) => setStatus(current.id, status)}
      />
    );
  } else {
    body = (
      <LibraryScreen
        samples={samples}
        onOpenSample={(id) => setScreen({ name: 'detail', id })}
        onAdd={() => setScreen({ name: 'add' })}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
