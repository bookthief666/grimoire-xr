import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const app = read('src/App.jsx');
const bridge = read('src/tarotBridge/canonicalTarotBridge.js');
const oracle = read('src/tarotBridge/oracleSynthesis.js');
const prompt = read('src/tarotPrompt.js');
const packageJson = JSON.parse(read('package.json'));

const requireContains = (source, marker, label) => {
  if (!source.includes(marker)) throw new Error(`0.35 activation verification failed: ${label}`);
};
const requireNotContains = (source, marker, label) => {
  if (source.includes(marker)) throw new Error(`0.35 activation verification failed: ${label}`);
};

for (const [marker, label] of [
  ["from './tarotBridge/canonicalTarotBridge.js';", 'App is missing canonical bridge import'],
  ["from './tarotBridge/oracleSynthesis.js';", 'App is missing Oracle synthesis import'],
  ['canonicalCardId: canonicalCardIdFromLegacyIndex(i)', 'new ritual deck lacks canonical IDs'],
  ['const canonicalContext = getCanonicalCardPromptContext({', 'Forge lacks canonical source context'],
  ['canonicalContext,', 'image prompt compiler does not receive canonical context'],
  ["interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION'", 'generated Meta lacks explicit authority label'],
  ['prepareCanonicalOracleConsultation({', 'Oracle does not prepare canonical consultation'],
  ['activeSpread: state.activeSpread', 'Oracle does not preserve active spread'],
  ['spreadSlots: state.spreadSlots', 'Oracle does not preserve physical/2D cloth positions'],
  ['buildCanonicalOracleSynthesisPrompt({', 'Oracle does not synthesize downstream of canonical facts'],
  ['readingRecord: prepared.record', 'Oracle result does not retain canonical ReadingRecord'],
  ['selectionSource: prepared.selectionSource', 'Oracle result does not retain selection continuity'],
]) requireContains(app, marker, label);

requireNotContains(
  app,
  'const drawn = [...state.deck].sort(() => 0.5 - Math.random()).slice(0, 3);',
  'legacy random-sort Oracle path is still active',
);
requireNotContains(
  app,
  "Source: 'Secrets of the Thoth Tarot' (Katz). Style:",
  'secondary creative reference is still mislabeled as the ritual source authority',
);

for (const [marker, label] of [
  ["commit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea'", 'upstream contract pin drifted'],
  ['familyId: slug,', 'Major neutral family identity is not normalized'],
  ['familyId: suit.familyId,', 'Minor neutral family identity is not normalized'],
  ["rankClass: rankIndex < 10 ? 'pip' : 'court'", 'pip/court rank class is not normalized'],
  ['cardCount: 3,', 'TRIAD cardCount missing'],
  ['cardCount: 6,', 'HEXAGRAM cardCount missing'],
  ['cardCount: 10,', 'CROSS cardCount missing'],
  ["orderedAdjacency: [['thesis', 'antithesis'], ['antithesis', 'synthesis']]", 'TRIAD topology missing'],
]) requireContains(bridge, marker, label);

requireContains(oracle, 'UNSPECIFIED means the reviewed source does not authorize a relation', 'Oracle epistemic firewall missing');
requireContains(oracle, 'Synthesize a 300-word divinatory answer using Elemental Dignities', 'structured Oracle task inference compatibility phrase missing');
requireContains(prompt, 'GENERATED INTERPRETIVE NOTES (NON-CANONICAL)', 'image prompt generated-Meta disclosure missing');
requireContains(prompt, 'REVIEWED CANONICAL CORRESPONDENCES', 'image prompt canonical correspondence section missing');

const imageScripts = Object.entries(packageJson.scripts || {})
  .filter(([name]) => name.includes('image') || name.includes('comfy') || name.includes('render'));
if (imageScripts.some(([, command]) => String(command).includes('apply-0.35'))) {
  throw new Error('0.35 activation verification failed: migration must not be hidden inside image/build scripts');
}

console.log('0.35 canonical Tarot activation static gate: PASS');
console.log('Upstream contract: grimoire.tarot.semantic.v1@1.0.0 · f4534b4f92d88f3950ec0c9c211bfa4648cd08ea');
console.log('Next gate: npm run check');
