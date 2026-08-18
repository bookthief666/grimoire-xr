import { buildCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import { buildCardRelicAuthority } from '../src/tarotBridge/cardAuthority.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.38 card authority QA failed: ${message}`);
};

const thoth = { id: 'thoth', name: 'Book of Thoth' };
const deck = buildCanonicalDeckGenesis({ tradition: thoth });
const card = {
  ...deck[23],
  exegesis: 'Generated QA interpretation.',
  exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
  meta: { hebrew: 'Generated', planet: 'Generated' },
  interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
  visual: 'Generated visual direction.',
  visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
  generation: { provider: 'comfyui', mode: 'preview', width: 640, height: 960, steps: 18, seed: 424242 },
};
const model = buildCardRelicAuthority({ card, tradition: thoth });

assert(model?.identity.cardId === 'minor.staffs.two', 'Two of Wands canonical ID drifted');
assert(model.identity.displayName === 'TWO OF WANDS', 'Thoth display expression drifted');
assert(model.identity.authority === 'SOURCE_QUALIFIED_CANONICAL_EXPRESSION', 'Thoth display-name authority must remain source-qualified');
assert(model.sourceQualification === 'SOURCE_QUALIFIED', 'Thoth source qualification must be active');
assert(model.expressionFields.find(field => field.fieldId === 'nativeTitle')?.value === 'DOMINION', 'native title must be DOMINION');
assert(model.correspondenceFields.find(field => field.fieldId === 'planet')?.value === 'MARS', 'planet must be MARS');
assert(model.correspondenceFields.find(field => field.fieldId === 'zodiacSign')?.value === 'ARIES', 'zodiac must be ARIES');
assert(model.canonicalSourceIds.includes('src.primary.crowley.book-of-thoth.1944'), 'Book of Thoth source ID must be visible');
assert(model.generatedLayers.exegesis === 'MODEL_GENERATED_INTERPRETATION', 'exegesis must remain generated interpretation');
assert(model.generatedLayers.reflectiveMeta === 'MODEL_GENERATED_REFLECTION', 'meta must remain generated reflection');
assert(model.generatedLayers.visualDirection === 'MODEL_GENERATED_IMAGE_DIRECTION', 'visual direction must remain generated');
assert(!model.canonicalSourceIds.includes('MODEL_GENERATED_REFLECTION'), 'generated authority must never enter source IDs');
assert(model.imageGeneration?.seed === 424242, 'image generation seed provenance must survive');

const rws = { id: 'rws', name: 'Rider-Waite-Smith' };
const rwsModel = buildCardRelicAuthority({ card: buildCanonicalDeckGenesis({ tradition: rws })[1], tradition: rws });
assert(rwsModel.sourceQualification === 'SOURCE_PACK_PENDING', 'RWS must not inherit Thoth source qualification');
assert(rwsModel.identity.authority === 'PROJECT_COMPATIBILITY_LABEL', 'RWS label must remain project compatibility authority');
assert(rwsModel.canonicalSourceIds.length === 0, 'unsourced compatibility label must claim no source IDs');

console.log('PASS canonical identity');
console.log('PASS source-qualified expression');
console.log('PASS canonical correspondences');
console.log('PASS generated interpretation firewall');
console.log('PASS image-generation provenance');
console.log('PASS unsourced-tradition boundary');
console.log('0.38 card relic authority QA: PASS');
