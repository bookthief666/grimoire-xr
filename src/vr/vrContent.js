export const VR_PALETTE = {
  void: '#020102',
  ink: '#080405',
  stone: '#18080c',
  stoneLight: '#2a0d12',
  violet: '#7b2cbf',
  magenta: '#d72f8b',
  teal: '#35c6b4',
  gold: '#d6b45b',
  brass: '#b8860b',
  moon: '#c7d2df',
  blood: '#ef233c',
  bone: '#f5ead7',
};

export const PLANETARY_STATIONS = [
  {
    id: 'archive',
    planet: 'LUNA',
    glyph: '☾',
    title: 'THE LIVING ARCHIVE',
    subtitle: 'Mnemosyne remembers what the self forgets',
    color: VR_PALETTE.moon,
    concept: 'MNEMOSYNE',
  },
  {
    id: 'scriptorium',
    planet: 'MERCURY',
    glyph: '☿',
    title: 'THE SCRIPTORIUM',
    subtitle: 'The dossier becomes a chamber of thought',
    color: VR_PALETTE.teal,
    concept: 'GNOSIS',
  },
  {
    id: 'loom',
    planet: 'VENUS',
    glyph: '♀',
    title: 'THE AESTHETIC LOOM',
    subtitle: 'Style is bound to desire without becoming an idol',
    color: VR_PALETTE.magenta,
    concept: 'EROS',
  },
  {
    id: 'genius',
    planet: 'SOL',
    glyph: '☉',
    title: 'THE GENIUS GATE',
    subtitle: 'The ruling image turns toward its source',
    color: VR_PALETTE.gold,
    concept: 'GENIUS',
  },
  {
    id: 'forge',
    planet: 'MARS',
    glyph: '♂',
    title: 'THE CARD FORGE',
    subtitle: 'A shadow of an idea receives a body',
    color: VR_PALETTE.blood,
    concept: 'WILL',
  },
  {
    id: 'oracle',
    planet: 'JUPITER',
    glyph: '♃',
    title: 'THE ORACLE',
    subtitle: 'Three voices arrange themselves around a question',
    color: '#ad83ff',
    concept: 'SYNTHESIS',
  },
  {
    id: 'spirit',
    planet: 'SATURN',
    glyph: '♄',
    title: 'THE SPIRIT BOX',
    subtitle: 'The archive answers from beyond the threshold',
    color: '#8e73b8',
    concept: 'SHADOW',
  },
];

// Backward-compatible display exports now derive from the complete catalog
// used by the original 2D Grimoire. XR no longer maintains a reduced list.
export const VR_TRADITIONS = TRADITIONS.map(entry => entry.name);
export const VR_STYLES = ART_STYLES.map(entry => entry.name);
export const EROS_MODES = EROS_LEVELS;
export const VR_TECH_LEVELS = TECH_LEVELS;

export const VR_SPREADS = [
  { id: 'TRIAD', count: 3, label: 'THESIS · ANTITHESIS · BOND' },
  { id: 'HEXAGRAM', count: 6, label: 'SIXFOLD PLANETARY FIELD' },
  { id: 'CROSS', count: 10, label: 'TEN-STATION QABALISTIC CROSS' },
];

export const ATMOSPHERE_MODES = [
  { id: 'adaptive', label: 'ADAPTIVE CURRENT' },
  { id: 'vivid', label: 'VIVID CURRENT' },
  { id: 'balanced', label: 'BALANCED CURRENT' },
  { id: 'veiled', label: 'VEILED CURRENT' },
  { id: 'off', label: 'CURRENT SILENCED' },
];

export const resolveAtmosphereTier = ({ mode = 'adaptive', fps = 0, inXR = false, mobile = false } = {}) => {
  if (mode === 'off') return 0;
  if (mode === 'veiled') return 1;
  if (mode === 'balanced') return 2;
  if (mode === 'vivid') return 3;
  const measuredFps = Number(fps) || 0;
  if (measuredFps > 0 && measuredFps < (inXR ? 55 : 48)) return 1;
  if (mobile && !inXR) return 2;
  return inXR ? 2 : 3;
};

