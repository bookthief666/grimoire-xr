import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
import { ATMOSPHERE_MODES } from './vrContent.js';

export const SPATIAL_COMPOSER_STAGES = Object.freeze([
  { id: 'subject', glyph: '☿', planet: 'MERCURY', title: 'THE NAMING MIRROR' },
  { id: 'tradition', glyph: '♄', planet: 'SATURN', title: 'THE WHEEL OF LINEAGES' },
  { id: 'aesthetic', glyph: '♀', planet: 'VENUS', title: 'THE SEVENFOLD LOOM' },
  { id: 'eros', glyph: '△', planet: 'BABALON', title: 'THE EROS FURNACE' },
  { id: 'intellect', glyph: '☉', planet: 'SOL', title: 'THE THREE LAMPS' },
  { id: 'atmosphere', glyph: '☾', planet: 'LUNA', title: 'ASTRAL WEATHER' },
  { id: 'review', glyph: '✶', planet: 'MONAD', title: 'THE CENTRAL SEAL' },
]);

const normalizeText = value => String(value || '').trim().replace(/\s+/g, ' ');

export const wrapIndex = (index, length) => {
  const size = Math.max(0, Math.floor(Number(length) || 0));
  if (!size) return 0;
  const numeric = Math.trunc(Number(index) || 0);
  return ((numeric % size) + size) % size;
};

const safeIndex = (index, entries, fallback = 0) => {
  if (!Array.isArray(entries) || !entries.length) return 0;
  const numeric = Number(index);
  if (!Number.isFinite(numeric)) return wrapIndex(fallback, entries.length);
  return wrapIndex(numeric, entries.length);
};

const familyId = category => normalizeText(category)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const groupArtStyles = (styles = ART_STYLES) => {
  const groups = new Map();
  (Array.isArray(styles) ? styles : []).forEach((style, index) => {
    const label = normalizeText(style?.cat) || 'UNCATEGORIZED';
    if (!groups.has(label)) {
      groups.set(label, {
        id: familyId(label) || 'uncategorized',
        label,
        styles: [],
      });
    }
    groups.get(label).styles.push({ ...style, catalogIndex: index });
  });
  return Array.from(groups.values());
};

export const ART_STYLE_FAMILIES = Object.freeze(groupArtStyles().map(family => Object.freeze({
  ...family,
  styles: Object.freeze(family.styles.map(style => Object.freeze(style))),
})));

export const normalizeComposerIndices = (value = {}) => ({
  traditionIndex: safeIndex(value.traditionIndex, TRADITIONS),
  styleIndex: safeIndex(value.styleIndex, ART_STYLES),
  erosIndex: safeIndex(value.erosIndex, EROS_LEVELS),
  techIndex: safeIndex(value.techIndex ?? 1, TECH_LEVELS, 1),
  atmosphereIndex: safeIndex(
    value.atmosphereIndex
      ?? ATMOSPHERE_MODES.findIndex(entry => entry.id === value.atmosphereMode),
    ATMOSPHERE_MODES,
  ),
});

export const getStyleFamilyForIndex = (styleIndex, families = ART_STYLE_FAMILIES) => {
  const normalizedStyleIndex = safeIndex(styleIndex, ART_STYLES);
  return families.find(family => family.styles.some(style => style.catalogIndex === normalizedStyleIndex))
    || families[0]
    || null;
};

export const getChoiceWindow = (entries, selectedIndex) => {
  if (!Array.isArray(entries) || !entries.length) {
    return { previous: null, current: null, next: null, selectedIndex: 0 };
  }
  const currentIndex = safeIndex(selectedIndex, entries);
  return {
    previous: entries[wrapIndex(currentIndex - 1, entries.length)],
    current: entries[currentIndex],
    next: entries[wrapIndex(currentIndex + 1, entries.length)],
    selectedIndex: currentIndex,
  };
};

export const navigateComposer = ({ stageIndex = 0, aestheticMode = 'family' } = {}, direction = 1) => {
  const lastStageIndex = SPATIAL_COMPOSER_STAGES.length - 1;
  const currentStageIndex = Math.min(lastStageIndex, Math.max(0, Math.trunc(Number(stageIndex) || 0)));
  const step = Number(direction) < 0 ? -1 : 1;
  const nextStageIndex = Math.min(lastStageIndex, Math.max(0, currentStageIndex + step));
  return {
    stageIndex: nextStageIndex,
    aestheticMode: nextStageIndex === 2 ? 'style' : 'family',
  };
};

export const selectComposerStage = stageIndex => {
  const lastStageIndex = SPATIAL_COMPOSER_STAGES.length - 1;
  const nextStageIndex = Math.min(lastStageIndex, Math.max(0, Math.trunc(Number(stageIndex) || 0)));
  return {
    stageIndex: nextStageIndex,
    aestheticMode: nextStageIndex === 2 ? 'style' : 'family',
  };
};

