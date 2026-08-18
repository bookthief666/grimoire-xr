export const LIVING_TRIAD_CURRENT_VERSION = '0.1.0';

export const LIVING_TRIAD_CURRENT_AUTHORITY = 'PROJECT_AUTHORED_RELATION_TRACE_NOT_SOURCE_FACT';

export const LIVING_TRIAD_TRACE_KINDS = Object.freeze({
  immediate: 'IMMEDIATE_RELATION',
  outer: 'OUTER_PAIR_CONTEXT',
  center: 'CENTER_CONTEXT_EFFECT',
});

const cloneList = value => Array.isArray(value) ? [...value] : [];

const outerPatternOf = record => cloneList(record?.spreadPatterns)
  .find(pattern => pattern?.patternKind === 'OUTER_PAIR_CONTEXT') || null;

const centerPatternOf = record => cloneList(record?.spreadPatterns)
  .find(pattern => pattern?.patternKind === 'CENTER_CONTEXT_EFFECT') || null;

const positionLabel = (positions, index) => {
  const position = positions[index];
  return position?.label || position?.positionId || `POSITION_${index + 1}`;
};

const compactPosition = (position, index, card) => ({
  index,
  positionId: position?.positionId || `position-${index + 1}`,
  label: position?.label || position?.positionId || `POSITION ${index + 1}`,
  cardId: position?.cardId || card?.canonicalCardId || card?.cardId || null,
  orientation: position?.orientation || 'upright',
  displayName: card?.name || card?.displayName || card?.thothDisplayName || position?.cardId || 'UNKNOWN CARD',
});

const compactImmediateStep = ({ relation, index, positions }) => ({
  stepId: `immediate-${index + 1}`,
  kind: LIVING_TRIAD_TRACE_KINDS.immediate,
  ordinal: index + 1,
  label: `${positionLabel(positions, index)} → ${positionLabel(positions, index + 1)}`,
  fromCardId: relation?.fromCardId || positions[index]?.cardId || null,
  toCardId: relation?.toCardId || positions[index + 1]?.cardId || null,
  relationType: relation?.relationType || 'UNSPECIFIED',
  status: relation?.status || 'UNSPECIFIED',
  reasonCode: relation?.reasonCode || null,
  relationId: relation?.relationId || null,
});

const compactOuterStep = ({ pattern, positions }) => ({
  stepId: 'outer-pair',
  kind: LIVING_TRIAD_TRACE_KINDS.outer,
  ordinal: 3,
  label: `${positionLabel(positions, 0)} ↔ ${positionLabel(positions, 2)}`,
  fromCardId: pattern?.fromCardId || positions[0]?.cardId || null,
  toCardId: pattern?.toCardId || positions[2]?.cardId || null,
  relationType: pattern?.relationType || 'UNSPECIFIED',
  status: pattern?.status || 'UNSPECIFIED',
  reasonCode: pattern?.reasonCode || null,
  patternId: pattern?.patternId || null,
});

const compactCenterStep = ({ pattern, positions }) => ({
  stepId: 'center-effect',
  kind: LIVING_TRIAD_TRACE_KINDS.center,
  ordinal: 4,
  label: positionLabel(positions, 1),
  centerCardId: positions[1]?.cardId || null,
  applied: Boolean(pattern?.applied),
  effectType: pattern?.effectType || 'UNSPECIFIED',
  reasonCode: pattern?.reasonCode || null,
  patternId: pattern?.patternId || null,
});

export const readingRecordSignature = record => JSON.stringify({
  readingId: record?.readingId || null,
  positions: cloneList(record?.positions).map(position => [
    position?.positionId || null,
    position?.cardId || null,
    position?.orientation || null,
  ]),
  relations: cloneList(record?.relations).map(relation => [
    relation?.relationId || null,
    relation?.fromCardId || null,
    relation?.toCardId || null,
    relation?.relationType || null,
    relation?.status || null,
    relation?.reasonCode || null,
  ]),
  spreadPatterns: cloneList(record?.spreadPatterns).map(pattern => [
    pattern?.patternId || null,
    pattern?.patternKind || null,
    pattern?.relationType || null,
    pattern?.effectType || null,
    pattern?.applied ?? null,
    pattern?.reasonCode || null,
  ]),
  sourceIds: cloneList(record?.provenance?.sourceIds),
  methodAuthority: record?.provenance?.relationMethodAuthority || null,
});

const resolveReadingRecord = reading => {
  if (reading?.readingRecord) return reading.readingRecord;
  if (Array.isArray(reading?.positions) && Array.isArray(reading?.relations)) return reading;
  return null;
};

export const buildLivingTriadCurrentModel = ({ reading, cards, reducedMotion = false } = {}) => {
  const record = resolveReadingRecord(reading);
  if (!record) {
    return {
      version: LIVING_TRIAD_CURRENT_VERSION,
      available: false,
      reasonCode: 'READING_RECORD_MISSING',
      presentationAuthority: LIVING_TRIAD_CURRENT_AUTHORITY,
      reducedMotion: Boolean(reducedMotion),
      positions: [],
      steps: [],
      maxRevealCount: 0,
      recordSignature: readingRecordSignature(null),
    };
  }

  const positions = cloneList(record.positions);
  const relations = cloneList(record.relations);
  const readingCards = cloneList(cards || reading?.cards);

  if (positions.length !== 3 || relations.length < 2) {
    return {
      version: LIVING_TRIAD_CURRENT_VERSION,
      available: false,
      reasonCode: 'TRIAD_RELATION_SHAPE_REQUIRED',
      presentationAuthority: LIVING_TRIAD_CURRENT_AUTHORITY,
      reducedMotion: Boolean(reducedMotion),
      positions: positions.map((position, index) => compactPosition(position, index, readingCards[index])),
      steps: [],
      maxRevealCount: 0,
      recordSignature: readingRecordSignature(record),
    };
  }

  const outer = outerPatternOf(record);
  const center = centerPatternOf(record);
  const compactPositions = positions.map((position, index) => compactPosition(position, index, readingCards[index]));
  const steps = [
    compactImmediateStep({ relation: relations[0], index: 0, positions }),
    compactImmediateStep({ relation: relations[1], index: 1, positions }),
    compactOuterStep({ pattern: outer, positions }),
    compactCenterStep({ pattern: center, positions }),
  ];

  return {
    version: LIVING_TRIAD_CURRENT_VERSION,
    available: true,
    reasonCode: null,
    presentationAuthority: LIVING_TRIAD_CURRENT_AUTHORITY,
    reducedMotion: Boolean(reducedMotion),
    positions: compactPositions,
    steps,
    maxRevealCount: steps.length,
    relationMethod: record?.input?.relationMethod || null,
    relationMethodAuthority: record?.provenance?.relationMethodAuthority || null,
    sourceIds: cloneList(record?.provenance?.sourceIds),
    recordSignature: readingRecordSignature(record),
  };
};

export const visibleLivingTriadSteps = (model, revealCount = 0) => {
  if (!model?.available) return [];
  const count = Math.max(0, Math.min(model.maxRevealCount, Number(revealCount) || 0));
  return model.steps.slice(0, count);
};

export const nextLivingTriadRevealCount = (model, revealCount = 0) => {
  if (!model?.available) return 0;
  const count = Math.max(0, Number(revealCount) || 0);
  return count >= model.maxRevealCount ? 0 : count + 1;
};

export const nextLivingTriadStep = (model, revealCount = 0) => {
  if (!model?.available) return null;
  const count = Math.max(0, Number(revealCount) || 0);
  return count >= model.maxRevealCount ? null : model.steps[count] || null;
};
