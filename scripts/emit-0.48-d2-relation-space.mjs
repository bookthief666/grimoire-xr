import fs from 'node:fs';
import {
  CANONICAL_DIGNITY_KERNEL_VERSION,
  CANONICAL_LXXVIII_PACK_VERSION,
  UPSTREAM_TAROT_CONTRACT,
  buildCanonicalTriadConsultation,
} from '../src/tarotBridge/canonicalTarotBridge.js';
import { createSemanticConfig } from '../src/semantic/semanticConfig.js';

const SCHEMA_ID = 'grimoire.tarot.relation-conformance.d2';
const SCHEMA_VERSION = '1.0.0';
const ADJACENCY_CLAIM = 'claim.l78.dignity.adjacency';

const FAMILY_ORDER = Object.freeze(['major', 'staffs', 'cups', 'swords', 'coins']);
const REPRESENTATIVES = Object.freeze({
  major: Object.freeze([
    Object.freeze({ legacyIndex: 3, cardId: 'major.empress' }),
    Object.freeze({ legacyIndex: 4, cardId: 'major.emperor' }),
    Object.freeze({ legacyIndex: 5, cardId: 'major.hierophant' }),
  ]),
  staffs: Object.freeze([
    Object.freeze({ legacyIndex: 22, cardId: 'minor.staffs.ace' }),
    Object.freeze({ legacyIndex: 23, cardId: 'minor.staffs.two' }),
    Object.freeze({ legacyIndex: 24, cardId: 'minor.staffs.three' }),
  ]),
  cups: Object.freeze([
    Object.freeze({ legacyIndex: 36, cardId: 'minor.cups.ace' }),
    Object.freeze({ legacyIndex: 37, cardId: 'minor.cups.two' }),
    Object.freeze({ legacyIndex: 38, cardId: 'minor.cups.three' }),
  ]),
  swords: Object.freeze([
    Object.freeze({ legacyIndex: 50, cardId: 'minor.swords.ace' }),
    Object.freeze({ legacyIndex: 51, cardId: 'minor.swords.two' }),
    Object.freeze({ legacyIndex: 52, cardId: 'minor.swords.three' }),
  ]),
  coins: Object.freeze([
    Object.freeze({ legacyIndex: 64, cardId: 'minor.coins.ace' }),
    Object.freeze({ legacyIndex: 65, cardId: 'minor.coins.two' }),
    Object.freeze({ legacyIndex: 66, cardId: 'minor.coins.three' }),
  ]),
});
const OUTER_CENTER_FILLER = Object.freeze({ legacyIndex: 0, cardId: 'major.fool' });
const THOTH_CONFIG = createSemanticConfig({
  tarotSystem: 'thoth',
  correspondenceProfile: 'thoth_native',
  relationMethod: 'crowley_lxxviii_dignities',
  readingDepth: 'adept',
});

const sortedUnique = values => [...new Set((values || []).filter(Boolean))].sort();
const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, canonicalize(value[key])]),
  );
};

const representativesForPair = (leftFamily, rightFamily) => {
  const left = REPRESENTATIVES[leftFamily][0];
  const right = REPRESENTATIVES[rightFamily][leftFamily === rightFamily ? 1 : 0];
  return { left, right };
};

const representativesForTriad = families => {
  const seen = new Map();
  return families.map(family => {
    const occurrence = seen.get(family) || 0;
    seen.set(family, occurrence + 1);
    const representative = REPRESENTATIVES[family][occurrence];
    if (!representative) throw new Error(`Missing distinct D2 representative for ${family} occurrence ${occurrence + 1}`);
    return representative;
  });
};

const buildRecord = ({ id, representatives }) => buildCanonicalTriadConsultation({
  readingId: `d2:${id}`,
  question: '0.48 D2 exhaustive relation conformance',
  legacyIndexes: representatives.map(entry => entry.legacyIndex),
  semanticConfig: THOTH_CONFIG,
  readingDepth: 'adept',
});

const normalizePairFact = ({ context, leftFamily, rightFamily, leftCardId, rightCardId, fact }) => canonicalize({
  context,
  leftFamily,
  rightFamily,
  leftCardId,
  rightCardId,
  status: fact?.status || null,
  relationType: fact?.relationType || null,
  reasonCode: fact?.reasonCode || null,
  sourceIds: sortedUnique(fact?.sourceIds),
  claimIds: sortedUnique(fact?.claimIds),
  kernelVersion: fact?.kernelVersion || CANONICAL_DIGNITY_KERNEL_VERSION,
  sourcePackVersion: fact?.sourcePackVersion || CANONICAL_LXXVIII_PACK_VERSION,
});