// FNV-1a over Unicode code points. The result is stable across sessions and
// deliberately contains no personal data beyond a non-reversible 32-bit seed.
export const hashSubject = subject => {
  let hash = 0x811c9dc5;
  for (const character of normalizeText(subject).normalize('NFKC')) {
    let codePoint = character.codePointAt(0);
    do {
      hash ^= codePoint & 0xff;
      hash = Math.imul(hash, 0x01000193);
      codePoint >>>= 8;
    } while (codePoint > 0);
  }
  return hash >>> 0;
};

const unitFromSeed = (seed, shift) => ((seed >>> shift) & 0xff) / 255;

export const buildEffigyParameters = (value = {}) => {
  const subject = normalizeText(value.subject);
  const indices = normalizeComposerIndices(value);
  const seed = hashSubject(subject || 'THE UNREMEMBERED NAME');
  const tradition = TRADITIONS[indices.traditionIndex];
  const style = ART_STYLES[indices.styleIndex];
  const eros = EROS_LEVELS[indices.erosIndex];
  const intellect = TECH_LEVELS[indices.techIndex];
  const family = getStyleFamilyForIndex(indices.styleIndex);
  return Object.freeze({
    seed,
    subject,
    coreSides: 3 + (seed % 6),
    lineCount: 7 + ((seed >>> 4) % 6),
    axisScale: Object.freeze([
      0.78 + unitFromSeed(seed, 0) * 0.42,
      0.92 + unitFromSeed(seed, 8) * 0.5,
      0.72 + unitFromSeed(seed, 16) * 0.46,
    ]),
    asymmetry: (unitFromSeed(seed, 24) - 0.5) * 0.24,
    phase: (seed / 0xffffffff) * Math.PI * 2,
    traditionId: tradition.id,
    orbitInclination: -0.42 + (indices.traditionIndex / Math.max(1, TRADITIONS.length - 1)) * 0.84,
    aestheticId: style.id,
    aestheticFamilyId: family?.id || 'uncategorized',
    erosLevel: eros.level,
    pulseAmplitude: 0.018 + eros.level * 0.014,
    inscriptionLayers: intellect.level + 1,
    atmosphereMode: ATMOSPHERE_MODES[indices.atmosphereIndex].id,
  });
};

export const getAwakenReadiness = ({ subject, demoMode = false, health, busy = false } = {}) => {
  if (busy) return { ready: false, code: 'busy', reason: 'AN OPERATION IS ALREADY IN PROGRESS' };
  if (!normalizeText(subject)) return { ready: false, code: 'subject', reason: 'NAME A SUBJECT BEFORE AWAKENING' };
  if (demoMode) return { ready: true, code: 'demo', reason: 'DEMO CURRENT READY' };
  if (!health) return { ready: false, code: 'checking', reason: 'CHECKING THE LOCAL INTELLIGENCE' };
  if (!health.textConfigured) {
    return { ready: false, code: 'text-provider', reason: 'A TEXT PROVIDER IS REQUIRED TO AWAKEN THE GRIMOIRE' };
  }
  return { ready: true, code: 'live', reason: 'LOCAL INTELLIGENCE READY' };
};

export const buildComposerSnapshot = (value = {}) => {
  const subject = normalizeText(value.subject);
  const indices = normalizeComposerIndices(value);
  const tradition = TRADITIONS[indices.traditionIndex];
  const style = ART_STYLES[indices.styleIndex];
  const eros = EROS_LEVELS[indices.erosIndex];
  const intellect = TECH_LEVELS[indices.techIndex];
  const atmosphere = ATMOSPHERE_MODES[indices.atmosphereIndex];
  const family = getStyleFamilyForIndex(indices.styleIndex);
  const readiness = getAwakenReadiness(value);
  return Object.freeze({
    subject,
    indices: Object.freeze(indices),
    tradition: Object.freeze({ id: tradition.id, name: tradition.name, description: tradition.desc }),
    aesthetic: Object.freeze({
      id: style.id,
      name: style.name,
      familyId: family?.id || 'uncategorized',
      family: family?.label || 'UNCATEGORIZED',
    }),
    eros: Object.freeze({ level: eros.level, label: eros.label }),
    intellect: Object.freeze({ level: intellect.level, label: intellect.label, description: intellect.desc }),
    atmosphere: Object.freeze({ id: atmosphere.id, label: atmosphere.label }),
    operationMode: value.demoMode ? 'provider-free-demo' : 'live-local-ai',
    textReady: value.demoMode || Boolean(value.health?.textConfigured),
    imageReady: value.demoMode || Boolean(value.health?.imageConfigured),
    readiness: Object.freeze(readiness),
  });
};
