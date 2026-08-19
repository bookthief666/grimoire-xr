import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../tarotBridge/canonicalDeckGenesis.js';

const canonicalIdOf = card => card?.id || card?.canonicalCardId || null;

export const resolveOracleRelicCard = ({
  cardId,
  deck = [],
  readingCards = [],
  tradition,
} = {}) => {
  const id = String(cardId || '').trim();
  if (!id) return null;

  const liveDeckCard = Array.isArray(deck)
    ? deck.find(card => canonicalIdOf(card) === id) || null
    : null;
  if (liveDeckCard) return liveDeckCard;

  const readingCard = Array.isArray(readingCards)
    ? readingCards.find(card => canonicalIdOf(card) === id) || null
    : null;
  if (readingCard) return readingCard;

  try {
    const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition }));
    return canonicalDeck.find(card => canonicalIdOf(card) === id) || null;
  } catch {
    return null;
  }
};
