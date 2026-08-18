import { describe, expect, it } from 'vitest';
import { generateGrimoireHtmlDocument } from './archiveHtml.js';
import { buildCanonicalTriadConsultation } from './canonicalTarotBridge.js';

const stateWithReading = () => {
  const cards = [
    { id: 22, canonicalCardId: 'minor.staffs.ace', name: 'FIRST', exegesis: 'Fire.', meta: { daimon: 'A' } },
    { id: 50, canonicalCardId: 'minor.swords.ace', name: 'SECOND', exegesis: 'Air.', meta: { daimon: 'B' } },
    { id: 36, canonicalCardId: 'minor.cups.ace', name: 'THIRD', exegesis: 'Water.', meta: { daimon: 'C' } },
  ];
  return {
    author: '<Archive Adept>',
    dossier: 'Dossier & thesis',
    selectedStyle: { id: 'pixel' },
    selectedTradition: { id: 'thoth' },
    erosLevel: 0,
    techLevel: 1,
    suggestedQuestions: [],
    portrait: null,
    deck: cards,
    spiritChat: [],
    activeSpread: 'TRIAD',
    spreadSlots: [22, 50, 36],
    reading: {
      cards,
      answer: 'A generated <synthesis>.',
      selectionSource: 'BOUND_TRIAD_CLOTH',
      readingRecord: buildCanonicalTriadConsultation({
        readingId: 'html-fixture',
        question: 'What relation is present?',
        legacyIndexes: [22, 50, 36],
        tradition: { id: 'thoth' },
      }),
    },
  };
};

describe('0.36 human-readable archive', () => {
  it('renders generated prose separately from canonical semantic provenance', () => {
    const html = generateGrimoireHtmlDocument(stateWithReading());
    expect(html).toContain('A generated &lt;synthesis&gt;.');
    expect(html).toContain('Generated prose authority: MODEL_GENERATED_SYNTHESIS');
    expect(html).toContain('crowley_lxxviii_dignities');
    expect(html).toContain('SOURCE_QUALIFIED_METHOD_INHERITANCE');
    expect(html).toContain('minor.staffs.ace → minor.swords.ace');
    expect(html).toContain('<strong>FRIENDLY</strong>');
    expect(html).toContain('src.primary.crowley.liber-lxxviii');
  });

  it('escapes user/generated HTML while embedding a structured archive envelope', () => {
    const html = generateGrimoireHtmlDocument(stateWithReading());
    expect(html).toContain('&lt;Archive Adept&gt;');
    expect(html).not.toContain('<synthesis>');
    expect(html).toContain('id="grimoire-archive-data"');
    expect(html).toContain('grimoire.xr.archive');
    expect(html).toContain('grimoire.tarot.semantic.v1');
  });
});
