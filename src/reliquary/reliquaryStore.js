import {
  createIndexedDbImageStore,
  extractEmbeddedImages,
  hydrateImageReferences,
  normalizePersistedState,
} from '../persistence/grimoireStore.js';

export const RELIQUARY_SCHEMA_ID = 'grimoire.xr.reliquary';
export const RELIQUARY_SCHEMA_VERSION = 1;
export const RELIQUARY_STORAGE_KEY = 'grimoire_xr_reliquary_v1';
export const RELIQUARY_MAX_ENTRIES = 64;

const clonePlain = value => {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clonePlain);
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clonePlain(nested)]));
};

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const canonicalIdentityOf = card => card?.canonicalCardId || card?.id || null;

const fnvAddress = value => {
  const text = String(value || '');
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

const relationType = relation => clean(relation?.relationType || relation?.type || 'UNSPECIFIED').toUpperCase();
const preferLayer = (current, saved) => current !== null && current !== undefined && current !== '' ? current : saved;

const mergeLiveRelicLayer = (saved, current) => {
  if (!current) return saved;
  const merged = { ...saved, ...current };
  const layeredKeys = [
    'imageUrl', 'exegesis', 'meta', 'visual', 'promptUsed', 'promptSchema', 'generation',
    'exegesisAuthority', 'interpretiveMetaAuthority', 'visualAuthority',
  ];
  for (const key of layeredKeys) merged[key] = preferLayer(current[key], saved?.[key]);
  merged.patina = Math.max(Number(saved?.patina || 0), Number(current?.patina || 0));
  return merged;
};

export const buildReliquaryMetadata = state => {
  const reading = state?.reading || null;
  const record = reading?.readingRecord || null;
  if (!record) throw new Error('A kept reading requires a canonical ReadingRecord.');

  const positions = Array.isArray(record.positions) ? record.positions : [];
  const cards = Array.isArray(reading.cards) ? reading.cards : [];
  const relationTypes = (record.relations || []).map(relationType);
  const outer = (record.spreadPatterns || []).find(pattern => pattern?.patternKind === 'OUTER_PAIR_CONTEXT') || null;
  const center = (record.spreadPatterns || []).find(pattern => pattern?.patternKind === 'CENTER_CONTEXT_EFFECT') || null;
  const contract = reading.semanticContract || null;
  const question = clean(record.input?.question || state.oracleQuestion);
  const positionCardIds = positions.map(position => position.cardId || null);
  const positionTitles = positions.map((position, index) => clean(cards[index]?.name || position.cardId || `Position ${index + 1}`));
  const fingerprint = JSON.stringify({
    question,
    spreadId: record.spreadId || null,
    positionCardIds,
    orientation: positions.map(position => position.orientation || 'upright'),
    contract: contract?.commit || contract?.contractVersion || null,
  });

  return Object.freeze({
    entryId: `reading-${fnvAddress(fingerprint)}`,
    question,
    author: clean(state.author),
    spreadId: record.spreadId || null,
    tarotSystem: record.input?.tarotSystem || null,
    positionCardIds: Object.freeze([...positionCardIds]),
    positionTitles: Object.freeze([...positionTitles]),
    relationTypes: Object.freeze([...relationTypes]),
    outerRelationType: outer ? relationType(outer) : null,
    centerEffectApplied: Boolean(center?.applied),
    interpretationPresent: Boolean(clean(reading.answer)),
    artworkCount: cards.filter(card => Boolean(card?.imageUrl)).length,
    contract: contract ? Object.freeze({
      contractId: contract.contractId || null,
      contractVersion: contract.contractVersion || null,
      commit: contract.commit || null,
    }) : null,
  });
};

export const buildReliquarySnapshot = state => {
  const normalized = normalizePersistedState(clonePlain(state));
  if (!normalized.reading?.readingRecord) throw new Error('A kept reading requires a canonical ReadingRecord.');

  const deckById = new Map((Array.isArray(normalized.deck) ? normalized.deck : []).map(card => [canonicalIdentityOf(card), card]));
  const readingCards = (Array.isArray(normalized.reading.cards) ? normalized.reading.cards : []).map(card => {
    const current = deckById.get(canonicalIdentityOf(card));
    return mergeLiveRelicLayer(card, current);
  });
  const reading = {
    ...normalized.reading,
    cards: readingCards,
  };

  return normalizePersistedState({
    phase: 'ORACLE',
    author: normalized.author || '',
    selectedStyle: normalized.selectedStyle || null,
    selectedTradition: normalized.selectedTradition || null,
    erosLevel: normalized.erosLevel ?? 0,
    techLevel: normalized.techLevel ?? 1,
    oracleQuestion: reading.readingRecord?.input?.question || normalized.oracleQuestion || '',
    reading,
    activeSpread: normalized.activeSpread || 'TRIAD',
    spreadSlots: [null, null, null],
    placementCardId: null,
    scriptoriumMode: 'DECK',
  });
};

export const buildReliquaryEntry = ({ state, savedAt = new Date().toISOString() } = {}) => {
  const snapshot = buildReliquarySnapshot(state);
  const metadata = buildReliquaryMetadata(snapshot);
  const extracted = extractEmbeddedImages(snapshot);
  return {
    entry: Object.freeze({
      entryId: metadata.entryId,
      savedAt,
      metadata,
      state: extracted.value,
    }),
    images: extracted.images,
  };
};

export const emptyReliquaryEnvelope = () => ({
  schemaId: RELIQUARY_SCHEMA_ID,
  schemaVersion: RELIQUARY_SCHEMA_VERSION,
  updatedAt: new Date(0).toISOString(),
  entries: [],
});

export const parseReliquaryEnvelope = input => {
  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch {
      throw new Error('Reliquary index is not valid JSON.');
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Reliquary index is not an object.');
  if (parsed.schemaId !== RELIQUARY_SCHEMA_ID || parsed.schemaVersion !== RELIQUARY_SCHEMA_VERSION) {
    throw new Error(`Unsupported Reliquary schema: ${String(parsed.schemaId || 'unknown')}@${String(parsed.schemaVersion ?? 'unknown')}`);
  }
  if (!Array.isArray(parsed.entries)) throw new Error('Reliquary index contains no entries array.');
  return {
    schemaId: RELIQUARY_SCHEMA_ID,
    schemaVersion: RELIQUARY_SCHEMA_VERSION,
    updatedAt: parsed.updatedAt || new Date(0).toISOString(),
    entries: parsed.entries.filter(entry => entry && typeof entry === 'object' && entry.entryId && entry.state && entry.metadata),
  };
};

const readEnvelope = storage => {
  if (!storage?.getItem) throw new Error('Web storage is unavailable.');
  const text = storage.getItem(RELIQUARY_STORAGE_KEY);
  if (!text) return emptyReliquaryEnvelope();
  return parseReliquaryEnvelope(text);
};

const writeEnvelope = (storage, envelope) => {
  if (!storage?.setItem) throw new Error('Web storage is unavailable.');
  const text = JSON.stringify(envelope);
  if (/data:image\//i.test(text)) throw new Error('Reliquary invariant violated: embedded image data reached localStorage.');
  storage.setItem(RELIQUARY_STORAGE_KEY, text);
};

export const saveReliquaryReading = async ({
  state,
  storage = globalThis.localStorage,
  imageStore = createIndexedDbImageStore(),
  savedAt = new Date().toISOString(),
} = {}) => {
  const { entry, images } = buildReliquaryEntry({ state, savedAt });
  let envelope;
  try {
    envelope = readEnvelope(storage);
  } catch (error) {
    return { status: 'FAILED', saved: false, error: `RELIQUARY_READ_FAILED:${error?.message || 'unknown error'}` };
  }

  const warnings = [];
  try {
    await imageStore.putMany(images);
  } catch (error) {
    warnings.push(`IMAGE_STORE_UNAVAILABLE:${error?.message || 'unknown error'}`);
  }

  const entries = [entry, ...envelope.entries.filter(existing => existing.entryId !== entry.entryId)]
    .slice(0, RELIQUARY_MAX_ENTRIES);
  const next = {
    schemaId: RELIQUARY_SCHEMA_ID,
    schemaVersion: RELIQUARY_SCHEMA_VERSION,
    updatedAt: savedAt,
    entries,
  };
  try {
    writeEnvelope(storage, next);
  } catch (error) {
    return { status: 'FAILED', saved: false, error: `RELIQUARY_WRITE_FAILED:${error?.message || 'unknown error'}`, warnings };
  }
  return {
    status: warnings.length ? 'SAVED_WITH_WARNINGS' : 'SAVED',
    saved: true,
    entry,
    imageCount: images.length,
    warnings,
  };
};

export const loadReliquary = async ({
  storage = globalThis.localStorage,
  imageStore = createIndexedDbImageStore(),
} = {}) => {
  let envelope;
  try {
    envelope = readEnvelope(storage);
  } catch (error) {
    return { status: 'CORRUPT', entries: [], error: error.message, missingImages: [] };
  }

  const hydratedEntries = [];
  const missingImages = [];
  for (const entry of envelope.entries) {
    const hydrated = await hydrateImageReferences(entry.state, key => imageStore.get(key));
    missingImages.push(...hydrated.missingImages);
    hydratedEntries.push({
      ...entry,
      state: normalizePersistedState(hydrated.value),
    });
  }

  return {
    status: missingImages.length ? 'RESTORED_WITH_MISSING_IMAGES' : 'RESTORED',
    entries: hydratedEntries,
    updatedAt: envelope.updatedAt,
    missingImages: [...new Set(missingImages)],
  };
};

export const removeReliquaryEntry = async ({
  entryId,
  storage = globalThis.localStorage,
} = {}) => {
  let envelope;
  try {
    envelope = readEnvelope(storage);
    const entries = envelope.entries.filter(entry => entry.entryId !== entryId);
    writeEnvelope(storage, { ...envelope, updatedAt: new Date().toISOString(), entries });
    return { status: 'REMOVED', removed: entries.length !== envelope.entries.length };
  } catch (error) {
    return { status: 'FAILED', removed: false, error: error.message };
  }
};
