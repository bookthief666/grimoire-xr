import { buildRelicWorkspaceModel } from '../tarotBridge/relicWorkspace.js';

export const RELIC_CHAMBER_AUTHORITY = 'PROJECT_AUTHORED_RELIC_HISTORY_PRESENTATION_NOT_SOURCE_FACT';

const historyStage = patina => {
  const value = Math.max(0, Number(patina || 0));
  if (value >= 25) return 'VENERATED';
  if (value >= 10) return 'WEATHERED';
  if (value >= 5) return 'TEMPERED';
  if (value >= 1) return 'AWAKENED';
  return 'UNTOUCHED';
};

const inscription = field => {
  const value = field?.value;
  if (value === null || value === undefined || value === '') return null;
  return {
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    authority: field.authority || null,
  };
};

export const buildRelicChamberModel = ({ card, tradition } = {}) => {
  const workspace = buildRelicWorkspaceModel({ card, tradition });
  if (!workspace) return null;

  const patina = Math.max(0, Number(workspace.relic.patina || 0));
  const sourceQualified = workspace.correspondences.sourceQualification === 'SOURCE_QUALIFIED';
  const correspondences = workspace.correspondences.correspondenceById || {};
  const expression = workspace.correspondences.expressionById || {};

  const inscriptions = sourceQualified
    ? [
        ['ELEMENT', inscription(correspondences.suitElement)],
        ['PLANET', inscription(correspondences.planet)],
        ['SIGN', inscription(correspondences.zodiacSign)],
        ['LETTER', inscription(expression.hebrewLetter || correspondences.hebrewLetter)],
      ].filter(([, item]) => item).map(([label, item]) => Object.freeze({ label, ...item }))
    : [];

  return Object.freeze({
    authority: RELIC_CHAMBER_AUTHORITY,
    cardId: workspace.relic.cardId,
    title: expression.nativeTitle?.value || workspace.relic.displayName,
    displayName: workspace.relic.displayName,
    patina,
    historyStage: historyStage(patina),
    ringCount: Math.min(6, 1 + Math.floor(Math.log2(patina + 1))),
    sourceQualified,
    inscriptions: Object.freeze(inscriptions),
    hasImage: Boolean(workspace.relic.hasImage),
  });
};
