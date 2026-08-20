import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const generatedPath = 'src/tarotBridge/authoritativeRelationAuthority.generated.js';
const bridgeSource = fs.readFileSync(bridgePath, 'utf8');
if (!fs.existsSync(generatedPath)) throw new Error(`Missing generated relation authority ${generatedPath}`);

const pass = message => console.log(`PASS ${message}`);
const assert = (condition, message) => { if (!condition) throw new Error(message); pass(message); };

for (const forbidden of [
  'EXPLICIT_RELATIONS',
  'const relationKey =',
  'THOTH_BOOK_SOURCE',
  'LXXVIII_SOURCE',
  'THOTH_METHOD_CLAIM',
  'ADJACENCY_CLAIM',
  'SAME_SUIT_CLAIM',
  'CENTER_CONTRARIES_CLAIM',
]) {
  assert(!bridgeSource.includes(forbidden), `duplicate relation doctrine removed: ${forbidden}`);
}
assert(bridgeSource.includes("from './authoritativeRelationAuthority.generated.js'"), 'production bridge imports generated relation authority');
assert(bridgeSource.includes('AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key]'), 'production pair analysis resolves through authority artifact');
assert(bridgeSource.includes('AUTHORITATIVE_RELATION_AUTHORITY.centerRules[key]'), 'production center context resolves through authority artifact');
assert(bridgeSource.includes('AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.selection'), 'production method provenance resolves through authority artifact');

const cacheBust = `?d3=${Date.now()}`;
const relationModule = await import(`${pathToFileURL(`${process.cwd()}/${generatedPath}`).href}${cacheBust}`);
const bridge = await import(`${pathToFileURL(`${process.cwd()}/${bridgePath}`).href}${cacheBust}`);
const semantic = await import(`${pathToFileURL(`${process.cwd()}/src/semantic/semanticConfig.js`).href}${cacheBust}`);
const { AUTHORITATIVE_RELATION_AUTHORITY_META: meta, AUTHORITATIVE_RELATION_AUTHORITY: authority } = relationModule;

assert(meta.contractId === 'grimoire.tarot.semantic.v1' && meta.contractVersion === '1.0.0', 'generated relation authority contract id/version pinned');
assert(meta.authorityRepository === 'bookthief666/tarot-archetype-vr' && meta.authorityCommit === 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea', 'generated relation authority exact VR commit pinned');
assert(meta.pairFactCount === 50 && Object.keys(authority.pairFacts).length === 50, 'generated relation authority carries exactly 50 pair/context facts');
assert(meta.centerRuleCount === 25 && Object.keys(authority.centerRules).length === 25, 'generated relation authority carries exactly 25 center-context rules');
assert(bridge.CANONICAL_DIGNITY_KERNEL_VERSION === meta.kernelVersion, 'production kernel version derives from authority artifact');
assert(bridge.CANONICAL_LXXVIII_PACK_VERSION === meta.sourcePackVersion, 'production source-pack version derives from authority artifact');
assert(JSON.stringify(authority.relationMethod.compatibleTarotSystems) === JSON.stringify(['rws', 'thoth']), 'generated relation-method compatibility matches VR authority');
assert(authority.relationMethod.selection.thoth.authority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE', 'Thoth method inheritance provenance generated from VR authority');
assert(authority.relationMethod.selection.rws.authority === 'DIRECT_METHOD_SELECTION', 'RWS direct-method provenance generated from VR authority');
assert(authority.relationMethod.selection.marseille.supported === false, 'Marseille relation method remains unsupported');

const thoth = semantic.createSemanticConfig({ tarotSystem: 'thoth' });
const threeAces = bridge.buildCanonicalTriadConsultation({
  readingId: 'd3:three-aces',
  question: 'D3 authority verification',
  legacyIndexes: [22, 50, 36],
  semanticConfig: thoth,
});
assert(JSON.stringify(threeAces.relations.map(entry => entry.relationType)) === JSON.stringify(['FRIENDLY', 'FRIENDLY']), 'Three-Aces immediate relation truth preserved');
assert(threeAces.spreadPatterns[0].relationType === 'INIMICAL' && threeAces.spreadPatterns[1].effectType === 'CENTER_BETWEEN_CONTRARIES', 'Three-Aces outer/center context preserved');
assert(threeAces.provenance.relationMethodAuthority === 'SOURCE_QUALIFIED_METHOD_INHERITANCE', 'Thoth ReadingRecord method authority preserved');
assert(JSON.stringify(threeAces.provenance.sourceIds) === JSON.stringify(['src.primary.crowley.liber-lxxviii', 'src.primary.crowley.book-of-thoth.1944']), 'Thoth ReadingRecord source ordering preserved');
assert(threeAces.provenance.claimIds.includes('claim.thoth1944.divination.method-source.equinox-i-8'), 'Thoth method-source claim preserved without local hardcoding');

const rws = semantic.createSemanticConfig({ tarotSystem: 'rws', relationMethod: 'crowley_lxxviii_dignities' });
const rwsRecord = bridge.buildCanonicalTriadConsultation({
  readingId: 'd3:rws',
  question: 'D3 RWS direct method',
  legacyIndexes: [22, 50, 36],
  semanticConfig: rws,
});
assert(rwsRecord.provenance.relationMethodAuthority === 'DIRECT_METHOD_SELECTION', 'RWS direct relation-method authority preserved');
assert(JSON.stringify(rwsRecord.provenance.sourceIds) === JSON.stringify(['src.primary.crowley.liber-lxxviii']), 'RWS does not inherit Book of Thoth method source');
assert(!rwsRecord.provenance.claimIds.includes('claim.thoth1944.divination.method-source.equinox-i-8'), 'RWS does not inherit Thoth method-source claim');

const sourceGap = bridge.buildCanonicalTriadConsultation({
  readingId: 'd3:source-gap',
  question: 'D3 source gap',
  legacyIndexes: [36, 64, 22],
  semanticConfig: thoth,
});
assert(sourceGap.relations[0].relationType === 'UNSPECIFIED' && sourceGap.relations[0].reasonCode === 'SOURCE_DOES_NOT_SPECIFY_PAIR', 'Cups/Disks source gap preserved');

const majorGap = bridge.buildCanonicalTriadConsultation({
  readingId: 'd3:major-gap',
  question: 'D3 major gap',
  legacyIndexes: [22, 3, 36],
  semanticConfig: thoth,
});
assert(majorGap.relations.every(entry => entry.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY'), 'Major/no-suit immediate gaps preserved');
assert(majorGap.spreadPatterns[1].effectType === 'CENTER_BETWEEN_CONTRARIES', 'Major center does not erase source-qualified outer contraries effect');

const marseilleFailsClosed = (() => {
  try {
    semantic.createSemanticConfig({ tarotSystem: 'marseille', relationMethod: 'crowley_lxxviii_dignities' });
    return false;
  } catch {
    return true;
  }
})();
assert(marseilleFailsClosed, 'Marseille + Crowley/LXXVIII still fails closed');

const generatedText = fs.readFileSync(generatedPath, 'utf8');
for (const forbiddenPresentation of ['promptUsed', 'imageUrl', 'exegesis', 'visualCurrent', 'enchantment']) {
  assert(!generatedText.includes(forbiddenPresentation), `relation authority remains presentation-free: ${forbiddenPresentation}`);
}

console.log('0.48 D3 relation doctrine de-duplication: PASS');
