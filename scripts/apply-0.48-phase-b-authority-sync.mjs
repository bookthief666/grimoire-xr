import fs from 'node:fs';

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const generatedPath = 'src/tarotBridge/authoritativeCardManifest.generated.js';
const fail = message => { throw new Error(`0.48 Phase B authority sync refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

if (!fs.existsSync(generatedPath)) fail(`missing generated authority artifact ${generatedPath}`);
const generated = fs.readFileSync(generatedPath, 'utf8');
if (!generated.includes('f4534b4f92d88f3950ec0c9c211bfa4648cd08ea')) fail('generated authority artifact is not pinned to f4534b4f...');
if (!generated.includes('AUTHORITATIVE_CARD_MANIFEST_META') || !generated.includes('AUTHORITATIVE_CARD_MANIFEST')) fail('generated authority artifact has unexpected shape');

let bridge = fs.readFileSync(bridgePath, 'utf8');
if (!bridge.includes("from './authoritativeCardManifest.generated.js'")) {
  bridge = replaceOnce(
    bridge,
    "import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';",
    "import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';\nimport { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';",
    'authority artifact import',
  );
}

const oldExport = 'export const CANONICAL_CARD_MANIFEST = buildCanonicalCardManifest();';
const newExport = `if (
  AUTHORITATIVE_CARD_MANIFEST_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId
  || AUTHORITATIVE_CARD_MANIFEST_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit
) {
  throw new Error('Authoritative Tarot card manifest does not match the pinned upstream contract.');
}

// 0.48 Phase B: source-qualified card doctrine is generated from the exact
// authoritative VR contract snapshot. The legacy local builder remains only
// as temporary rollback material until parity is frozen and de-duplication proceeds.
export const CANONICAL_CARD_MANIFEST = deepFreeze(AUTHORITATIVE_CARD_MANIFEST);`;

if (!bridge.includes(newExport)) {
  bridge = replaceOnce(bridge, oldExport, newExport, 'canonical card manifest authority switch');
}

fs.writeFileSync(bridgePath, bridge);
console.log('Applied 0.48 Phase B authoritative card-manifest sync.');
