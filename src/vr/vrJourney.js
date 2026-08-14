const COURT_JOURNEY = [
  {
    id: 'scriptorium',
    glyph: '☿',
    planet: 'MERCURY',
    concept: 'GNOSIS',
    tab: 'setup',
    station: 'scriptorium',
    action: 'AWAKEN THE 78 ARCANA',
    instruction: 'Name a subject and awaken the complete Grimoire in Ritual.',
  },
  {
    id: 'loom',
    glyph: '♀',
    planet: 'VENUS',
    concept: 'EROS',
    tab: 'setup',
    station: 'loom',
    action: 'WEAVE AN AESTHETIC',
    instruction: 'Choose an aesthetic after awakening, or pull the Loom to the next style.',
  },
  {
    id: 'genius',
    glyph: '☉',
    planet: 'SOL',
    concept: 'GENIUS',
    tab: 'setup',
    station: 'genius',
    action: 'TURN THE GENIUS SEAL',
    instruction: 'Turn the mnemonic seal instantly, or manifest its ruling portrait.',
  },
  {
    id: 'forge',
    glyph: '♂',
    planet: 'MARS',
    concept: 'WILL',
    tab: 'deck',
    station: 'forge',
    action: 'TEMPER A RELIC',
    instruction: 'Scribe one card, manifest its image, then Inspect + Add Patina.',
  },
  {
    id: 'oracle',
    glyph: '♃',
    planet: 'JUPITER',
    concept: 'SYNTHESIS',
    tab: 'oracle',
    station: 'oracle',
    action: 'CAST A READING',
    instruction: 'Ask a question, draw or arrange the cloth, and cast the spread.',
  },
  {
    id: 'spirit',
    glyph: '♄',
    planet: 'SATURN',
    concept: 'SHADOW',
    tab: 'spirit',
    station: 'spirit',
    action: 'OPEN THE SIGNAL',
    instruction: 'Send one message and receive an imaginative archival reply.',
  },
  {
    id: 'archive',
    glyph: '☾',
    planet: 'LUNA',
    concept: 'MNEMOSYNE',
    tab: 'archive',
    station: 'archive',
    action: 'CARRY THE PALACE',
    instruction: 'Download JSON or HTML, or share/save the portable Grimoire.',
  },
];

export const buildCourtJourney = (completedCourtIds = []) => {
  const completed = new Set(Array.isArray(completedCourtIds) ? completedCourtIds : []);
  const courts = COURT_JOURNEY.map((court, index) => ({
    ...court,
    number: index + 1,
    complete: completed.has(court.id),
  }));
  const completedCount = courts.filter(court => court.complete).length;
  return {
    courts,
    completedCount,
    nextCourt: courts.find(court => !court.complete) || null,
    sealed: completedCount === courts.length,
    total: courts.length,
  };
};

export const COURT_JOURNEY_IDS = COURT_JOURNEY.map(court => court.id);
