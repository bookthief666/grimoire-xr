import { buildCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import { buildRelicWorkspaceModel } from '../src/tarotBridge/relicWorkspace.js';

const tradition = Object.freeze({ id: 'thoth', name: 'Book of Thoth' });
const card = {
  ...buildCanonicalDeckGenesis({ tradition })[23],
  exegesis: 'QA interpretation.',
  exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
  meta: { hebrew: 'QA reflection', planet: 'QA reflection', gematria: 42 },
  interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
  visual: 'QA visual direction.',
  visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
  promptUsed: 'QA deterministic prompt.',
  promptSchema: 'tarot-structured-v1',
  generation: { provider: 'comfyui', mode: 'preview', width: 640, height: 960, steps: 18, seed: 424242 },
  patina: 3,
};

const model = buildRelicWorkspaceModel({ card, tradition });
const checks = {
  modes: model?.tabs.map(tab => tab.id).join(',') === 'relic,correspondences,interpretation,generation',
  identity: model?.relic.cardId === 'minor.staffs.two' && model?.relic.displayName === 'TWO OF WANDS',
  title: model?.correspondences.expressionById.nativeTitle?.value === 'DOMINION',
  element: model?.correspondences.correspondenceById.suitElement?.value === 'FIRE',
  planet: model?.correspondences.correspondenceById.planet?.value === 'MARS',
  zodiac: model?.correspondences.correspondenceById.zodiacSign?.value === 'ARIES',
  interpretationBoundary: model?.interpretation.isSourceFact === false && model?.interpretation.exegesisAuthority === 'MODEL_GENERATED_INTERPRETATION',
  generationBoundary: model?.generation.isSourceFact === false && model?.generation.visualAuthority === 'MODEL_GENERATED_IMAGE_DIRECTION',
  generationProvenance: model?.generation.image?.seed === 424242 && model?.generation.image?.steps === 18,
};

for (const [name, pass] of Object.entries(checks)) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
}
if (!Object.values(checks).every(Boolean)) {
  throw new Error('0.39 relic workspace QA failed.');
}
console.log('0.39 relic workspace QA: PASS');
