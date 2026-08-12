import { describe, expect, it } from 'vitest';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from './grimoireCatalog.js';

describe('shared Grimoire creative catalog', () => {
  it('exposes the complete original controls to XR', () => {
    expect(ART_STYLES.length).toBeGreaterThanOrEqual(50);
    expect(EROS_LEVELS.map(entry => entry.label)).toEqual([
      'OFF', 'SOFT', 'BOLD', 'ABYSS', 'LUST', 'BABALON',
    ]);
    expect(TECH_LEVELS.map(entry => entry.label)).toEqual(['NEOPHYTE', 'ADEPT', 'MAGUS']);
    expect(TRADITIONS.map(entry => entry.id)).toEqual(expect.arrayContaining([
      'thoth', 'rws', 'marseille', 'hermetic', 'shadow', 'enochian', 'chaos',
      'voudon', 'alchemical', 'bruno', 'astarte',
    ]));
  });
});
