import {
  RELIQUARY_PRESENTATION_AUTHORITY,
  buildReliquaryPresentation,
} from './reliquaryPresentation.js';

export const RETURNING_READER_AUTHORITY = RELIQUARY_PRESENTATION_AUTHORITY;

const timestampOf = value => {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildReturningReaderModel = entries => {
  const presentation = buildReliquaryPresentation(entries);
  const memories = presentation.memories
    .map((memory, index) => ({ memory, index }))
    .sort((left, right) => (
      timestampOf(right.memory.savedAt) - timestampOf(left.memory.savedAt)
      || left.index - right.index
    ))
    .map(({ memory }) => memory);

  return Object.freeze({
    authority: RETURNING_READER_AUTHORITY,
    hasMemories: memories.length > 0,
    count: memories.length,
    latestMemory: memories[0] || null,
    memories: Object.freeze(memories),
    returningRelics: presentation.returningRelics,
  });
};

export const buildReturningRelicSelection = ({ entries, cardId } = {}) => {
  const model = buildReturningReaderModel(entries);
  const normalizedCardId = String(cardId || '').trim();
  const memories = normalizedCardId
    ? model.memories.filter(memory => memory.cardIds.includes(normalizedCardId))
    : model.memories;

  return Object.freeze({
    authority: RETURNING_READER_AUTHORITY,
    selectedCardId: normalizedCardId || null,
    count: memories.length,
    memories: Object.freeze([...memories]),
  });
};
