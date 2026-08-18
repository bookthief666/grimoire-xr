export const AESTHETIC_STORAGE_KEY = 'grimoire_aesthetic_current_v1';
export const ENCHANTMENT_STORAGE_KEY = 'grimoire_enchantment_level_v1';
export const DEFAULT_AESTHETIC_CURRENT = 'ritual-hybrid';
export const DEFAULT_ENCHANTMENT_LEVEL = 'exalted';

export const AESTHETIC_CURRENTS = Object.freeze([
  Object.freeze({
    id: 'arcane-os',
    label: 'ARCANE OS',
    shortLabel: 'ARCANE',
    description: 'Accepted scarlet scanline / pixel-occult baseline. The dense electric Grimoire remains fully recoverable.',
    authority: 'PROJECT_AUTHORED_PRESENTATION_PROFILE_NOT_SOURCE_FACT',
  }),
  Object.freeze({
    id: 'ritual-hybrid',
    label: 'RITUAL HYBRID',
    shortLabel: 'RITUAL',
    description: 'Occult cyberpunk illuminated manuscript: scarlet current, brass canon, bone text, sigils, haze and ritual depth.',
    authority: 'PROJECT_AUTHORED_PRESENTATION_PROFILE_NOT_SOURCE_FACT',
  }),
  Object.freeze({
    id: 'living-book',
    label: 'LIVING BOOK',
    shortLabel: 'BOOK',
    description: 'Codex-forward manuscript space with brass inscription, ivory reading surfaces and restrained scarlet ritual fire.',
    authority: 'PROJECT_AUTHORED_PRESENTATION_PROFILE_NOT_SOURCE_FACT',
  }),
]);

export const ENCHANTMENT_LEVELS = Object.freeze([
  Object.freeze({ id: 'veiled', label: 'VEILED', density: 0.35, motion: 0.35 }),
  Object.freeze({ id: 'balanced', label: 'BALANCED', density: 0.62, motion: 0.62 }),
  Object.freeze({ id: 'vivid', label: 'VIVID', density: 0.82, motion: 0.82 }),
  Object.freeze({ id: 'exalted', label: 'EXALTED', density: 1, motion: 1 }),
]);

const CURRENT_ALIASES = Object.freeze({
  arcane: 'arcane-os',
  'arcane-os': 'arcane-os',
  os: 'arcane-os',
  ritual: 'ritual-hybrid',
  hybrid: 'ritual-hybrid',
  'ritual-hybrid': 'ritual-hybrid',
  book: 'living-book',
  codex: 'living-book',
  'living-book': 'living-book',
});

const ENCHANTMENT_ALIASES = Object.freeze({
  veil: 'veiled',
  veiled: 'veiled',
  balanced: 'balanced',
  vivid: 'vivid',
  exalted: 'exalted',
  max: 'exalted',
});

export const normalizeAestheticCurrent = value => {
  const key = String(value || '').trim().toLowerCase();
  return CURRENT_ALIASES[key] || DEFAULT_AESTHETIC_CURRENT;
};

export const normalizeEnchantmentLevel = value => {
  const key = String(value || '').trim().toLowerCase();
  return ENCHANTMENT_ALIASES[key] || DEFAULT_ENCHANTMENT_LEVEL;
};

export const getAestheticCurrent = value => {
  const id = normalizeAestheticCurrent(value);
  return AESTHETIC_CURRENTS.find(entry => entry.id === id)
    || AESTHETIC_CURRENTS.find(entry => entry.id === DEFAULT_AESTHETIC_CURRENT)
    || AESTHETIC_CURRENTS[0];
};

export const getEnchantmentLevel = value => {
  const id = normalizeEnchantmentLevel(value);
  return ENCHANTMENT_LEVELS.find(entry => entry.id === id)
    || ENCHANTMENT_LEVELS.find(entry => entry.id === DEFAULT_ENCHANTMENT_LEVEL)
    || ENCHANTMENT_LEVELS[0];
};

export const cycleAestheticCurrent = (current, direction = 1) => {
  const id = normalizeAestheticCurrent(current);
  const index = Math.max(0, AESTHETIC_CURRENTS.findIndex(entry => entry.id === id));
  const step = Number(direction) < 0 ? -1 : 1;
  return AESTHETIC_CURRENTS[(index + step + AESTHETIC_CURRENTS.length) % AESTHETIC_CURRENTS.length].id;
};

export const cycleEnchantmentLevel = (current, direction = 1) => {
  const id = normalizeEnchantmentLevel(current);
  const index = Math.max(0, ENCHANTMENT_LEVELS.findIndex(entry => entry.id === id));
  const step = Number(direction) < 0 ? -1 : 1;
  return ENCHANTMENT_LEVELS[(index + step + ENCHANTMENT_LEVELS.length) % ENCHANTMENT_LEVELS.length].id;
};

const safeRead = (storage, key) => {
  try {
    return storage?.getItem?.(key) || '';
  } catch {
    return '';
  }
};

export const resolveAestheticPreferences = ({ search = '', storage = null } = {}) => {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const queryCurrent = params.get('look') || params.get('aesthetic');
  const queryEnchantment = params.get('enchantment') || params.get('fx');
  const storedCurrent = safeRead(storage, AESTHETIC_STORAGE_KEY);
  const storedEnchantment = safeRead(storage, ENCHANTMENT_STORAGE_KEY);

  return Object.freeze({
    current: normalizeAestheticCurrent(queryCurrent || storedCurrent || DEFAULT_AESTHETIC_CURRENT),
    enchantment: normalizeEnchantmentLevel(queryEnchantment || storedEnchantment || DEFAULT_ENCHANTMENT_LEVEL),
    queryOverride: Boolean(queryCurrent || queryEnchantment),
  });
};

export const restoreAestheticPreferences = () => {
  if (typeof window === 'undefined') return resolveAestheticPreferences();
  return resolveAestheticPreferences({ search: window.location.search, storage: window.localStorage });
};

export const persistAestheticPreferences = ({ current, enchantment }, storage = null) => {
  const target = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!target?.setItem) return false;
  try {
    target.setItem(AESTHETIC_STORAGE_KEY, normalizeAestheticCurrent(current));
    target.setItem(ENCHANTMENT_STORAGE_KEY, normalizeEnchantmentLevel(enchantment));
    return true;
  } catch {
    return false;
  }
};
