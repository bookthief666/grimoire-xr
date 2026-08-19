const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

const relationLabel = value => {
  const type = clean(value).toUpperCase();
  if (type === 'FRIENDLY') return 'FRIENDLY';
  if (type === 'SAME_SUIT_STRONG') return 'STRONG';
  if (type === 'INIMICAL') return 'CONTRARY';
  return 'UNSPECIFIED';
};

export const RELIQUARY_PRESENTATION_AUTHORITY = 'PROJECT_DERIVED_READING_HISTORY_NOT_TAROT_FACT';

export const buildReliquaryPresentation = entries => {
  const safeEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  const recurrence = new Map();

  const memories = safeEntries.map(entry => {
    const metadata = entry.metadata || {};
    const ids = Array.isArray(metadata.positionCardIds) ? metadata.positionCardIds : [];
    const titles = Array.isArray(metadata.positionTitles) ? metadata.positionTitles : [];
    ids.forEach((cardId, index) => {
      if (!cardId) return;
      const previous = recurrence.get(cardId) || { cardId, title: titles[index] || cardId, appearances: 0, entryIds: [] };
      recurrence.set(cardId, {
        ...previous,
        title: previous.title || titles[index] || cardId,
        appearances: previous.appearances + 1,
        entryIds: [...previous.entryIds, entry.entryId],
      });
    });

    const relationSignature = (metadata.relationTypes || []).map(relationLabel);
    if (metadata.outerRelationType) relationSignature.push(`OUTER ${relationLabel(metadata.outerRelationType)}`);

    return Object.freeze({
      entryId: entry.entryId,
      savedAt: entry.savedAt,
      question: clean(metadata.question) || 'Untitled inquiry',
      author: clean(metadata.author),
      spreadId: metadata.spreadId || 'unknown-spread',
      cardIds: Object.freeze([...ids]),
      cardTitles: Object.freeze([...titles]),
      relationSignature: Object.freeze(relationSignature),
      centerEffectApplied: Boolean(metadata.centerEffectApplied),
      interpretationPresent: Boolean(metadata.interpretationPresent),
      artworkCount: Number(metadata.artworkCount || 0),
      contract: metadata.contract || null,
      rawEntry: entry,
    });
  });

  const returningRelics = [...recurrence.values()]
    .filter(item => item.appearances > 1)
    .sort((a, b) => b.appearances - a.appearances || a.title.localeCompare(b.title))
    .slice(0, 6)
    .map(item => Object.freeze({ ...item, entryIds: Object.freeze([...item.entryIds]) }));

  return Object.freeze({
    authority: RELIQUARY_PRESENTATION_AUTHORITY,
    count: memories.length,
    memories: Object.freeze(memories),
    returningRelics: Object.freeze(returningRelics),
  });
};
