// Auditable inherited correspondences. Baseline: the Golden Dawn Tarot material
// published by Crowley as Liber LXXVIII / Book T and the principal tables in
// Book 4 Appendix V. Book of Thoth mode explicitly applies Crowley's later
// Heh/Tzaddi revision and Thoth card/court nomenclature.
const MAJOR_NAMES = [
  'THE FOOL', 'THE MAGICIAN', 'THE HIGH PRIESTESS', 'THE EMPRESS', 'THE EMPEROR',
  'THE HIEROPHANT', 'THE LOVERS', 'THE CHARIOT', 'STRENGTH', 'THE HERMIT',
  'THE WHEEL', 'JUSTICE', 'THE HANGED ONE', 'DEATH', 'TEMPERANCE', 'THE DEVIL',
  'THE TOWER', 'THE STAR', 'THE MOON', 'THE SUN', 'JUDGEMENT', 'THE WORLD',
];

const MAJOR_NUMERALS = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
];

const MAJOR_PATHS = [
  ['ALEPH', 'א', 1, 'AIR · ELEMENTAL TRUMP'],
  ['BETH', 'ב', 2, 'MERCURY · PLANETARY TRUMP'],
  ['GIMEL', 'ג', 3, 'MOON · PLANETARY TRUMP'],
  ['DALETH', 'ד', 4, 'VENUS · PLANETARY TRUMP'],
  ['HEH', 'ה', 5, 'ARIES · ZODIACAL TRUMP'],
  ['VAV', 'ו', 6, 'TAURUS · ZODIACAL TRUMP'],
  ['ZAYIN', 'ז', 7, 'GEMINI · ZODIACAL TRUMP'],
  ['CHETH', 'ח', 8, 'CANCER · ZODIACAL TRUMP'],
  ['TETH', 'ט', 9, 'LEO · ZODIACAL TRUMP'],
  ['YOD', 'י', 10, 'VIRGO · ZODIACAL TRUMP'],
  ['KAPH', 'כ', 20, 'JUPITER · PLANETARY TRUMP'],
  ['LAMED', 'ל', 30, 'LIBRA · ZODIACAL TRUMP'],
  ['MEM', 'מ', 40, 'WATER · ELEMENTAL TRUMP'],
  ['NUN', 'נ', 50, 'SCORPIO · ZODIACAL TRUMP'],
  ['SAMEKH', 'ס', 60, 'SAGITTARIUS · ZODIACAL TRUMP'],
  ['AYIN', 'ע', 70, 'CAPRICORN · ZODIACAL TRUMP'],
  ['PEH', 'פ', 80, 'MARS · PLANETARY TRUMP'],
  ['TZADDI', 'צ', 90, 'AQUARIUS · ZODIACAL TRUMP'],
  ['QOPH', 'ק', 100, 'PISCES · ZODIACAL TRUMP'],
  ['RESH', 'ר', 200, 'SUN · PLANETARY TRUMP'],
  ['SHIN', 'ש', 300, 'FIRE / SPIRIT · ELEMENTAL TRUMP'],
  ['TAV', 'ת', 400, 'SATURN / EARTH · PLANETARY + ELEMENTAL TRUMP'],
];

const SUITS = [
  {
    name: 'WANDS',
    element: 'FIRE',
    decans: {
      TWO: 'MARS IN ARIES · 1ST DECAN', THREE: 'SUN IN ARIES · 2ND DECAN', FOUR: 'VENUS IN ARIES · 3RD DECAN',
      FIVE: 'SATURN IN LEO · 1ST DECAN', SIX: 'JUPITER IN LEO · 2ND DECAN', SEVEN: 'MARS IN LEO · 3RD DECAN',
      EIGHT: 'MERCURY IN SAGITTARIUS · 1ST DECAN', NINE: 'MOON IN SAGITTARIUS · 2ND DECAN', TEN: 'SATURN IN SAGITTARIUS · 3RD DECAN',
    },
  },
  {
    name: 'CUPS',
    element: 'WATER',
    decans: {
      TWO: 'VENUS IN CANCER · 1ST DECAN', THREE: 'MERCURY IN CANCER · 2ND DECAN', FOUR: 'MOON IN CANCER · 3RD DECAN',
      FIVE: 'MARS IN SCORPIO · 1ST DECAN', SIX: 'SUN IN SCORPIO · 2ND DECAN', SEVEN: 'VENUS IN SCORPIO · 3RD DECAN',
      EIGHT: 'SATURN IN PISCES · 1ST DECAN', NINE: 'JUPITER IN PISCES · 2ND DECAN', TEN: 'MARS IN PISCES · 3RD DECAN',
    },
  },
  {
    name: 'SWORDS',
    element: 'AIR',
    decans: {
      TWO: 'MOON IN LIBRA · 1ST DECAN', THREE: 'SATURN IN LIBRA · 2ND DECAN', FOUR: 'JUPITER IN LIBRA · 3RD DECAN',
      FIVE: 'VENUS IN AQUARIUS · 1ST DECAN', SIX: 'MERCURY IN AQUARIUS · 2ND DECAN', SEVEN: 'MOON IN AQUARIUS · 3RD DECAN',
      EIGHT: 'JUPITER IN GEMINI · 1ST DECAN', NINE: 'MARS IN GEMINI · 2ND DECAN', TEN: 'SUN IN GEMINI · 3RD DECAN',
    },
  },
  {
    name: 'PENTACLES',
    element: 'EARTH',
    decans: {
      TWO: 'JUPITER IN CAPRICORN · 1ST DECAN', THREE: 'MARS IN CAPRICORN · 2ND DECAN', FOUR: 'SUN IN CAPRICORN · 3RD DECAN',
      FIVE: 'MERCURY IN TAURUS · 1ST DECAN', SIX: 'MOON IN TAURUS · 2ND DECAN', SEVEN: 'SATURN IN TAURUS · 3RD DECAN',
      EIGHT: 'SUN IN VIRGO · 1ST DECAN', NINE: 'VENUS IN VIRGO · 2ND DECAN', TEN: 'MERCURY IN VIRGO · 3RD DECAN',
    },
  },
];