const buildPairCase = ({ leftFamily, rightFamily, context }) => {
  const { left, right } = representativesForPair(leftFamily, rightFamily);
  if (context === 'IMMEDIATE_NEIGHBOR') {
    const record = buildRecord({
      id: `pair:immediate:${leftFamily}:${rightFamily}`,
      representatives: [left, right, OUTER_CENTER_FILLER],
    });
    return normalizePairFact({
      context,
      leftFamily,
      rightFamily,
      leftCardId: left.cardId,
      rightCardId: right.cardId,
      fact: record.relations[0],
    });
  }

  const record = buildRecord({
    id: `pair:outer:${leftFamily}:${rightFamily}`,
    representatives: [left, OUTER_CENTER_FILLER, right],
  });
  const outer = record.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT');
  return normalizePairFact({
    context,
    leftFamily,
    rightFamily,
    leftCardId: left.cardId,
    rightCardId: right.cardId,
    fact: outer,
  });
};

const normalizeRelation = relation => canonicalize({
  ordinal: relation.ordinal,
  semanticAuthority: relation.semanticAuthority || null,
  technicalRole: relation.technicalRole || null,
  status: relation.status || null,
  relationType: relation.relationType || null,
  reasonCode: relation.reasonCode || null,
  sourceIds: sortedUnique(relation.sourceIds),
  claimIds: sortedUnique(relation.claimIds),
  kernelVersion: relation.kernelVersion || null,
  sourcePackVersion: relation.sourcePackVersion || null,
});

const normalizePattern = pattern => canonicalize({
  patternKind: pattern.patternKind || null,
  semanticAuthority: pattern.semanticAuthority || null,
  applied: pattern.applied ?? null,
  status: pattern.status || null,
  relationType: pattern.relationType || null,
  reasonCode: pattern.reasonCode || null,
  effectType: pattern.effectType || null,
  effect: pattern.effect || null,
  sourceIds: sortedUnique(pattern.sourceIds),
  claimIds: sortedUnique(pattern.claimIds),
});

const buildTriadCase = families => {
  const representatives = representativesForTriad(families);
  const caseId = families.join('>');
  const record = buildRecord({ id: `triad:${caseId}`, representatives });
  const outer = record.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT');
  const center = record.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT');
  return canonicalize({
    caseId,
    families: [...families],
    cardIds: representatives.map(entry => entry.cardId),
    relations: record.relations.map(normalizeRelation),
    outerContext: normalizePattern(outer),
    centerContext: normalizePattern(center),
    provenance: {
      sourceIds: sortedUnique(record.provenance?.sourceIds),
      claimIds: sortedUnique(record.provenance?.claimIds),
      unresolvedReasonCodes: sortedUnique(record.provenance?.unresolvedReasonCodes),
      relationMethodAuthority: record.provenance?.relationMethodAuthority || null,
    },
  });
};

const buildPairCases = () => {
  const cases = [];
  for (const leftFamily of FAMILY_ORDER) {
    for (const rightFamily of FAMILY_ORDER) {
      cases.push(buildPairCase({ leftFamily, rightFamily, context: 'IMMEDIATE_NEIGHBOR' }));
      cases.push(buildPairCase({ leftFamily, rightFamily, context: 'OUTER_PAIR_CONTEXT' }));
    }
  }
  return cases;
};

const buildTriadCases = () => {
  const cases = [];
  for (const left of FAMILY_ORDER) {
    for (const center of FAMILY_ORDER) {
      for (const right of FAMILY_ORDER) cases.push(buildTriadCase([left, center, right]));
    }
  }
  return cases;
};

const findPair = (pairs, context, leftFamily, rightFamily) => pairs.find(entry => (
  entry.context === context && entry.leftFamily === leftFamily && entry.rightFamily === rightFamily
));

