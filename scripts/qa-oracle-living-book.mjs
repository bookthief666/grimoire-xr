import { buildTarotQaSnapshot } from '../src/tarotBridge/qaFixtures.js';
import { buildOracleBookPresentation } from '../src/tarotBridge/oracleBookPresentation.js';

const makeReading = fixtureId => {
  const snapshot = buildTarotQaSnapshot(fixtureId);
  return {
    cards: snapshot.cards.map(card => ({
      id: card.legacyIndex,
      canonicalCardId: card.cardId,
      name: card.thothDisplayName,
      imageUrl: null,
    })),
    answer: 'Generated QA synthesis.',
    readingRecord: snapshot.record,
    selectionSource: 'BOUND_TRIAD_CLOTH',
  };
};

const three = makeReading('three-aces');
const threeBefore = JSON.stringify(three.readingRecord);
const threeView = buildOracleBookPresentation(three);
const majorView = buildOracleBookPresentation(makeReading('major-gap'));

const checks = {
  readingRecordImmutable: JSON.stringify(three.readingRecord) === threeBefore,
  namedPositions: threeView.positions.map(p => p.label).join('|') === 'THESIS|ANTITHESIS|SYNTHESIS',
  friendlyProse: threeView.relations.every(r => r.heading === 'Mutual strengthening'),
  outerContrary: threeView.outerContext?.heading === 'Contrary relation',
  centerContraries: threeView.centerContext?.heading === 'The center between contraries',
  humanSources: threeView.provenance.sources.some(source => source.label.includes('Liber LXXVIII')),
  technicalRecordRetained: threeView.provenance.technical.relationMethodAuthority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
  copyableReading: threeView.copyText.includes('READING') && threeView.copyText.includes('SOURCES'),
  majorGapHonest: majorView.relations.every(r => r.raw.relationType === 'UNSPECIFIED' && r.body.includes('no canonical suit family')),
};

for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
if (Object.values(checks).some(pass => !pass)) process.exitCode = 1;
else console.log('0.42 Living Book Oracle QA: PASS');
