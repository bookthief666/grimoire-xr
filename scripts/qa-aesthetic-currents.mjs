import fs from 'node:fs';
import path from 'node:path';
import {
  AESTHETIC_CURRENTS,
  ENCHANTMENT_LEVELS,
  resolveAestheticPreferences,
} from '../src/aesthetic/aestheticCurrents.js';

const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

if (AESTHETIC_CURRENTS.map(entry => entry.id).join('|') === 'arcane-os|ritual-hybrid|living-book') pass('threeReversibleCurrents');
else fail('threeReversibleCurrents');

if (ENCHANTMENT_LEVELS.map(entry => entry.id).join('|') === 'veiled|balanced|vivid|exalted') pass('independentEnchantmentScale');
else fail('independentEnchantmentScale');

const baseline = resolveAestheticPreferences({ search: '?look=arcane&fx=exalted' });
if (baseline.current === 'arcane-os' && baseline.enchantment === 'exalted') pass('arcaneBaselineDirectAccess');
else fail('arcaneBaselineDirectAccess');

const field = fs.readFileSync(path.join(process.cwd(), 'src/aesthetic/AestheticField.jsx'), 'utf8');
const css = fs.readFileSync(path.join(process.cwd(), 'src/aesthetic/aestheticShell.css'), 'utf8');

for (const forbidden of ['fetch(', 'callGrimoireApi', 'prepareCanonicalOracleConsultation', 'ReadingRecord', 'buildCanonicalDeckGenesis']) {
  if (field.includes(forbidden)) fail(`presentationFirewall:${forbidden}`);
}
if (!process.exitCode) pass('providerAndTarotFirewall');

if (field.includes("if (profile.id === 'arcane-os') return null;")) pass('arcaneMysteryFieldOff');
else fail('arcaneMysteryFieldOff');

if (css.includes('ARCANE OS is intentionally closest to the accepted pre-0.44 baseline') && css.includes('> canvas { opacity: .8 !important; filter: none; }')) pass('acceptedCanvasPreserved');
else fail('acceptedCanvasPreserved');

if (css.includes('prefers-reduced-motion') && field.includes('is-reduced-motion')) pass('reducedMotionPresentationOnly');
else fail('reducedMotionPresentationOnly');

if (!process.exitCode) console.log('0.44 aesthetic currents QA: PASS');
