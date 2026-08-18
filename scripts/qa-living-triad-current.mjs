import { buildTarotQaSnapshot } from '../src/tarotBridge/qaFixtures.js';
import {
  buildLivingTriadCurrentModel,
  nextLivingTriadRevealCount,
  nextLivingTriadStep,
  readingRecordSignature,
  visibleLivingTriadSteps,
} from '../src/tarotBridge/livingTriadCurrent.js';

const assert = (condition, label) => {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
};

const asReading = snapshot => ({
  readingRecord: snapshot.record,
  cards: snapshot.cards.map(card => ({ canonicalCardId: card.cardId, name: card.thothDisplayName })),
});

const three = buildTarotQaSnapshot('three-aces');
const threeBefore = readingRecordSignature(three.record);
const threeModel = buildLivingTriadCurrentModel({ reading: asReading(three) });

assert(threeModel.available, 'threeAcesAvailable');
assert(JSON.stringify(threeModel.steps.slice(0, 2).map(step => step.relationType)) === JSON.stringify(['FRIENDLY', 'FRIENDLY']), 'threeAcesImmediate');
assert(threeModel.steps[2]?.relationType === 'INIMICAL', 'threeAcesOuter');
assert(threeModel.steps[3]?.applied === true && threeModel.steps[3]?.effectType === 'CENTER_BETWEEN_CONTRARIES', 'threeAcesCenter');
assert(threeModel.relationMethodAuthority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE', 'methodAuthority');
assert(threeModel.presentationAuthority === 'PROJECT_AUTHORED_RELATION_TRACE_NOT_SOURCE_FACT', 'presentationBoundary');
assert(nextLivingTriadStep(threeModel, 0)?.stepId === 'immediate-1', 'traceStep1');
assert(nextLivingTriadStep(threeModel, 1)?.stepId === 'immediate-2', 'traceStep2');
assert(nextLivingTriadStep(threeModel, 2)?.stepId === 'outer-pair', 'traceStep3');
assert(nextLivingTriadStep(threeModel, 3)?.stepId === 'center-effect', 'traceStep4');
assert(nextLivingTriadRevealCount(threeModel, 4) === 0, 'sealAfterComplete');
assert(visibleLivingTriadSteps(threeModel, 4).length === 4, 'fourVisibleSteps');
assert(readingRecordSignature(three.record) === threeBefore, 'threeAcesRecordImmutable');

const gap = buildTarotQaSnapshot('major-gap');
const gapBefore = readingRecordSignature(gap.record);
const gapModel = buildLivingTriadCurrentModel({ reading: asReading(gap), reducedMotion: true });

assert(gapModel.available, 'majorGapAvailable');
assert(gapModel.steps[0]?.relationType === 'UNSPECIFIED' && gapModel.steps[0]?.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY', 'majorGapImmediate1');
assert(gapModel.steps[1]?.relationType === 'UNSPECIFIED' && gapModel.steps[1]?.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY', 'majorGapImmediate2');
assert(gapModel.steps[2]?.relationType === 'INIMICAL', 'majorGapOuter');
assert(gapModel.steps[3]?.effectType === 'CENTER_BETWEEN_CONTRARIES', 'majorGapCenter');
assert(gapModel.reducedMotion === true, 'reducedMotionSemanticParity');
assert(readingRecordSignature(gap.record) === gapBefore, 'majorGapRecordImmutable');

console.log('0.41 living triad current QA: PASS');