const MAJOR_ARCANA = [
  'THE FOOL', 'THE MAGICIAN', 'THE HIGH PRIESTESS', 'THE EMPRESS', 'THE EMPEROR',
  'THE HIEROPHANT', 'THE LOVERS', 'THE CHARIOT', 'STRENGTH', 'THE HERMIT',
  'THE WHEEL', 'JUSTICE', 'THE HANGED ONE', 'DEATH', 'TEMPERANCE', 'THE DEVIL',
  'THE TOWER', 'THE STAR', 'THE MOON', 'THE SUN', 'JUDGEMENT', 'THE WORLD',
];
const SUITS = ['WANDS', 'CUPS', 'SWORDS', 'PENTACLES'];
const RANKS = ['ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'PAGE', 'KNIGHT', 'QUEEN', 'KING'];

export const TAROT_ARCHETYPES = [
  ...MAJOR_ARCANA.map((name, index) => ({
    name,
    arcana: 'MAJOR',
    suit: '',
    rank: String(index),
  })),
  ...SUITS.flatMap(suit => RANKS.map(rank => ({
    name: `${rank} OF ${suit}`,
    arcana: 'MINOR',
    suit,
    rank,
  }))),
].map((card, index) => ({
  ...card,
  planet: PLANETARY_STATIONS[index % PLANETARY_STATIONS.length].planet,
  oracle: `What operation does ${card.name} require?`,
}));

const hashText = value => {
  let hash = 2166136261;
  for (const character of String(value || 'ORACLE')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const selectSpreadCards = (cards, count, seed) => {
  const source = Array.isArray(cards) ? [...cards] : [];
  let state = hashText(seed);
  for (let index = source.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const target = state % (index + 1);
    [source[index], source[target]] = [source[target], source[index]];
  }
  return source.slice(0, Math.max(0, Math.min(Number(count) || 0, source.length)));
};

export const placeSpreadCard = (slots, slotIndex, cardId) => {
  const next = Array.isArray(slots) ? [...slots] : [];
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= next.length) return next;
  if (!Number.isInteger(cardId)) {
    next[slotIndex] = null;
    return next;
  }
  for (let index = 0; index < next.length; index += 1) {
    if (next[index] === cardId) next[index] = null;
  }
  next[slotIndex] = cardId;
  return next;
};

export const selectForgeTargets = (cards, forgedDeck, startIndex = 0, limit = Infinity) => {
  const source = Array.isArray(cards) ? cards : [];
  if (!source.length) return [];
  const normalizedStart = ((Number(startIndex) || 0) % source.length + source.length) % source.length;
  const ordered = [...source.slice(normalizedStart), ...source.slice(0, normalizedStart)];
  const forgedById = new Map((Array.isArray(forgedDeck) ? forgedDeck : []).map(card => [card.id, card]));
  const maximum = Number.isFinite(limit) ? Math.max(0, Number(limit) || 0) : ordered.length;
  return ordered.filter(card => !forgedById.get(card.id)?.imageUrl).slice(0, maximum);
};

// Keep every court in the forward sanctuary. The earlier full circle placed a
// gate between the desktop camera (and the standing XR origin) and the altar,
// which made the arches read as giant headphones and exposed mirrored labels
// when orbiting. This shallow rear apse preserves a readable ritual theatre.
export const buildStationPose = index => {
  const maximumIndex = Math.max(1, PLANETARY_STATIONS.length - 1);
  const normalizedIndex = Math.min(Math.max(Number(index) || 0, 0), maximumIndex) / maximumIndex;
  const angle = Math.PI - 1.15 + normalizedIndex * 2.3;
  const radius = 4.75;
  return {
    position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius - 0.25],
    rotation: [0, angle + Math.PI, 0],
  };
};

export const PALACE_STATE_VERSION = 3;

export const PROTOTYPE_MEMORY = {
  dossier: 'The Atrium is awake but has not yet received a subject. Name the intelligence, philosopher, artist, deity, or living question whose shadows you wish to arrange. The seven courts will then divide its powers among memory, language, desire, genius, will, synthesis, and shadow.',
  geniusTitle: 'THE UNREMEMBERED NAME',
  geniusCharge: 'What is remembered here must become an instrument of transformation.',
  sealWords: ['MEMORY', 'EROS', 'IMAGE', 'WILL', 'SHADOW', 'GNOSIS', 'GENIUS'],
  cards: [
    { name: 'THE UNREMEMBERED NAME', planet: 'SOL', oracle: 'What seeks a body through me?' },
  ],
  questions: [
    'What seeks a body through me?',
    'Which image has become an idol?',
    'What must memory transform into will?',
  ],
};

export const truncateForPanel = (value, maximum = 760) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maximum) return text;
  return `${text.slice(0, Math.max(0, maximum - 1)).trimEnd()}…`;
};

