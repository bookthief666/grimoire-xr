import fs from 'node:fs';

const authorityPath = process.argv[2];
if (!authorityPath) {
  console.error('Usage: node scripts/apply-0.48-d3-relation-authority.mjs <vr-d3-relation-authority.json>');
  process.exit(2);
}

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const generatedPath = 'src/tarotBridge/authoritativeRelationAuthority.generated.js';
const PIN = Object.freeze({
  contractId: 'grimoire.tarot.semantic.v1',
  contractVersion: '1.0.0',
  authorityRepository: 'bookthief666/tarot-archetype-vr',
  authorityCommit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
});
const fail = message => { throw new Error(`0.48 D3 relation-authority activation refused: ${message}`); };
const sortedUnique = values => [...new Set((values || []).filter(Boolean))].sort();
const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
};
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

const snapshot = JSON.parse(fs.readFileSync(authorityPath, 'utf8'));
if (snapshot.schemaId !== 'grimoire.tarot.relation-authority.d3' || snapshot.schemaVersion !== '1.0.0') fail('unexpected D3 authority schema');
for (const [key, value] of Object.entries(PIN)) {
  if (snapshot.contract?.[key] !== value) fail(`authority contract ${key} mismatch: ${String(snapshot.contract?.[key])}`);
}
if (snapshot.producer !== 'tarot-archetype-vr-authority') fail('authority producer is not the VR authority client');
if (snapshot.relationMethod?.methodId !== 'crowley_lxxviii_dignities') fail('unexpected relation method id');
if (JSON.stringify([...(snapshot.relationMethod?.compatibleTarotSystems || [])].sort()) !== JSON.stringify(['rws', 'thoth'])) fail('relation-method compatibility is not exactly RWS + Thoth');
if (snapshot.relationMethod?.selection?.marseille?.supported !== false) fail('Marseille must remain unsupported');
if (snapshot.relationMethod?.selection?.thoth?.authority !== 'SOURCE_QUALIFIED_METHOD_INHERITANCE') fail('Thoth selection authority drifted');
if (snapshot.relationMethod?.selection?.rws?.authority !== 'DIRECT_METHOD_SELECTION') fail('RWS selection authority drifted');
if (!snapshot.kernelVersion || !snapshot.sourcePack?.version || !snapshot.sourcePack?.sourceId) fail('relation authority versions/source are incomplete');
if (!Array.isArray(snapshot.pairFacts) || snapshot.pairFacts.length !== 50) fail(`expected 50 pair facts, found ${snapshot.pairFacts?.length}`);
if (!Array.isArray(snapshot.centerRules) || snapshot.centerRules.length !== 25) fail(`expected 25 center rules, found ${snapshot.centerRules?.length}`);

