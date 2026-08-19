import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../tarotBridge/canonicalDeckGenesis.js';
import { canonicalCardIdFromLegacyIndex } from '../tarotBridge/canonicalTarotBridge.js';
import {
  SEMANTIC_CONFIG_SCHEMA_ID,
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  updateSemanticConfig,
} from './semanticConfig.js';

const AUTHORITY_SENSITIVE_CARD_FIELDS = Object.freeze(new Set([
  'id',
  'canonicalCardId',
  'name',
  'nameAuthority',
  'nameSourceIds',
  'canonicalExpression',
  'canonicalCorrespondences',
  'sourceQualification',
  'semanticAuthority',
  'sourceIds',
  'claimIds',
]));

const semanticConfigOf = input => (
  input?.schemaId === SEMANTIC_CONFIG_SCHEMA_ID
    ? createSemanticConfig(input)
    : semanticConfigFromLegacyTradition(input).config
);

const canonicalIdentityOf = card => {
  if (card?.canonicalCardId) return card.canonicalCardId;
  if (typeof card?.id === 'string') return card.id;
  if (Number.isInteger(card?.id)) return canonicalCardIdFromLegacyIndex(card.id);
  return null;
};

export const stripSystemAuthorityFromCard = card => {
  if (!card || typeof card !== 'object') return {};
  return Object.fromEntries(Object.entries(card).filter(([key]) => {
    if (AUTHORITY_SENSITIVE_CARD_FIELDS.has(key)) return false;
    if (key.startsWith('canonicalExpression')) return false;
    if (key.startsWith('canonicalCorrespondence')) return false;
    if (key.startsWith('sourceQualification')) return false;
    return true;
  }));
};

export const rebuildDeckForSemanticConfig = ({ deck = [], semanticConfig } = {}) => {
  const config = semanticConfigOf(semanticConfig);
  const regenerated = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: { id: config.tarotSystem } }));
  const currentByCanonicalId = new Map(
    (Array.isArray(deck) ? deck : [])
      .map(card => [canonicalIdentityOf(card), card])
      .filter(([cardId]) => Boolean(cardId)),
  );

  return regenerated.map(canonicalCard => {
    const current = currentByCanonicalId.get(canonicalCard.canonicalCardId);
    if (!current) return canonicalCard;
    return {
      ...stripSystemAuthorityFromCard(current),
      ...canonicalCard,
      patina: Math.max(Number(current.patina || 0), Number(canonicalCard.patina || 0)),
    };
  });
};

export const planSemanticTransition = ({ current, next } = {}) => {
  const from = semanticConfigOf(current);
  const to = semanticConfigOf(next);
  const tarotSystemChanged = from.tarotSystem !== to.tarotSystem;
  const correspondenceProfileChanged = from.correspondenceProfile !== to.correspondenceProfile;
  const relationMethodChanged = from.relationMethod !== to.relationMethod;
  const interpretiveLensesChanged = JSON.stringify(from.interpretiveLenses) !== JSON.stringify(to.interpretiveLenses);
  const ritualThemeChanged = from.ritualTheme !== to.ritualTheme;
  const readingDepthChanged = from.readingDepth !== to.readingDepth;

  return Object.freeze({
    from,
    to,
    tarotSystemChanged,
    correspondenceProfileChanged,
    relationMethodChanged,
    interpretiveLensesChanged,
    ritualThemeChanged,
    readingDepthChanged,
    rebuildDeck: tarotSystemChanged,
    invalidateReading: tarotSystemChanged || correspondenceProfileChanged || relationMethodChanged,
    clearFocusedCard: tarotSystemChanged || correspondenceProfileChanged,
    preserveHistoricalReadingRecords: true,
    canonicalFactsChanged: tarotSystemChanged || correspondenceProfileChanged || relationMethodChanged,
    interpretationOnly: !tarotSystemChanged && !correspondenceProfileChanged && !relationMethodChanged
      && (interpretiveLensesChanged || ritualThemeChanged || readingDepthChanged),
  });
};

export const buildSemanticStateTransition = ({ state, patch } = {}) => {
  if (!state || typeof state !== 'object') throw new Error('Semantic state transition requires reducer state.');
  const current = state.semanticConfig?.schemaId === SEMANTIC_CONFIG_SCHEMA_ID
    ? semanticConfigOf(state.semanticConfig)
    : semanticConfigFromLegacyTradition(state.selectedTradition, {
        readingDepth: ['neophyte', 'adept', 'magus'][Number(state.techLevel)] || 'adept',
      }).config;
  const next = updateSemanticConfig(current, patch);
  const plan = planSemanticTransition({ current, next });
  const nextDeck = plan.rebuildDeck
    ? rebuildDeckForSemanticConfig({ deck: state.deck, semanticConfig: next })
    : state.deck;

  return Object.freeze({
    semanticConfig: next,
    plan,
    nextState: {
      ...state,
      semanticConfig: next,
      deck: nextDeck,
      reading: plan.invalidateReading ? null : state.reading,
      focusedCard: plan.clearFocusedCard ? null : state.focusedCard,
      isConsulting: plan.invalidateReading ? false : state.isConsulting,
    },
  });
};
