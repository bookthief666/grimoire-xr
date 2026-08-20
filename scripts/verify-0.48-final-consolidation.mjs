import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const spreadPath = 'src/tarotBridge/authoritativeSpreadManifest.generated.js';
const bridgeSource = fs.readFileSync(bridgePath, 'utf8');
if (!fs.existsSync(spreadPath)) throw new Error(`Missing generated spread authority ${spreadPath}`);

const pass = message => console.log(`PASS ${message}`);
const assert = (condition, message) => { if (!condition) throw new Error(message); pass(message); };

for (const forbidden of [
  'const TRADITION_CONFIGS =',
  "correspondenceProfile: 'golden_dawn'",
  "correspondenceProfile: 'disabled'",
  'export const CANONICAL_SPREAD_MAP = deepFreeze({',
  'legacy local builder remains only',
]) assert(!bridgeSource.includes(forbidden), `stale Fold semantic mirror removed: ${forbidden}`);

assert(bridgeSource.includes("from './authoritativeSpreadManifest.generated.js'"), 'production bridge imports generated spread authority');
assert(bridgeSource.includes('export const CANONICAL_SPREAD_MAP = deepFreeze(AUTHORITATIVE_SPREAD_MANIFEST);'), 'production spread manifest derives from authority artifact');
assert(bridgeSource.includes('AUTHORITATIVE_SPREAD_MANIFEST_META.spreadKeys'), 'bridge validates authority spread key boundary');
assert(bridgeSource.includes('resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth })'), 'modern semantic axes still resolve through the 0.47 semantic owner');
assert(bridgeSource.includes('AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key]'), 'relation doctrine remains generated-authority backed');
assert(bridgeSource.includes('AUTHORITATIVE_CARD_MANIFEST'), 'card doctrine remains generated-authority backed');

const cacheBust = `?freeze=${Date.now()}`;
const spreadModule = await import(`${pathToFileURL(`${process.cwd()}/${spreadPath}`).href}${cacheBust}`);
const bridge = await import(`${pathToFileURL(`${process.cwd()}/${bridgePath}`).href}${cacheBust}`);
const semantic = await import(`${pathToFileURL(`${process.cwd()}/src/semantic/semanticConfig.js`).href}${cacheBust}`);
const { AUTHORITATIVE_SPREAD_MANIFEST_META: meta, AUTHORITATIVE_SPREAD_MANIFEST: spreads } = spreadModule;

assert(meta.contractId === 'grimoire.tarot.semantic.v1' && meta.contractVersion === '1.0.0', 'spread authority contract id/version pinned');
assert(meta.authorityRepository === 'bookthief666/tarot-archetype-vr', 'spread authority repository pinned');
assert(meta.authorityCommit === 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea', 'spread authority exact commit pinned');
assert(JSON.stringify(meta.spreadKeys) === JSON.stringify(['TRIAD', 'HEXAGRAM', 'CROSS']), 'spread legacy-key interface preserved');
assert(bridge.CANONICAL_SPREAD_MAP === spreads, 'production Fold spread map is exactly generated authority');

assert(spreads.TRIAD.spreadId === 'grimoire.triad.dialectic' && spreads.TRIAD.cardCount === 3, 'canonical TRIAD identity/count preserved');
assert(JSON.stringify(spreads.TRIAD.positions.map(position => position.positionId)) === JSON.stringify(['thesis', 'antithesis', 'synthesis']), 'canonical TRIAD position identity/order preserved');
assert(JSON.stringify(spreads.TRIAD.topology.orderedAdjacency) === JSON.stringify([['thesis', 'antithesis'], ['antithesis', 'synthesis']]), 'canonical TRIAD ordered adjacency preserved');
assert(spreads.HEXAGRAM.cardCount === 6 && spreads.HEXAGRAM.semanticStatus === 'PROVISIONAL', 'legacy HEXAGRAM compatibility spread preserved');
assert(spreads.CROSS.cardCount === 10 && spreads.CROSS.semanticStatus === 'PROVISIONAL', 'legacy CROSS compatibility spread preserved');
assert(bridge.validateCanonicalTarotBridge().length === 0, 'production canonical bridge validation remains green');

const legacyRws = bridge.getCanonicalInterpretationConfig({ tradition: { id: 'rws', name: 'Rider-Waite-Smith' }, readingDepth: 'adept' });
assert(legacyRws.legacyTraditionId === 'rws', 'legacy tradition metadata remains stable after mirror removal');
assert(legacyRws.tarotSystem === 'rws' && legacyRws.relationMethod === 'crowley_lxxviii_dignities', 'legacy RWS semantic migration still delegates to semanticConfig');
const freshRws = semantic.createSemanticConfig({ tarotSystem: 'rws' });
assert(freshRws.relationMethod === 'disabled' && freshRws.correspondenceProfile === 'none', 'fresh RWS defaults remain source-honest and independent of legacy compatibility');

const thoth = semantic.createSemanticConfig({ tarotSystem: 'thoth' });
const threeAces = bridge.buildCanonicalTriadConsultation({ readingId: 'freeze:three-aces', question: '0.48 freeze', legacyIndexes: [22, 50, 36], semanticConfig: thoth });
assert(JSON.stringify(threeAces.relations.map(relation => relation.relationType)) === JSON.stringify(['FRIENDLY', 'FRIENDLY']), 'Three-Aces immediate relation truth preserved');
assert(threeAces.spreadPatterns[0].relationType === 'INIMICAL' && threeAces.spreadPatterns[1].effectType === 'CENTER_BETWEEN_CONTRARIES', 'Three-Aces contextual relation truth preserved');
const majorGap = bridge.buildCanonicalTriadConsultation({ readingId: 'freeze:major-gap', question: '0.48 freeze', legacyIndexes: [22, 3, 36], semanticConfig: thoth });
assert(majorGap.relations.every(relation => relation.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY'), 'Major-gap immediate UNSPECIFIED behavior preserved');
assert(majorGap.spreadPatterns[0].relationType === 'INIMICAL' && majorGap.spreadPatterns[1].effectType === 'CENTER_BETWEEN_CONTRARIES', 'Major-gap outer/center context preserved');

for (const forbiddenPresentation of ['imageUrl', 'promptUsed', 'ComfyUI', 'camera', 'enchantment']) {
  assert(!fs.readFileSync(spreadPath, 'utf8').includes(forbiddenPresentation), `spread authority remains presentation-free: ${forbiddenPresentation}`);
}

console.log('0.48 final authority consolidation verifier: PASS');
