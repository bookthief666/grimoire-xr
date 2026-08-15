import { describe, expect, it } from 'vitest';
import {
  QA_RUN_SCHEMA_VERSION,
  createRunManifest,
  isRunComplete,
  markRunComplete,
  markStageComplete,
  nextIncompleteStage,
} from './qaRunState.mjs';

describe('local AI QA run state', () => {
  it('starts at preview and advances deterministically', () => {
    const base = createRunManifest({
      baseUrl: 'http://127.0.0.1:8787',
      seed: 424242,
      prompt: 'tarot',
      health: { api: { protocolVersion: 1 } },
      createdAt: '2026-08-15T00:00:00.000Z',
    });

    expect(base.schemaVersion).toBe(QA_RUN_SCHEMA_VERSION);
    expect(nextIncompleteStage(base)).toBe('preview');

    const preview = markStageComplete(base, 'preview', { mode: 'preview' }, '2026-08-15T00:01:00.000Z');
    expect(nextIncompleteStage(preview)).toBe('final');

    const final = markStageComplete(preview, 'final', { mode: 'final' }, '2026-08-15T00:02:00.000Z');
    expect(nextIncompleteStage(final)).toBe('refine');

    const refine = markStageComplete(final, 'refine', { mode: 'refine' }, '2026-08-15T00:03:00.000Z');
    expect(nextIncompleteStage(refine)).toBe(null);
    expect(isRunComplete(refine)).toBe(false);

    expect(isRunComplete(markRunComplete(refine))).toBe(true);
  });

  it('rejects unknown stages', () => {
    const manifest = createRunManifest({ baseUrl: 'x', seed: 1, prompt: 'y', health: {} });
    expect(() => markStageComplete(manifest, 'upscale', {})).toThrow('Unknown QA stage');
  });
});
