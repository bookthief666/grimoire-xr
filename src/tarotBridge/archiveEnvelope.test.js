import { describe, expect, it } from 'vitest';
import {
  GRIMOIRE_ARCHIVE_SCHEMA_ID,
  archiveContractStatus,
  buildArchiveRestoreState,
  buildGrimoireArchiveEnvelope,
  parseGrimoireArchive,
  serializeGrimoireArchive,
  summarizeReadingProvenance,
} from './archiveEnvelope.js';
import { UPSTREAM_TAROT_CONTRACT, buildCanonicalTriadConsultation } from './canonicalTarotBridge.js';

const makeState = () => {
  const cards = [
    { id: 22, canonicalCardId: 'minor.staffs.ace', name: 'FIRST', imageUrl: null },
    { id: 50, canonicalCardId: 'minor.swords.ace', name: 'SECOND', imageUrl: null },
    { id: 36, canonicalCardId: 'minor.cups.ace', name: 'THIRD', imageUrl: null },
  ];
  const record = buildCanonicalTriadConsultation({
    readingId: 'archive-fixture',
    question: 'What relation is present?',
    legacyIndexes: [22, 50, 36],
    tradition: { id: 'thoth' },
  });
  return {
    author: 'Archive Adept',
    dossier: 'A test dossier.',
    selectedStyle: { id: 'pixel' },
    selectedTradition: { id: 'thoth' },
    erosLevel: 0,
    techLevel: 1,
    suggestedQuestions: ['What is moving?'],
    portrait: null,
    deck: cards,
    spiritChat: [{ role: 'ai', text: 'I am present.' }],
    activeSpread: 'TRIAD',
    spreadSlots: [22, 50, 36],
    reading: {
      cards,
      answer: 'Generated synthesis.',
      readingRecord: record,
      selectionSource: 'BOUND_TRIAD_CLOTH',
    },
  };
};

describe('0.36 ReadingRecord archive envelope', () => {
  it('persists generated prose and canonical ReadingRecord as separate authority layers', () => {
    const envelope = buildGrimoireArchiveEnvelope({ state: makeState(), exportedAt: '2026-08-18T00:00:00.000Z' });
    expect(envelope.schemaId).toBe(GRIMOIRE_ARCHIVE_SCHEMA_ID);
    expect(envelope.semanticContract).toEqual(UPSTREAM_TAROT_CONTRACT);
    expect(envelope.grimoire.reading.answer).toBe('Generated synthesis.');
    expect(envelope.grimoire.reading.answerAuthority).toBe('MODEL_GENERATED_SYNTHESIS');
    expect(envelope.grimoire.reading.readingRecord.input.cardIds).toEqual([
      'minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace',
    ]);
    expect(envelope.grimoire.reading.selectionSource).toBe('BOUND_TRIAD_CLOTH');
  });

  it('round-trips the exact canonical relation/provenance facts through JSON serialization', () => {
    const state = makeState();
    const text = serializeGrimoireArchive({ state, exportedAt: '2026-08-18T00:00:00.000Z' });
    const parsed = parseGrimoireArchive(text);
    expect(parsed.contractStatus).toBe('CURRENT_CONTRACT_MATCH');
    expect(parsed.migratedLegacy).toBe(false);
    const restored = parsed.envelope.grimoire.reading.readingRecord;
    expect(restored.relations.map(relation => relation.relationType)).toEqual(['FRIENDLY', 'FRIENDLY']);
    expect(restored.spreadPatterns[0].relationType).toBe('INIMICAL');
    expect(restored.provenance.relationMethodAuthority).toBe('SOURCE_QUALIFIED_METHOD_INHERITANCE');
  });

  it('flags a foreign semantic contract rather than silently blessing it as current', () => {
    const envelope = buildGrimoireArchiveEnvelope({ state: makeState() });
    envelope.semanticContract.commit = 'foreign-head';
    expect(archiveContractStatus(envelope.semanticContract)).toBe('ARCHIVED_CONTRACT_MISMATCH');
    expect(parseGrimoireArchive(envelope).contractStatus).toBe('ARCHIVED_CONTRACT_MISMATCH');
  });

  it('migrates a legacy state/deck-shaped archive without fabricating a contract pin', () => {
    const legacy = {
      state: {
        author: 'Legacy Adept',
        selectedStyle: { id: 'pixel' },
        selectedTradition: { id: 'thoth' },
        deck: [{ id: 0, name: 'OLD CARD' }],
      },
    };
    const parsed = parseGrimoireArchive(JSON.stringify(legacy));
    expect(parsed.migratedLegacy).toBe(true);
    expect(parsed.contractStatus).toBe('LEGACY_NO_CONTRACT_PIN');
    expect(parsed.envelope.grimoire.deck).toHaveLength(1);
  });

  it('rehydrates catalog object identity while preserving archived ReadingRecord', () => {
    const envelope = buildGrimoireArchiveEnvelope({ state: makeState() });
    const style = { id: 'pixel', name: '16-Bit Sovereign' };
    const tradition = { id: 'thoth', name: 'Book of Thoth' };
    const restored = buildArchiveRestoreState({ envelope, styles: [style], traditions: [tradition] });
    expect(restored.phase).toBe('SCRIPTORIUM');
    expect(restored.selectedStyle).toBe(style);
    expect(restored.selectedTradition).toBe(tradition);
    expect(restored.reading.readingRecord.readingId).toBe('archive-fixture');
    expect(restored.restoredArchiveContractStatus).toBe('CURRENT_CONTRACT_MATCH');
  });

  it('summarizes visible provenance without treating generated prose as canonical', () => {
    const reading = buildGrimoireArchiveEnvelope({ state: makeState() }).grimoire.reading;
    const summary = summarizeReadingProvenance(reading);
    expect(summary).toMatchObject({
      hasCanonicalRecord: true,
      contractStatus: 'CURRENT_CONTRACT_MATCH',
      relationMethod: 'crowley_lxxviii_dignities',
      relationMethodAuthority: 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
      selectionSource: 'BOUND_TRIAD_CLOTH',
    });
    expect(summary.sourceIds).toContain('src.primary.crowley.liber-lxxviii');
  });
});
