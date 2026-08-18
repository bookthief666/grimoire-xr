import { CANONICAL_CARD_MANIFEST } from './canonicalTarotBridge.js';

export const CANONICAL_DECK_GENESIS_VERSION = '0.1.0';

const PROJECT_COMPATIBILITY_LABEL_AUTHORITY = 'PROJECT_COMPATIBILITY_LABEL';
const SOURCE_QUALIFIED_EXPRESSION_AUTHORITY = 'SOURCE_QUALIFIED_CANONICAL_EXPRESSION';

const normalizeTraditionId = tradition => {
  const direct = String(tradition?.id || tradition || '').trim().toLowerCase();
  if (direct) return direct;
  const name = String(tradition?.name || '').trim().toLowerCase();
  if (name.includes('thoth')) return 'thoth';
  if (name.includes('rider') || name.includes('waite')) return 'rws';
  if (name.includes('marseille')) return 'marseille';
  return name;
};

const NEUTRAL_MAJOR_LABELS = Object.freeze({
  fool: 'THE FOOL',
  magician: 'THE MAGICIAN',
  priestess: 'THE HIGH PRIESTESS',
  empress: 'THE EMPRESS',
  emperor: 'THE EMPEROR',
  hierophant: 'THE HIEROPHANT',
  lovers: 'THE LOVERS',
  chariot: 'THE CHARIOT',
  fortitude: 'STRENGTH',
  hermit: 'THE HERMIT',
  wheel: 'WHEEL OF FORTUNE',
  justice: 'JUSTICE',
  hanged: 'THE HANGED MAN',
  death: 'DEATH',
  temperance: 'TEMPERANCE',
  devil: 'THE DEVIL',
  tower: 'THE TOWER',
  star: 'THE STAR',
  moon: 'THE MOON',
  sun: 'THE SUN',
  judgement: 'JUDGEMENT',
  world: 'THE WORLD',
});

const NEUTRAL_RANK_LABELS = Object.freeze({
  ace: 'ACE',
  two: 'TWO',
  three: 'THREE',
  four: 'FOUR',
  five: 'FIVE',
  six: 'SIX',
  seven: 'SEVEN',
  eight: 'EIGHT',
  nine: 'NINE',
  ten: 'TEN',
  page: 'PAGE',
  knight: 'KNIGHT',
  queen: 'QUEEN',
  king: 'KING',
});

const NEUTRAL_SUIT_LABELS = Object.freeze({
  staffs: 'WANDS',
  cups: 'CUPS',
  swords: 'SWORDS',
  coins: 'COINS',
});

const neutralIdentityLabel = descriptor => {
  if (descriptor.arcana === 'major') {
    return NEUTRAL_MAJOR_LABELS[descriptor.familyId] || descriptor.cardId.toUpperCase();
  }
  const rank = NEUTRAL_RANK_LABELS[descriptor.rankId] || String(descriptor.rankId || '').toUpperCase();
  const suit = NEUTRAL_SUIT_LABELS[descriptor.suitFamilyId] || String(descriptor.suitFamilyId || '').toUpperCase();
  return `${rank} OF ${suit}`;
};

export const getDeckGenesisLabel = ({ descriptor, tradition } = {}) => {
  if (!descriptor) return null;
  const traditionId = normalizeTraditionId(tradition);
  if (traditionId === 'thoth') {
    const field = descriptor.thoth?.fields?.displayName;
    if (!field?.value || field.semanticStatus !== 'CANONICAL') {
      throw new Error(`Thoth deck genesis requires a canonical display expression for ${descriptor.cardId}.`);
    }
    return Object.freeze({
      value: field.value,
      authority: SOURCE_QUALIFIED_EXPRESSION_AUTHORITY,
      sourceIds: Object.freeze([...(field.sourceIds || [])]),
    });
  }
  return Object.freeze({
    value: neutralIdentityLabel(descriptor),
    authority: PROJECT_COMPATIBILITY_LABEL_AUTHORITY,
    sourceIds: Object.freeze([]),
  });
};

export const buildCanonicalDeckGenesis = ({ tradition } = {}) => (
  CANONICAL_CARD_MANIFEST.map(descriptor => {
    const label = getDeckGenesisLabel({ descriptor, tradition });
    return {
      id: descriptor.legacyIndex,
      canonicalCardId: descriptor.cardId,
      name: label.value,
      nameAuthority: label.authority,
      nameSourceIds: [...label.sourceIds],
      imageUrl: null,
      exegesis: null,
      meta: null,
      interpretiveMetaAuthority: null,
      promptUsed: null,
      patina: 0,
    };
  })
);

export const validateCanonicalDeckGenesis = deck => {
  if (!Array.isArray(deck) || deck.length !== CANONICAL_CARD_MANIFEST.length) {
    throw new Error(`Canonical deck genesis must contain exactly ${CANONICAL_CARD_MANIFEST.length} cards.`);
  }
  deck.forEach((card, index) => {
    const descriptor = CANONICAL_CARD_MANIFEST[index];
    if (card.id !== descriptor.legacyIndex) {
      throw new Error(`Canonical deck genesis legacy index drift at ${index}.`);
    }
    if (card.canonicalCardId !== descriptor.cardId) {
      throw new Error(`Canonical deck genesis card identity drift at ${index}.`);
    }
    if (typeof card.name !== 'string' || !card.name.trim()) {
      throw new Error(`Canonical deck genesis requires a display label at ${descriptor.cardId}.`);
    }
  });
  if (new Set(deck.map(card => card.canonicalCardId)).size !== CANONICAL_CARD_MANIFEST.length) {
    throw new Error('Canonical deck genesis contains duplicate card identities.');
  }
  return deck;
};

export const DECK_GENESIS_AUTHORITIES = Object.freeze({
  sourceQualifiedExpression: SOURCE_QUALIFIED_EXPRESSION_AUTHORITY,
  projectCompatibilityLabel: PROJECT_COMPATIBILITY_LABEL_AUTHORITY,
});
