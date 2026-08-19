import { describe, expect, it } from 'vitest';
import { codexStyleSelectionSummary, filterCodexStyles, normalizeStyleQuery } from './codexStyleLibrary.js';

const styles = [
  { id: 'blake', name: 'William Blake', prompt: 'visionary illuminated print' },
  { id: 'manuscript', name: 'Illuminated Manuscript', prompt: 'medieval vellum gold leaf' },
  { id: 'thelemic', name: 'Thelemic / Crowley', prompt: 'ritual geometric occult painting' },
];

describe('0.47 Codex style library', () => {
  it('normalizes user search without mutating source vocabulary', () => {
    expect(normalizeStyleQuery('  BLAKE  ')).toBe('blake');
  });

  it('returns all styles for an empty query in original order', () => {
    expect(filterCodexStyles({ styles, query: '' })).toEqual(styles);
  });

  it('searches name, id and prompt fragments case-insensitively', () => {
    expect(filterCodexStyles({ styles, query: 'blake' }).map(style => style.id)).toEqual(['blake']);
    expect(filterCodexStyles({ styles, query: 'vellum' }).map(style => style.id)).toEqual(['manuscript']);
    expect(filterCodexStyles({ styles, query: 'ritual' }).map(style => style.id)).toEqual(['thelemic']);
  });

  it('fails closed to an empty result rather than silently selecting a style', () => {
    expect(filterCodexStyles({ styles, query: 'nonexistent current' })).toEqual([]);
  });

  it('reports the current selected style separately from catalog size', () => {
    expect(codexStyleSelectionSummary({ selectedStyle: styles[1], total: 51 })).toEqual({
      id: 'manuscript',
      name: 'Illuminated Manuscript',
      total: 51,
    });
  });
});
