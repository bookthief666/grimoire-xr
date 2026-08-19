export const ENCHANTED_SURFACE_AUTHORITY = 'PROJECT_AUTHORED_RITUAL_SURFACE_NOT_SOURCE_FACT';

export const POSITION_SIGILS = Object.freeze({
  thesis: Object.freeze({ mark: '△', label: 'FIRST FORCE' }),
  antithesis: Object.freeze({ mark: '◇', label: 'COUNTERFORCE' }),
  synthesis: Object.freeze({ mark: '○', label: 'RECONCILING FIELD' }),
});

const normalizeTone = tone => {
  if (tone === 'supportive') return 'supportive';
  if (tone === 'contrary') return 'contrary';
  return 'unresolved';
};

export const buildThresholdSurfaceModel = ({ hasQuestion = false, opening = false } = {}) => Object.freeze({
  authority: ENCHANTED_SURFACE_AUTHORITY,
  state: opening ? 'opening' : hasQuestion ? 'inscribed' : 'dormant',
  cardCount: 3,
  sigils: Object.freeze(['△', '◇', '○']),
});

export const buildOracleSurfaceModel = presentation => {
  const positions = Array.isArray(presentation?.positions) ? presentation.positions : [];
  const positionIndex = new Map(positions.map((position, index) => [position.positionId, index]));
  const relations = (Array.isArray(presentation?.relations) ? presentation.relations : []).map((relation, index) => Object.freeze({
    relationId: relation.relationId || `relation-${index}`,
    tone: normalizeTone(relation.tone),
    fromIndex: positionIndex.get(relation.raw?.fromPositionId) ?? index,
    toIndex: positionIndex.get(relation.raw?.toPositionId) ?? Math.min(index + 1, Math.max(positions.length - 1, 0)),
  }));

  const surfacePositions = positions.map((position, index) => Object.freeze({
    positionId: position.positionId,
    index,
    ...(POSITION_SIGILS[position.positionId] || { mark: '✦', label: 'POSITION' }),
  }));

  return Object.freeze({
    authority: ENCHANTED_SURFACE_AUTHORITY,
    positions: Object.freeze(surfacePositions),
    relations: Object.freeze(relations),
    outerTone: presentation?.outerContext ? normalizeTone(presentation.outerContext.tone) : null,
    centerApplied: Boolean(presentation?.centerContext?.applied),
  });
};