export const normalizeRitual = (value, subject) => {
  const sourceCards = Array.isArray(value?.cards) ? value.cards : [];
  return {
    dossier: truncateForPanel(value?.dossier || `No dossier was returned for ${subject}.`),
    geniusTitle: truncateForPanel(value?.geniusTitle || `THE GENIUS OF ${subject}`, 72),
    geniusCharge: truncateForPanel(value?.geniusCharge || 'Remember, arrange, embody.', 180),
    sealWords: Array.isArray(value?.sealWords) && value.sealWords.length
      ? value.sealWords.slice(0, 7).map(word => truncateForPanel(word, 20).toUpperCase())
      : PROTOTYPE_MEMORY.sealWords,
    cards: TAROT_ARCHETYPES.map((archetype, index) => {
      const card = sourceCards[index] || {};
      return {
        id: index,
        name: truncateForPanel(card?.name || archetype.name, 72),
        arcana: truncateForPanel(card?.arcana || archetype.arcana, 20),
        suit: truncateForPanel(card?.suit || archetype.suit, 20),
        rank: truncateForPanel(card?.rank || archetype.rank, 20),
        planet: truncateForPanel(card?.planet || archetype.planet, 20),
        oracle: truncateForPanel(card?.oracle || archetype.oracle, 180),
      };
    }),
    questions: Array.isArray(value?.questions) && value.questions.length
      ? value.questions.slice(0, 3).map(question => truncateForPanel(question, 180))
      : PROTOTYPE_MEMORY.questions,
  };
};

export const buildSealPoints = seed => {
  const source = String(seed || 'MONAD');
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const points = [];
  for (let index = 0; index < 9; index += 1) {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    const angle = ((hash >>> 0) / 4294967295) * Math.PI * 2;
    const radius = index === 0 ? 0 : 0.22 + (((hash >>> 9) & 255) / 255) * 0.68;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
  }
  points.push(points[0]);
  return points;
};

const clampIndex = (value, maximum) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), Math.max(0, maximum - 1));
};

const normalizeForgedCard = value => {
  if (!value || typeof value !== 'object') return null;
  const sourceMeta = value.meta && typeof value.meta === 'object' ? value.meta : {};
  return {
    id: Math.max(0, Number.isInteger(value.id) ? value.id : 0),
    name: truncateForPanel(value.name || 'THE UNNAMED ARCANUM', 72),
    exegesis: truncateForPanel(value.exegesis || 'No exegesis was preserved.', 620),
    visual: truncateForPanel(value.visual || value.name || 'A symbolic arcanum.', 460),
    meta: {
      planet: truncateForPanel(sourceMeta.planet, 24),
      element: truncateForPanel(sourceMeta.element, 24),
      operation: truncateForPanel(sourceMeta.operation, 120),
    },
    patina: Math.max(0, Number.isFinite(Number(value.patina)) ? Number(value.patina) : 0),
    // Generated image data can exceed browser storage quotas. The image is
    // always manifested explicitly again when a restored palace needs it.
    imageUrl: null,
  };
};

const normalizeForgedDeck = value => (Array.isArray(value) ? value : [])
  .map(normalizeForgedCard)
  .filter(Boolean)
  .slice(0, TAROT_ARCHETYPES.length);

const normalizeSpiritMessages = value => (Array.isArray(value) ? value : [])
  .filter(message => message && ['user', 'ai', 'system'].includes(message.role))
  .map(message => ({
    role: message.role,
    text: truncateForPanel(message.text, 700),
  }))
  .slice(-24);

export const createPalaceSnapshot = value => ({
  version: PALACE_STATE_VERSION,
  subject: truncateForPanel(value.subject || 'Giordano Bruno', 120),
  traditionIndex: clampIndex(value.traditionIndex, VR_TRADITIONS.length),
  styleIndex: clampIndex(value.styleIndex, VR_STYLES.length),
  erosIndex: clampIndex(value.erosIndex, EROS_MODES.length),
  techIndex: clampIndex(value.techIndex ?? 1, VR_TECH_LEVELS.length),
  spreadIndex: clampIndex(value.spreadIndex, VR_SPREADS.length),
  ritual: normalizeRitual(value.ritual, value.subject || 'the subject'),
  awakened: Boolean(value.awakened),
  forgedCard: normalizeForgedCard(value.forgedCard),
  forgedDeck: normalizeForgedDeck(value.forgedDeck),
  cardIndex: Math.max(0, Number.isInteger(value.cardIndex) ? value.cardIndex : 0),
  oracleQuestion: truncateForPanel(value.oracleQuestion, 240),
  oracleAnswer: truncateForPanel(value.oracleAnswer, 700),
  oracleCards: (Array.isArray(value.oracleCards) ? value.oracleCards : []).slice(0, 10).map(card => ({
    id: Math.max(0, Number.isInteger(card?.id) ? card.id : 0),
    name: truncateForPanel(card?.name, 72),
  })),
  spiritAnswer: truncateForPanel(value.spiritAnswer, 700),
  spiritMessages: normalizeSpiritMessages(value.spiritMessages),
  completedCourtIds: [...new Set(Array.isArray(value.completedCourtIds)
    ? value.completedCourtIds.filter(id => PLANETARY_STATIONS.some(station => station.id === id))
    : [])],
});

export const restorePalaceSnapshot = rawValue => {
  if (!rawValue) return null;
  try {
    const value = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!value || value.version !== PALACE_STATE_VERSION) return null;
    return createPalaceSnapshot(value);
  } catch {
    return null;
  }
};
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