const RANKS = ['ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'PAGE', 'KNIGHT', 'QUEEN', 'KING'];
const COURT_ELEMENTS = { PAGE: 'EARTH', KNIGHT: 'AIR', QUEEN: 'WATER', KING: 'FIRE' };

const majorReferences = MAJOR_NAMES.map((name, index) => {
  const [letter, glyph, gematria, attribution] = MAJOR_PATHS[index];
  return {
    name,
    inherited: `${name} · ${MAJOR_NUMERALS[index]}`,
    hebrew: `${letter} (${glyph})`,
    gematria,
    attribution,
    reference: 'HERMETIC TAROT · GOLDEN DAWN BASELINE',
  };
});

const minorReferences = SUITS.flatMap(suit => RANKS.map(rank => {
  let attribution = suit.decans[rank];
  if (rank === 'ACE') attribution = `ROOT OF ${suit.element} · ACE`;
  if (COURT_ELEMENTS[rank]) attribution = `${COURT_ELEMENTS[rank]} OF ${suit.element} · COURT FORM`;
  return {
    name: `${rank} OF ${suit.name}`,
    inherited: `${rank} OF ${suit.name}`,
    hebrew: '— · MINOR ARCANA',
    gematria: null,
    attribution,
    reference: 'HERMETIC TAROT · DECAN / COURT BASELINE',
  };
}));

export const TAROT_REFERENCES = [...majorReferences, ...minorReferences];

const isThoth = tradition => /(^thoth$|book of thoth)/i.test(String(tradition || ''));

export const getTarotReference = (index, tradition = 'hermetic') => {
  const normalizedIndex = Math.min(77, Math.max(0, Number(index) || 0));
  const base = TAROT_REFERENCES[normalizedIndex];
  if (!isThoth(tradition)) return { ...base };
  let thoth = {
    ...base,
    reference: normalizedIndex < 22
      ? 'BOOK OF THOTH · THELEMIC TRUMP BASELINE'
      : 'BOOK OF THOTH · THELEMIC SMALL-CARD BASELINE',
  };
  if (normalizedIndex === 8) thoth = { ...thoth, inherited: 'LUST · XI' };
  if (normalizedIndex === 11) thoth = { ...thoth, inherited: 'ADJUSTMENT · VIII' };
  if (normalizedIndex >= 22) {
    const rank = RANKS[(normalizedIndex - 22) % RANKS.length];
    const thothRank = { PAGE: 'PRINCESS', KNIGHT: 'PRINCE', QUEEN: 'QUEEN', KING: 'KNIGHT' }[rank] || rank;
    const suit = base.name.includes('PENTACLES') ? 'DISKS' : SUITS[Math.floor((normalizedIndex - 22) / RANKS.length)].name;
    thoth = { ...thoth, inherited: `${thothRank} OF ${suit}` };
  }
  if (normalizedIndex === 4) {
    return {
      ...thoth,
      hebrew: 'TZADDI (צ)',
      gematria: 90,
      reference: 'BOOK OF THOTH · CROWLEY HEH/TZADDI REVISION',
    };
  }
  if (normalizedIndex === 17) {
    return {
      ...thoth,
      hebrew: 'HEH (ה)',
      gematria: 5,
      reference: 'BOOK OF THOTH · CROWLEY HEH/TZADDI REVISION',
    };
  }
  return thoth;
};

const cleanText = (value, fallback, maximum = 120) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return (text || fallback).slice(0, maximum);
};

const normalizeElement = value => {
  const candidate = String(value || '').trim().toUpperCase();
  return ['FIRE', 'WATER', 'AIR', 'EARTH', 'SPIRIT'].includes(candidate) ? candidate : 'SPIRIT';
};

const normalizeStage = value => {
  const candidate = String(value || '').trim().toUpperCase().replace(/[^A-Z ]/g, '');
  return ['PRIMA MATERIA', 'NIGREDO', 'ALBEDO', 'CITRINITAS', 'RUBEDO', 'CONIUNCTIO'].includes(candidate)
    ? candidate
    : 'PRIMA MATERIA';
};

export const lockTarotReferenceMeta = (index, tradition, interpretiveMeta = {}) => {
  const reference = getTarotReference(index, tradition);
  const suppliedElement = interpretiveMeta.symbolicElement || interpretiveMeta.element;
  return {
    reference: reference.reference,
    inherited: reference.inherited,
    hebrew: reference.hebrew,
    attribution: reference.attribution,
    ...(reference.gematria === null ? {} : { gematria: reference.gematria }),
    symbolicElement: normalizeElement(suppliedElement),
    alchemical: normalizeStage(interpretiveMeta.alchemical),
    daimon: cleanText(interpretiveMeta.daimon, 'MNEMONIC INTELLIGENCE', 72),
    operation: cleanText(interpretiveMeta.operation, 'CONTEMPLATE, TEST, AND EMBODY', 120),
    validation: 'INHERITED REFERENCE LOCKED',
  };
};
