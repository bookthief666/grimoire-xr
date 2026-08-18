import {
  TAROT_QA_FIXTURE_IDS,
  buildTarotQaSnapshot,
} from '../src/tarotBridge/qaFixtures.js';

let failed = false;

console.log('0.35.1 canonical Tarot semantic QA');
console.log('==================================');

for (const fixtureId of TAROT_QA_FIXTURE_IDS) {
  const snapshot = buildTarotQaSnapshot(fixtureId);
  console.log(`\n${snapshot.pass ? 'PASS' : 'FAIL'} · ${fixtureId}`);
  console.log(`cards: ${snapshot.record.input.cardIds.join(' → ')}`);
  console.log(`immediate: ${snapshot.record.relations.map(relation => `${relation.relationType}${relation.reasonCode ? `/${relation.reasonCode}` : ''}`).join(' · ')}`);
  console.log(`outer: ${snapshot.outer?.relationType || 'MISSING'}${snapshot.outer?.reasonCode ? `/${snapshot.outer.reasonCode}` : ''}`);
  console.log(`center: ${snapshot.center?.applied ? snapshot.center.effectType : 'NOT_APPLIED'}`);
  console.log(`authority: ${snapshot.record.provenance.relationMethodAuthority}`);
  console.log(`sources: ${snapshot.record.provenance.sourceIds.join(' · ')}`);
  console.log(`signature: ${snapshot.semanticSignature}`);
  if (!snapshot.pass) {
    failed = true;
    console.error('failed checks:', Object.entries(snapshot.checks).filter(([, pass]) => !pass).map(([name]) => name).join(', '));
  }
}

if (failed) {
  console.error('\n0.35.1 canonical Tarot semantic QA: FAIL');
  process.exitCode = 1;
} else {
  console.log('\n0.35.1 canonical Tarot semantic QA: PASS');
}
