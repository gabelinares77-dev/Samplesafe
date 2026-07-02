import { Sample } from './types';

/** Starter samples shown on first launch so the app isn't empty. */
export function seedSamples(now: number): Sample[] {
  const mk = (s: Omit<Sample, 'createdAt' | 'updatedAt'>, offset: number): Sample => ({
    ...s,
    createdAt: now - offset,
    updatedAt: now - offset,
  });
  return [
    mk(
      {
        id: 'seed-1',
        title: 'Rhodes loop (verse)',
        source: 'Marvin Gaye — Distant Lover (live)',
        bpm: 82,
        key: 'Ebm',
        tags: ['soul', 'keys', 'loop'],
        status: 'uncleared',
        notes: 'Chopped 4-bar loop. Need to contact publisher before release.',
      },
      3 * 86400_000,
    ),
    mk(
      {
        id: 'seed-2',
        title: 'Vocal chop "yeah"',
        source: 'Splice — RnB Vocal Pack Vol. 3',
        bpm: 140,
        key: 'Am',
        tags: ['vocal', 'one-shot'],
        status: 'royalty_free',
        notes: 'Covered by Splice subscription license.',
      },
      2 * 86400_000,
    ),
    mk(
      {
        id: 'seed-3',
        title: 'Breakbeat 94bpm',
        source: 'The Winstons — Amen, Brother',
        bpm: 94,
        tags: ['drums', 'break'],
        status: 'pending',
        notes: 'Clearance request sent 6/12 via sample clearance service.',
      },
      86400_000,
    ),
  ];
}
