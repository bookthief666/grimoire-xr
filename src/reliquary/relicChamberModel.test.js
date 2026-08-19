import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis } from '../tarotBridge/canonicalDeckGenesis.js';
import { buildRelicChamberModel, RELIC_CHAMBER_AUTHORITY } from './relicChamberModel.js';

describe('relic chamber presentation', () => {
  it('uses source-qualified correspondences and project-authored history separately', () => {
    const card = { ...buildCanonicalDeckGenesis({ tradition: 'thoth' })[23], patina: 12 };
    const model = buildRelicChamberModel({ card, tradition: 'thoth' });
    expect(model.authority).toBe(RELIC_CHAMBER_AUTHORITY);
    expect(model.cardId).toBe('minor.staffs.two');
    expect(model.historyStage).toBe('WEATHERED');
    expect(model.patina).toBe(12);
    expect(model.sourceQualified).toBe(true);
    expect(model.inscriptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'ELEMENT', value: 'FIRE' }),
      expect.objectContaining({ label: 'PLANET', value: 'MARS' }),
      expect.objectContaining({ label: 'SIGN', value: 'ARIES' }),
    ]));
  });

  it('does not manufacture canonical inscriptions for a pending source pack', () => {
    const card = { ...buildCanonicalDeckGenesis({ tradition: 'rws' })[23], patina: 3 };
    const model = buildRelicChamberModel({ card, tradition: 'rws' });
    expect(model.historyStage).toBe('AWAKENED');
    expect(model.sourceQualified).toBe(false);
    expect(model.inscriptions).toEqual([]);
  });
});