const validate = core => {
  const errors = [];
  if (core.pairCases.length !== 50) errors.push(`expected 50 pair/context cases, found ${core.pairCases.length}`);
  if (core.triadCases.length !== 125) errors.push(`expected 125 triad cases, found ${core.triadCases.length}`);
  if (new Set(core.triadCases.map(entry => entry.caseId)).size !== 125) errors.push('triad case IDs are not unique');

  const sameSuit = findPair(core.pairCases, 'IMMEDIATE_NEIGHBOR', 'staffs', 'staffs');
  if (sameSuit?.relationType !== 'SAME_SUIT_STRONG') errors.push('staffs/staffs must be SAME_SUIT_STRONG');
  if (!sameSuit?.claimIds.includes(ADJACENCY_CLAIM)) errors.push('immediate same-suit fact must carry adjacency claim');

  const inimical = findPair(core.pairCases, 'IMMEDIATE_NEIGHBOR', 'staffs', 'cups');
  if (inimical?.relationType !== 'INIMICAL') errors.push('staffs/cups must be INIMICAL');

  const sourceGap = findPair(core.pairCases, 'IMMEDIATE_NEIGHBOR', 'cups', 'coins');
  if (sourceGap?.relationType !== 'UNSPECIFIED' || sourceGap?.reasonCode !== 'SOURCE_DOES_NOT_SPECIFY_PAIR') {
    errors.push('cups/coins must remain source-UNSPECIFIED');
  }

  const majorGap = findPair(core.pairCases, 'IMMEDIATE_NEIGHBOR', 'major', 'staffs');
  if (majorGap?.relationType !== 'UNSPECIFIED' || majorGap?.reasonCode !== 'CARD_WITHOUT_SUIT_FAMILY') {
    errors.push('major/staffs must remain CARD_WITHOUT_SUIT_FAMILY');
  }

  const outerFriendly = findPair(core.pairCases, 'OUTER_PAIR_CONTEXT', 'staffs', 'swords');
  if (outerFriendly?.claimIds.includes(ADJACENCY_CLAIM)) errors.push('outer-pair context must never carry adjacency claim');

  const threeAcesFamily = core.triadCases.find(entry => entry.caseId === 'staffs>swords>cups');
  if (JSON.stringify(threeAcesFamily?.relations.map(entry => entry.relationType)) !== JSON.stringify(['FRIENDLY', 'FRIENDLY'])) {
    errors.push('staffs>swords>cups immediate relations drifted');
  }
  if (threeAcesFamily?.outerContext?.relationType !== 'INIMICAL' || threeAcesFamily?.centerContext?.effectType !== 'CENTER_BETWEEN_CONTRARIES') {
    errors.push('staffs>swords>cups contextual relation drifted');
  }

  const majorCenter = core.triadCases.find(entry => entry.caseId === 'staffs>major>cups');
  if (JSON.stringify(majorCenter?.relations.map(entry => entry.reasonCode)) !== JSON.stringify(['CARD_WITHOUT_SUIT_FAMILY', 'CARD_WITHOUT_SUIT_FAMILY'])) {
    errors.push('staffs>major>cups Major gap drifted');
  }
  if (majorCenter?.outerContext?.relationType !== 'INIMICAL' || majorCenter?.centerContext?.effectType !== 'CENTER_BETWEEN_CONTRARIES') {
    errors.push('staffs>major>cups outer/center context drifted');
  }

  return errors;
};

const relationCore = canonicalize({
  familyOrder: [...FAMILY_ORDER],
  pairCases: buildPairCases(),
  triadCases: buildTriadCases(),
});
const errors = validate(relationCore);
if (errors.length) {
  console.error(`0.48 D2 Fold relation-space QA: FAIL (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

const snapshot = canonicalize({
  schemaId: SCHEMA_ID,
  schemaVersion: SCHEMA_VERSION,
  contract: {
    contractId: UPSTREAM_TAROT_CONTRACT.contractId,
    contractVersion: UPSTREAM_TAROT_CONTRACT.contractVersion,
    authorityCommit: UPSTREAM_TAROT_CONTRACT.commit,
  },
  producer: 'grimoire-fold-2d',
  relationCore,
});

const outIndex = process.argv.indexOf('--out');
const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;
if (outIndex >= 0 && !outPath) {
  console.error('--out requires a file path');
  process.exit(2);
}
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
if (outPath) {
  fs.writeFileSync(outPath, serialized);
  console.log(`0.48 D2 Fold relation-space QA: PASS (50 pair/context + 125 triad cases)`);
  console.log(`0.48 D2 Fold relation snapshot written: ${outPath}`);
} else {
  process.stdout.write(serialized);
}
