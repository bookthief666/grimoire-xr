import { describe, expect, it } from 'vitest';
import { describeJobProgress, formatJobTiming } from './jobProgress.js';

describe('job progress presentation', () => {
  it('surfaces queue position and reconnect attempts', () => {
    expect(describeJobProgress({ status: 'queued', queuePosition: 3 })).toBe('QUEUED · POSITION 3');
    expect(describeJobProgress({ status: 'reconnecting', attempt: 2 })).toBe('RECONNECTING · ATTEMPT 2/5');
  });

  it('distinguishes preview, final, and refine work', () => {
    expect(describeJobProgress({ status: 'running' }, { mode: 'preview' })).toBe('SAMPLING PREVIEW IMAGE...');
    expect(describeJobProgress({ status: 'running' }, { mode: 'final' })).toBe('SAMPLING FINAL IMAGE...');
    expect(describeJobProgress({ status: 'running' }, { mode: 'refine' })).toBe('REFINING SOURCE IMAGE...');
  });

  it('formats elapsed timing compactly', () => {
    expect(formatJobTiming({ elapsedMs: 3_250 })).toBe('3.3s');
    expect(formatJobTiming({ elapsedMs: 18_000 })).toBe('18s');
    expect(formatJobTiming({ elapsedMs: 125_000 })).toBe('2m 5s');
    expect(formatJobTiming(null)).toBe('');
  });
});
