import { buildCardRelicAuthority } from './cardAuthority.js';

export const LIVING_RELIC_VERSION = '0.1.0';
export const RELIC_ATTUNE_HOLD_MS = 700;
export const RELIC_MOVE_CANCEL_PX = 18;

export const LIVING_RELIC_PHASES = Object.freeze({
  idle: 'IDLE',
  attuning: 'ATTUNING',
  revealed: 'REVEALED',
});

export const LIVING_RELIC_PRESENTATION_AUTHORITY = 'PROJECT_AUTHORED_INTERACTION_CUE_NOT_SOURCE_FACT';

const fieldMap = fields => Object.fromEntries((fields || []).map(field => [field.fieldId, field]));
const fieldValue = (fields, fieldId) => fieldMap(fields)[fieldId]?.value ?? null;

export const buildLivingRelicModel = ({ card, tradition, reducedMotion = false } = {}) => {
  const authority = buildCardRelicAuthority({ card, tradition });
  if (!authority) return null;

  const expression = fieldMap(authority.expressionFields);
  const correspondences = fieldMap(authority.correspondenceFields);
  const sourceQualified = authority.sourceQualification === 'SOURCE_QUALIFIED';

  const reveal = {
    nativeTitle: expression.nativeTitle?.value ?? authority.identity.displayName,
    suitElement: correspondences.suitElement?.value ?? null,
    planet: correspondences.planet?.value ?? null,
    zodiacSign: correspondences.zodiacSign?.value ?? null,
    decan: correspondences.decan?.value ?? null,
    sourceIds: [...authority.canonicalSourceIds],
  };

  return Object.freeze({
    version: LIVING_RELIC_VERSION,
    cardId: authority.identity.cardId,
    displayName: authority.identity.displayName,
    identityAuthority: authority.identity.authority,
    sourceQualification: authority.sourceQualification,
    contract: Object.freeze({ ...authority.contract }),
    holdMs: RELIC_ATTUNE_HOLD_MS,
    moveCancelPx: RELIC_MOVE_CANCEL_PX,
    motionProfile: reducedMotion ? 'REDUCED_STATIC' : 'RITUAL_PULSE',
    presentationAuthority: LIVING_RELIC_PRESENTATION_AUTHORITY,
    revealEligible: sourceQualified && Boolean(
      reveal.nativeTitle || reveal.suitElement || reveal.planet || reveal.zodiacSign || reveal.decan,
    ),
    reveal: Object.freeze(reveal),
  });
};

export const shouldCancelRelicAttunement = ({
  startX,
  startY,
  currentX,
  currentY,
  threshold = RELIC_MOVE_CANCEL_PX,
} = {}) => {
  const dx = Number(currentX) - Number(startX);
  const dy = Number(currentY) - Number(startY);
  if (![dx, dy, Number(threshold)].every(Number.isFinite)) return true;
  return Math.hypot(dx, dy) > Number(threshold);
};

export const livingRelicIdentitySignature = model => {
  if (!model) return null;
  return `${model.contract.contractId}@${model.contract.contractVersion}:${model.cardId}`;
};

export const livingRelicRevealSummary = model => {
  if (!model) return [];
  return [
    ['TITLE', model.reveal.nativeTitle],
    ['ELEMENT', model.reveal.suitElement],
    ['PLANET', model.reveal.planet],
    ['SIGN', model.reveal.zodiacSign],
    ['DECAN', model.reveal.decan],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');
};
