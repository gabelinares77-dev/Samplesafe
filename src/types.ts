export type ClearanceStatus = 'cleared' | 'pending' | 'uncleared' | 'royalty_free';

export interface Sample {
  id: string;
  title: string;
  /** Original artist / record / pack the sample comes from */
  source: string;
  bpm?: number;
  key?: string;
  tags: string[];
  status: ClearanceStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export const STATUS_LABELS: Record<ClearanceStatus, string> = {
  cleared: 'Cleared',
  pending: 'Pending',
  uncleared: 'Uncleared',
  royalty_free: 'Royalty-free',
};

export const STATUS_ORDER: ClearanceStatus[] = [
  'uncleared',
  'pending',
  'cleared',
  'royalty_free',
];
