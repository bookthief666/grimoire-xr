import { buildCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import {
  LIVING_RELIC_PRESENTATION_AUTHORITY,
  RELIC_ATTUNE_HOLD_MS,
  RELIC_MOVE_CANCEL_PX,
  buildLivingRelicModel,
  livingRelicIdentitySignature,
  shouldCancelRelicAttunement,
} from '../src/tarotBridge/livingRelic.js';

const card = {
  ...buildCanonicalDeckGenesis({ tradition: 'thoth' })[23],
  patina: 3,
};
const before = JSON.stringify(card);
const model = buildLivingRelicModel({ card, tradition: 'thoth' });
const reduced = buildLivingRelicModel({ card, tradition: 'thoth', reducedMotion: true });

const checks = {
  identity: model?.cardId === 'minor.staffs.two' && livingRelicIdentitySignature(model)?.endsWith(':minor.staffs.two'),
  title: model?.reveal.nativeTitle === 'DOMINION',
  element: model?.reveal.suitElement === 'FIRE',
  planet: model?.reveal.planet === 'MARS',
  zodiac: model?.reveal.zodiacSign === 'ARIES',
  hold: model?.holdMs === RELIC_ATTUNE_HOLD_MS && RELIC_ATTUNE_HOLD_MS === 700,
  swipeCancel: RELIC_MOVE_CANCEL_PX === 18
    && shouldCancelRelicAttunement({ startX: 20, startY: 20, currentX: 60, currentY: 20 })
    && !shouldCancelRelicAttunement({ startX: 20, startY: 20, currentX: 25, currentY: 25 }),
  reducedMotion: reduced?.motionProfile === 'REDUCED_STATIC' && reduced?.reveal.planet === model?.reveal.planet,
  presentationBoundary: model?.presentationAuthority === LIVING_RELIC_PRESENTATION_AUTHORITY,
  immutableInput: JSON.stringify(card) === before,
};

for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
}

if (!Object.values(checks).every(Boolean)) process.exit(1);
console.log('0.40 living relic interaction QA: PASS');