const pairFacts = {};
for (const fact of snapshot.pairFacts) {
  const key = `${fact.context}:${fact.leftFamily}>${fact.rightFamily}`;
  if (pairFacts[key]) fail(`duplicate pair authority ${key}`);
  if (!['IMMEDIATE_NEIGHBOR', 'OUTER_PAIR_CONTEXT'].includes(fact.context)) fail(`unsupported pair context ${fact.context}`);
  if (fact.kernelVersion !== snapshot.kernelVersion || fact.sourcePackVersion !== snapshot.sourcePack.version) fail(`version drift in ${key}`);
  pairFacts[key] = canonicalize({
    status: fact.status,
    relationType: fact.relationType,
    reasonCode: fact.reasonCode ?? null,
    sourceIds: sortedUnique(fact.sourceIds),
    claimIds: sortedUnique(fact.claimIds),
    kernelVersion: fact.kernelVersion,
    sourcePackVersion: fact.sourcePackVersion,
  });
}
const centerRules = {};
for (const rule of snapshot.centerRules) {
  const key = `${rule.leftFamily}>${rule.rightFamily}`;
  if (centerRules[key]) fail(`duplicate center authority ${key}`);
  centerRules[key] = canonicalize({
    applied: Boolean(rule.applied),
    status: rule.status,
    effectType: rule.effectType ?? null,
    effect: rule.effect ?? null,
    reasonCode: rule.reasonCode ?? null,
    sourceIds: sortedUnique(rule.sourceIds),
    claimIds: sortedUnique(rule.claimIds),
  });
}
if (Object.keys(pairFacts).length !== 50 || Object.keys(centerRules).length !== 25) fail('authority map cardinality drifted');
if (pairFacts['IMMEDIATE_NEIGHBOR:staffs>cups']?.relationType !== 'INIMICAL') fail('staffs/cups authority drifted');
if (pairFacts['IMMEDIATE_NEIGHBOR:cups>coins']?.reasonCode !== 'SOURCE_DOES_NOT_SPECIFY_PAIR') fail('cups/coins source gap drifted');
if (pairFacts['IMMEDIATE_NEIGHBOR:major>staffs']?.reasonCode !== 'CARD_WITHOUT_SUIT_FAMILY') fail('Major source gap drifted');
if (pairFacts['OUTER_PAIR_CONTEXT:staffs>swords']?.claimIds.includes('claim.l78.dignity.adjacency')) fail('outer authority leaked adjacency claim');
if (centerRules['staffs>cups']?.effectType !== 'CENTER_BETWEEN_CONTRARIES') fail('center-between-contraries authority drifted');

const generatedAuthority = canonicalize({
  relationMethod: {
    methodId: snapshot.relationMethod.methodId,
    semanticStatus: snapshot.relationMethod.semanticStatus,
    doctrineSourceIds: sortedUnique(snapshot.relationMethod.doctrineSourceIds),
    compatibleTarotSystems: [...snapshot.relationMethod.compatibleTarotSystems].sort(),
    selection: canonicalize(snapshot.relationMethod.selection),
  },
  pairFacts,
  centerRules,
});
const generatedMeta = canonicalize({
  schemaId: snapshot.schemaId,
  schemaVersion: snapshot.schemaVersion,
  contractId: PIN.contractId,
  contractVersion: PIN.contractVersion,
  authorityRepository: PIN.authorityRepository,
  authorityCommit: PIN.authorityCommit,
  kernelVersion: snapshot.kernelVersion,
  sourcePackVersion: snapshot.sourcePack.version,
  sourcePackSourceId: snapshot.sourcePack.sourceId,
  pairFactCount: 50,
  centerRuleCount: 25,
});
const generated = `// GENERATED FILE — 0.48 D3\n// Source: validated authoritative VR relation authority pinned to ${PIN.authorityCommit}.\n// Do not hand-edit Tarot doctrine here; regenerate from the pinned authority producer.\n\nconst deepFreeze = value => {\n  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n  Object.values(value).forEach(deepFreeze);\n  return Object.freeze(value);\n};\n\nexport const AUTHORITATIVE_RELATION_AUTHORITY_META = deepFreeze(${JSON.stringify(generatedMeta, null, 2)});\n\nexport const AUTHORITATIVE_RELATION_AUTHORITY = deepFreeze(${JSON.stringify(generatedAuthority, null, 2)});\n`;

let bridge = fs.readFileSync(bridgePath, 'utf8');
if (bridge.includes("from './authoritativeRelationAuthority.generated.js'")) fail('D3 relation authority already appears activated');
bridge = replaceOnce(
  bridge,
  "import { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';",
  "import { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';\nimport { AUTHORITATIVE_RELATION_AUTHORITY, AUTHORITATIVE_RELATION_AUTHORITY_META } from './authoritativeRelationAuthority.generated.js';",
  'relation authority import',
);
bridge = replaceOnce(bridge, "export const CANONICAL_DIGNITY_KERNEL_VERSION = '0.1.0';", 'export const CANONICAL_DIGNITY_KERNEL_VERSION = AUTHORITATIVE_RELATION_AUTHORITY_META.kernelVersion;', 'kernel version authority');
bridge = replaceOnce(bridge, "export const CANONICAL_LXXVIII_PACK_VERSION = '0.1.0';", 'export const CANONICAL_LXXVIII_PACK_VERSION = AUTHORITATIVE_RELATION_AUTHORITY_META.sourcePackVersion;', 'source-pack version authority');

