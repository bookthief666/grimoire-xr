import { describe, expect, it } from 'vitest';
import { buildVrHtmlArchive, deriveVrStats, parseVrArchive, safeArchiveName } from './vrArchive.js';

describe('Grimoire XR portable archive', () => {
  it('derives the original Grimoire statistics from XR records', () => {
    const stats = deriveVrStats({
      forgedDeck: [
        { name: 'First', patina: 2, imageUrl: 'data:image/png;base64,a', meta: { alchemical: 'Rubedo' } },
        { name: 'Second', patina: 5, meta: { alchemical: 'Nigredo' } },
        { name: 'Third', patina: 1, meta: { alchemical: 'Rubedo' } },
      ],
      spiritMessages: [{ text: 'Memory opens memory through desire.' }],
      archive: [{}, {}],
    });
    expect(stats.dominantCard.name).toBe('Second');
    expect(stats.dominantStage).toBe('RUBEDO');
    expect(stats.manifestedCount).toBe(1);
    expect(stats.echoes[0]).toEqual(['memory', 2]);
    expect(stats.operationCount).toBe(2);
  });

  it('builds a portable escaped HTML grimoire', () => {
    const html = buildVrHtmlArchive({
      subject: '<Babalon>',
      operationMode: 'provider-free-demo',
      ritual: { dossier: 'Living archive' },
      forgedDeck: [{ id: 0, name: 'The <Star>', exegesis: 'Sevenfold', meta: {} }],
      oracle: {},
      spiritMessages: [],
    });
    expect(html).toContain('&lt;Babalon&gt;');
    expect(html).toContain('The &lt;Star&gt;');
    expect(html).toContain('PROVIDER-FREE DETERMINISTIC REHEARSAL');
    expect(html).not.toContain('<Babalon>');
    expect(safeArchiveName('Astarte / Venus')).toBe('astarte-venus-xr-archive');
  });

  it('validates and sanitizes restorable JSON archives while preserving safe images', () => {
    const archive = parseVrArchive(JSON.stringify({
      format: 'grimoire-xr-archive-v1',
      subject: 'Astarte',
      operationMode: 'provider-free-demo',
      ritual: { dossier: 'Living memory', cards: [{ name: 'The Star of Astarte' }] },
      forgedDeck: [
        { id: 0, name: 'First', imageUrl: 'data:image/svg+xml,%3Csvg/%3E', patina: 3 },
        { id: 3, name: 'Burning Veil', meta: { hebrew: 'Men', planet: 'Sun', gematria: 44, element: 'Fire', alchemical: 'Rubedo' } },
        { id: 1, name: 'Second', imageUrl: 'javascript:alert(1)' },
        { id: 99, name: 'Outside the deck' },
      ],
      oracle: { spread: 'TRIAD', cards: [{ id: 0, name: 'First' }] },
      spiritMessages: [{ role: 'ai', text: 'A rehearsal voice.' }, { role: 'intruder', text: 'No.' }],
      completedCourtIds: ['scriptorium', 'not-a-court'],
    }));
    expect(archive.ritual.cards).toHaveLength(78);
    expect(archive.forgedDeck).toHaveLength(3);
    expect(archive.forgedDeck[0].imageUrl).toMatch(/^data:image\/svg\+xml/);
    expect(archive.forgedDeck[1].imageUrl).toBeNull();
    expect(archive.forgedDeck[2].meta).toMatchObject({
      inherited: 'THE EMPRESS · III',
      hebrew: 'DALETH (ד)',
      attribution: 'VENUS · PLANETARY TRUMP',
      gematria: 4,
      symbolicElement: 'FIRE',
      validation: 'INHERITED REFERENCE LOCKED',
    });
    expect(archive.spiritMessages).toHaveLength(1);
    expect(archive.completedCourtIds).toEqual(['scriptorium']);
  });

  it('rejects malformed and foreign archives with useful errors', () => {
    expect(() => parseVrArchive('{oops')).toThrow('not valid JSON');
    expect(() => parseVrArchive('{"format":"some-other-app"}')).toThrow('not a Grimoire XR archive');
  });
});
