import { buildCardRelicAuthority } from './cardAuthority.js';

export const RELIC_WORKSPACE_VERSION = '0.1.0';

export const RELIC_WORKSPACE_TABS = Object.freeze([
  Object.freeze({ id: 'relic', label: 'RELIC' }),
  Object.freeze({ id: 'correspondences', label: 'CORRESPONDENCES' }),
  Object.freeze({ id: 'interpretation', label: 'INTERPRETATION' }),
  Object.freeze({ id: 'generation', label: 'GENERATION' }),
]);

export const RELIC_WORKSPACE_TAB_IDS = Object.freeze(
  RELIC_WORKSPACE_TABS.reduce((acc, tab) => ({ ...acc, [tab.id]: tab.id }), {}),
);

export const normalizeRelicWorkspaceTab = value => {
  const normalized = String(value || '').trim().toLowerCase();
  return RELIC_WORKSPACE_TABS.some(tab => tab.id === normalized) ? normalized : 'relic';
};

const fieldMap = fields => Object.freeze(
  (fields || []).reduce((acc, field) => ({ ...acc, [field.fieldId]: field }), {}),
);

export const buildRelicWorkspaceModel = ({ card, tradition } = {}) => {
  const authority = buildCardRelicAuthority({ card, tradition });
  if (!authority) return null;

  return Object.freeze({
    version: RELIC_WORKSPACE_VERSION,
    tabs: RELIC_WORKSPACE_TABS,
    relic: Object.freeze({
      cardId: authority.identity.cardId,
      displayName: authority.identity.displayName,
      labelAuthority: authority.identity.authority,
      sourceQualification: authority.sourceQualification,
      tarotSystem: authority.tarotSystem,
      patina: Number(card?.patina || 0),
      hasImage: Boolean(card?.imageUrl),
      hasInterpretation: Boolean(card?.exegesis),
      hasReflectionMeta: Boolean(card?.meta),
      contract: authority.contract,
    }),
    correspondences: Object.freeze({
      expressionFields: authority.expressionFields,
      expressionById: fieldMap(authority.expressionFields),
      correspondenceFields: authority.correspondenceFields,
      correspondenceById: fieldMap(authority.correspondenceFields),
      sourceIds: Object.freeze([...authority.canonicalSourceIds]),
      sourceQualification: authority.sourceQualification,
    }),
    interpretation: Object.freeze({
      exegesis: card?.exegesis || null,
      exegesisAuthority: authority.generatedLayers.exegesis,
      reflectiveMeta: card?.meta || null,
      reflectiveMetaAuthority: authority.generatedLayers.reflectiveMeta,
      isSourceFact: false,
    }),
    generation: Object.freeze({
      visualDirection: card?.visual || null,
      visualAuthority: authority.generatedLayers.visualDirection,
      promptUsed: card?.promptUsed || null,
      promptSchema: card?.promptSchema || null,
      image: authority.imageGeneration,
      isSourceFact: false,
    }),
  });
};
