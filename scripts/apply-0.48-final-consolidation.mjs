import fs from 'node:fs';
import { renderAuthoritySpreadManifestModule } from '../src/tarotBridge/authorityArtifact.js';

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  console.error('Usage: node scripts/apply-0.48-final-consolidation.mjs <vr-conformance-snapshot.json>');
  process.exit(2);
}

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const spreadPath = 'src/tarotBridge/authoritativeSpreadManifest.generated.js';
const fail = message => { throw new Error(`0.48 final consolidation refused: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

if (fs.existsSync(spreadPath)) fail(`${spreadPath} already exists`);
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const generatedSpreadModule = renderAuthoritySpreadManifestModule(snapshot);
if (!generatedSpreadModule.includes('f4534b4f92d88f3950ec0c9c211bfa4648cd08ea')) fail('generated spread artifact lost exact authority pin');

let bridge = fs.readFileSync(bridgePath, 'utf8');
if (bridge.includes("from './authoritativeSpreadManifest.generated.js'")) fail('spread authority already appears activated');

bridge = replaceOnce(
  bridge,
  "import { AUTHORITATIVE_RELATION_AUTHORITY, AUTHORITATIVE_RELATION_AUTHORITY_META } from './authoritativeRelationAuthority.generated.js';",
  "import { AUTHORITATIVE_RELATION_AUTHORITY, AUTHORITATIVE_RELATION_AUTHORITY_META } from './authoritativeRelationAuthority.generated.js';\nimport { AUTHORITATIVE_SPREAD_MANIFEST, AUTHORITATIVE_SPREAD_MANIFEST_META } from './authoritativeSpreadManifest.generated.js';",
  'spread authority import',
);

const relationFirewall = `if (\n  AUTHORITATIVE_RELATION_AUTHORITY_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository\n  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit\n) {\n  throw new Error('Authoritative Tarot relation authority does not match the pinned upstream contract.');\n}\n`;
const spreadFirewall = `${relationFirewall}\nif (\n  AUTHORITATIVE_SPREAD_MANIFEST_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId\n  || AUTHORITATIVE_SPREAD_MANIFEST_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion\n  || AUTHORITATIVE_SPREAD_MANIFEST_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository\n  || AUTHORITATIVE_SPREAD_MANIFEST_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit\n) {\n  throw new Error('Authoritative Tarot spread manifest does not match the pinned upstream contract.');\n}\n`;
bridge = replaceOnce(bridge, relationFirewall, spreadFirewall, 'spread contract firewall');

bridge = replaceOnce(
  bridge,
  `// 0.48 Phase B: source-qualified card doctrine is generated from the exact\n// authoritative VR contract snapshot. The legacy local builder remains only\n// as temporary rollback material until parity is frozen and de-duplication proceeds.\n`,
  `// 0.48: source-qualified card doctrine is generated from the exact pinned VR contract.\n`,
  'stale card rollback comment',
);

const traditionStart = bridge.indexOf('const TRADITION_CONFIGS = deepFreeze({');
const traditionEnd = bridge.indexOf('\n\nconst normalizeTraditionId = tradition =>', traditionStart);
if (traditionStart < 0 || traditionEnd < 0) fail('stale TRADITION_CONFIGS block anchors missing');
bridge = `${bridge.slice(0, traditionStart)}${bridge.slice(traditionEnd + 2)}`;
bridge = replaceOnce(
  bridge,
  '  if (TRADITION_CONFIGS[direct]) return direct;\n',
  '',
  'redundant legacy tradition membership check',
);

const spreadStart = bridge.indexOf('export const CANONICAL_SPREAD_MAP = deepFreeze({');
const spreadEnd = bridge.indexOf('\n\nconst relationFamilyOf = card =>', spreadStart);
if (spreadStart < 0 || spreadEnd < 0) fail('local spread manifest block anchors missing');
bridge = `${bridge.slice(0, spreadStart)}export const CANONICAL_SPREAD_MAP = deepFreeze(AUTHORITATIVE_SPREAD_MANIFEST);${bridge.slice(spreadEnd)}`;

bridge = replaceOnce(
  bridge,
  "  if (Object.values(TRADITION_CONFIGS).some(config => config.relationMethod === 'thoth_native')) errors.push('thoth_native relation method must not exist');\n",
  "  if (JSON.stringify(Object.keys(CANONICAL_SPREAD_MAP)) !== JSON.stringify(AUTHORITATIVE_SPREAD_MANIFEST_META.spreadKeys)) errors.push('canonical spread legacy-key order drifted');\n  Object.entries(CANONICAL_SPREAD_MAP).forEach(([legacyId, spread]) => {\n    if (!spread?.spreadId || !Number.isInteger(spread?.cardCount) || spread.cardCount <= 0) errors.push(`invalid canonical spread ${legacyId}`);\n    if (!Array.isArray(spread?.positions) || spread.positions.length !== spread.cardCount) errors.push(`canonical spread position drift: ${legacyId}`);\n  });\n",
  'bridge validation ownership cleanup',
);

for (const forbidden of [
  'const TRADITION_CONFIGS =',
  "correspondenceProfile: 'golden_dawn'",
  "correspondenceProfile: 'disabled'",
  'export const CANONICAL_SPREAD_MAP = deepFreeze({',
  'legacy local builder remains only',
]) {
  if (bridge.includes(forbidden)) fail(`stale duplicate marker remains: ${forbidden}`);
}
for (const required of [
  "from './authoritativeSpreadManifest.generated.js'",
  'export const CANONICAL_SPREAD_MAP = deepFreeze(AUTHORITATIVE_SPREAD_MANIFEST);',
  'AUTHORITATIVE_SPREAD_MANIFEST_META.spreadKeys',
  'resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth })',
  'AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key]',
]) {
  if (!bridge.includes(required)) fail(`required final authority marker missing: ${required}`);
}

fs.writeFileSync(spreadPath, generatedSpreadModule, 'utf8');
fs.writeFileSync(bridgePath, bridge, 'utf8');
console.log('0.48 final spread + legacy-mirror consolidation activation: PASS');
console.log(`Generated ${spreadPath} from ${snapshotPath}`);
