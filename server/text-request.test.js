import { describe, expect, it } from 'vitest';
import { normalizeTextRequest, validateProviderTextResult } from './text-request.mjs';

describe('0.37 provider-neutral structured text requests', () => {
  it('preserves an explicit supported task', () => {
    expect(normalizeTextRequest({ prompt: '  Ritual prompt  ', isJson: true, task: 'ritual' })).toEqual({
      prompt: 'Ritual prompt',
      isJson: true,
      task: 'ritual',
    });
  });

  it('rejects unsupported explicit tasks rather than silently dropping them', () => {
    expect(() => normalizeTextRequest({ prompt: 'Prompt', task: 'mystery' })).toThrow(/unsupported structured text task/i);
  });

  it('retains conservative prompt inference for backward-compatible clients', () => {
    expect(normalizeTextRequest({
      prompt: 'Write a 200-word Thesis. Generate 3 profound questions.',
      isJson: true,
    }).task).toBe('ritual');
  });

  it('does not infer structured tasks for free-form text', () => {
    expect(normalizeTextRequest({ prompt: 'Reply profoundly.', isJson: false })).toEqual({
      prompt: 'Reply profoundly.',
      isJson: false,
      task: null,
    });
  });

  it('applies the same structured result validation after any provider returns JSON', () => {
    expect(validateProviderTextResult(
      { task: 'ritual', isJson: true },
      { dossier: 'Dossier', questions: ['One?', 'Two?', 'Three?'] },
    )).toEqual({ dossier: 'Dossier', questions: ['One?', 'Two?', 'Three?'] });

    expect(() => validateProviderTextResult(
      { task: 'ritual', isJson: true },
      { dossier: 'Dossier', cards: ['Invented identity'], questions: ['One?', 'Two?', 'Three?'] },
    )).toThrow(/must not author Tarot card identities/i);
  });
});