const doctrineConstants = [
  "const THOTH_BOOK_SOURCE = 'src.primary.crowley.book-of-thoth.1944';\n",
  "const LXXVIII_SOURCE = 'src.primary.crowley.liber-lxxviii';\n",
  "const THOTH_METHOD_CLAIM = 'claim.thoth1944.divination.method-source.equinox-i-8';\n",
  "const ADJACENCY_CLAIM = 'claim.l78.dignity.adjacency';\n",
  "const SAME_SUIT_CLAIM = 'claim.l78.dignity.same-suit-strengthens';\n",
  "const CENTER_CONTRARIES_CLAIM = 'claim.l78.dignity.center-between-contraries';\n",
];
for (const line of doctrineConstants) bridge = replaceOnce(bridge, line, '', `remove duplicated doctrine constant ${line.trim()}`);

const cardCheck = ") {\n  throw new Error('Authoritative Tarot card manifest does not match the pinned upstream contract.');\n}\n";
const relationCheck = `${cardCheck}\nif (\n  AUTHORITATIVE_RELATION_AUTHORITY_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit\n) {\n  throw new Error('Authoritative Tarot relation authority does not match the pinned upstream contract.');\n}\n`;
bridge = replaceOnce(bridge, cardCheck, relationCheck, 'relation authority contract firewall');

const relationBlockStart = bridge.indexOf('const relationKey = (left, right) =>');
const technicalStart = bridge.indexOf('const technicalRelation = ({ fact, from, to, ordinal }) =>');
if (relationBlockStart < 0 || technicalStart < 0 || technicalStart <= relationBlockStart) fail('duplicated relation table/analyzePair block anchors missing');
const relationLookup = `const relationFamilyOf = card => card?.suitFamilyId || 'major';\nconst relationPairAuthority = (leftCard, rightCard, context = 'IMMEDIATE_NEIGHBOR') => {\n  const key = \`${'${context}'}:${'${relationFamilyOf(leftCard)}'}>${'${relationFamilyOf(rightCard)}'}\`;\n  const fact = AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key];\n  if (!fact) throw new Error(\`Missing authoritative relation pair fact: ${'${key}'}\`);\n  return deepFreeze({ ...fact, sourceIds: [...fact.sourceIds], claimIds: [...fact.claimIds] });\n};\nconst centerContextAuthority = (leftCard, rightCard) => {\n  const key = \`${'${relationFamilyOf(leftCard)}'}>${'${relationFamilyOf(rightCard)}'}\`;\n  const rule = AUTHORITATIVE_RELATION_AUTHORITY.centerRules[key];\n  if (!rule) throw new Error(\`Missing authoritative center-context rule: ${'${key}'}\`);\n  return deepFreeze({ ...rule, sourceIds: [...rule.sourceIds], claimIds: [...rule.claimIds] });\n};\nconst relationMethodSelectionAuthority = tarotSystem => {\n  const selection = AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.selection[String(tarotSystem || '')];\n  if (!selection?.supported) throw new Error(\`No authoritative relation-method selection for Tarot system ${'${tarotSystem}'}\`);\n  return deepFreeze({ ...selection, sourceIds: [...selection.sourceIds], claimIds: [...selection.claimIds] });\n};\n\nconst analyzePair = (leftCard, rightCard, context = 'IMMEDIATE_NEIGHBOR') => relationPairAuthority(leftCard, rightCard, context);\n\n`;
bridge = `${bridge.slice(0, relationBlockStart)}${relationLookup}${bridge.slice(technicalStart)}`;
bridge = replaceOnce(bridge, '  kernelVersion: CANONICAL_DIGNITY_KERNEL_VERSION,\n  sourcePackVersion: CANONICAL_LXXVIII_PACK_VERSION,', '  kernelVersion: fact.kernelVersion,\n  sourcePackVersion: fact.sourcePackVersion,', 'technical relation authority versions');

