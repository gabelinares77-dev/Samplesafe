import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sample } from './types';

const KEY = 'samplesafe.samples.v1';

export async function loadSamples(): Promise<Sample[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Sample[]) : [];
  } catch {
    return [];
  }
}

export async function saveSamples(samples: Sample[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(samples));
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
