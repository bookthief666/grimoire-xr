import fs from 'node:fs';
import path from 'node:path';
import {
  ENCHANTED_SURFACE_AUTHORITY,
  buildOracleSurfaceModel,
  buildThresholdSurfaceModel,
} from '../src/aesthetic/enchantedSurfaceModel.js';

const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

const threshold = buildThresholdSurfaceModel({ hasQuestion: true, opening: true });
if (threshold.state === 'opening' && threshold.cardCount === 3 && threshold.authority === ENCHANTED_SURFACE_AUTHORITY) pass('thresholdCeremonialState');
else fail('thresholdCeremonialState');

const oracle = buildOracleSurfaceModel({
  positions: [
    { positionId: 'thesis' },
    { positionId: 'antithesis' },
    { positionId: 'synthesis' },
  ],
  relations: [
    { relationId: 'left', tone: 'supportive', raw: { fromPositionId: 'thesis', toPositionId: 'antithesis' } },
    { relationId: 'right', tone: 'supportive', raw: { fromPositionId: 'antithesis', toPositionId: 'synthesis' } },
  ],
  outerContext: { tone: 'contrary' },
  centerContext: { applied: true },
});
if (oracle.relations.map(relation => relation.tone).join('|') === 'supportive|supportive' && oracle.outerTone === 'contrary' && oracle.centerApplied) pass('oracleCurrentProjection');
else fail('oracleCurrentProjection');

for (const file of ['ThresholdRitualField.jsx', 'OracleRelationField.jsx']) {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/aesthetic', file), 'utf8');
  for (const forbidden of ['fetch(', 'callGrimoireApi', 'prepareCanonicalOracleConsultation', 'buildCanonicalDeckGenesis', 'ReadingRecord', 'Math.random']) {
    if (source.includes(forbidden)) fail(`${file}:forbidden:${forbidden}`);
  }
  if (!source.includes('aria-hidden="true"')) fail(`${file}:decorativeAccessibility`);
  if (!source.includes('data-authority=')) fail(`${file}:authorityBoundary`);
}
if (!process.exitCode) pass('providerDoctrineAndPointerFirewall');

const css = fs.readFileSync(path.join(process.cwd(), 'src/aesthetic/enchantedSurfaces.css'), 'utf8');
if (css.includes('data-aesthetic-current="arcane-os"') && css.includes('data-aesthetic-current="living-book"') && css.includes('data-enchantment="exalted"')) pass('reversibleCurrentStyling');
else fail('reversibleCurrentStyling');

if (css.includes('prefers-reduced-motion')) pass('reducedMotionPreserved');
else fail('reducedMotionPreserved');

if (!process.exitCode) console.log('0.45 enchanted surfaces QA: PASS');
