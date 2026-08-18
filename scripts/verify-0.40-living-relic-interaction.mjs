import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const app = read('src/App.jsx');
const surface = read('src/tarotBridge/LivingRelicSurface.jsx');
const model = read('src/tarotBridge/livingRelic.js');
const route = read('src/appRoute.js');
const main = read('src/main.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.40 static gate failed: ${message}`);
};

assert(app.includes("import LivingRelicSurface from './tarotBridge/LivingRelicSurface.jsx';"), 'App must import LivingRelicSurface');
assert(app.includes('<LivingRelicSurface'), 'focused-card image must render LivingRelicSurface');
assert(app.includes('card={state.focusedCard}'), 'living relic must receive the existing focused card');
assert(app.includes('tradition={state.selectedTradition}'), 'living relic must receive selected tradition');
assert(app.includes('reducedMotion={reducedMotion}'), 'living relic must respect reduced motion');
assert(app.includes('onAttuned={relicAttuneBuzz}'), 'living relic must route successful attunement to haptics');
assert(app.includes('relicAttuneBuzz: () => safely(async () =>'), 'safe native haptic acknowledgement must exist');
assert(app.includes('<RelicWorkspace'), '0.39 workspace must remain intact');
assert(app.includes('<img src={state.focusedCard.imageUrl}'), 'existing card image rendering must remain intact inside the living surface');

assert(surface.includes('onPointerDown={beginAttunement}'), 'surface must use deliberate pointer-down attunement');
assert(surface.includes('onPointerMove={moveAttunement}'), 'surface must cancel attunement on movement');
assert(surface.includes('onContextMenu={event => event.preventDefault()}'), 'surface must suppress mobile long-press context menus');
assert(surface.includes('SEAL'), 'surface must expose explicit seal/reset control');
assert(surface.includes('REVEAL IS PRESENTATION ONLY'), 'surface must state that reveal does not rewrite source facts');
assert(surface.includes('data-living-relic-state={phase}'), 'surface must expose deterministic QA state marker');

assert(model.includes('export const RELIC_ATTUNE_HOLD_MS = 700;'), 'hold threshold must remain deterministic at 700ms');
assert(model.includes('export const RELIC_MOVE_CANCEL_PX = 18;'), 'movement cancellation threshold must remain deterministic');
assert(model.includes('PROJECT_AUTHORED_INTERACTION_CUE_NOT_SOURCE_FACT'), 'interaction cue must not be represented as historical source fact');
assert(model.includes("motionProfile: reducedMotion ? 'REDUCED_STATIC' : 'RITUAL_PULSE'"), 'reduced-motion profile must remain explicit');

assert(route.includes("livingRelicQa: 'living-relic-qa'"), 'route registry must include living relic QA');
assert(route.includes("normalizedPath.startsWith('/qa/living-relic')"), 'living relic QA route must be explicit');
assert(main.includes("import('./tarotBridge/LivingRelicQaApp.jsx')"), 'entrypoint must lazy-load living relic QA');

console.log('0.40 living relic interaction static gate: PASS');