const centerStart = bridge.indexOf("  const centerApplied = outer.relationType === 'INIMICAL';");
const supportingStart = bridge.indexOf('  const supportingClaims = unique([', centerStart);
if (centerStart < 0 || supportingStart < 0) fail('center-context block anchors missing');
const centerReplacement = `  const centerAuthority = centerContextAuthority(cards[0], cards[2]);\n  const centerPattern = deepFreeze({\n    patternId: 'center-context.antithesis',\n    patternKind: 'CENTER_CONTEXT_EFFECT',\n    semanticAuthority: centerAuthority.applied ? 'SOURCE_QUALIFIED_CONTEXT_EFFECT' : 'NO_SUPPORTED_CONTEXT_EFFECT',\n    targetPositionId: 'antithesis', targetCardId: cards[1].cardId,\n    applied: centerAuthority.applied,\n    status: centerAuthority.status,\n    effectType: centerAuthority.effectType,\n    effect: centerAuthority.effect,\n    reasonCode: centerAuthority.reasonCode,\n    sourceIds: centerAuthority.sourceIds,\n    claimIds: centerAuthority.claimIds,\n  });\n  const centerApplied = centerPattern.applied;\n`;
bridge = `${bridge.slice(0, centerStart)}${centerReplacement}${bridge.slice(supportingStart)}`;
bridge = replaceOnce(bridge, "  const thothSelection = interpretation.tarotSystem === 'thoth';", '  const methodSelection = relationMethodSelectionAuthority(interpretation.tarotSystem);', 'method-selection authority');
bridge = replaceOnce(
  bridge,
  "      sourceIds: thothSelection ? [LXXVIII_SOURCE, THOTH_BOOK_SOURCE] : [LXXVIII_SOURCE],\n      claimIds: unique([...supportingClaims, ...(thothSelection ? [THOTH_METHOD_CLAIM] : [])]),\n      unresolvedReasonCodes,\n      relationMethodAuthority: thothSelection ? 'SOURCE_QUALIFIED_METHOD_INHERITANCE' : 'DIRECT_METHOD_SELECTION',",
  "      sourceIds: unique([\n        ...AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.doctrineSourceIds,\n        ...relations.flatMap(relation => relation.sourceIds),\n        ...outerPattern.sourceIds,\n        ...centerPattern.sourceIds,\n        ...methodSelection.sourceIds,\n      ]),\n      claimIds: unique([...supportingClaims, ...methodSelection.claimIds]),\n      unresolvedReasonCodes,\n      relationMethodAuthority: methodSelection.authority,",
  'ReadingRecord relation provenance authority',
);

const forbidden = ['EXPLICIT_RELATIONS', 'const relationKey =', 'THOTH_BOOK_SOURCE', 'LXXVIII_SOURCE', 'THOTH_METHOD_CLAIM', 'ADJACENCY_CLAIM', 'SAME_SUIT_CLAIM', 'CENTER_CONTRARIES_CLAIM'];
for (const marker of forbidden) if (bridge.includes(marker)) fail(`duplicated relation doctrine marker remains: ${marker}`);
const required = [
  "from './authoritativeRelationAuthority.generated.js'",
  'AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key]',
  'AUTHORITATIVE_RELATION_AUTHORITY.centerRules[key]',
  'AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.selection',
  'relationMethodSupportsTarotSystem',
];
for (const marker of required) if (!bridge.includes(marker)) fail(`required D3 runtime marker missing: ${marker}`);

fs.writeFileSync(generatedPath, generated, 'utf8');
fs.writeFileSync(bridgePath, bridge, 'utf8');
console.log('0.48 D3 relation-authority activation: PASS');
console.log(`Generated ${generatedPath} from ${authorityPath}`);
