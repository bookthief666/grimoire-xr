export const GRIMOIRE_SESSION_SCHEMA_ID = 'grimoire.xr.session';
export const GRIMOIRE_SESSION_SCHEMA_VERSION = 1;
export const GRIMOIRE_SESSION_STORAGE_KEY = 'grimoire_xr_session_v1';
export const GRIMOIRE_IMAGE_DB_NAME = 'grimoire-xr-continuity';
export const GRIMOIRE_IMAGE_DB_VERSION = 1;
export const GRIMOIRE_IMAGE_STORE_NAME = 'images';
export const GRIMOIRE_IMAGE_REFERENCE_PREFIX = 'grimoire-image://';

const TRANSIENT_STATE_DEFAULTS = Object.freeze({
  isForging: false,
  isConsulting: false,
  isSpiritTyping: false,
  isStatsOpen: false,
  isSpiritBoxOpen: false,
  archiveState: 'IDLE',
  archiveProgress: Object.freeze({ current: 0, total: 0, msg: '' }),
  reforgeStatus: '',
  error: null,
  errorMessage: '',
  placementCardId: null,
});

const clonePlain = value => {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clonePlain);
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, clonePlain(nested)]));
};

const isEmbeddedImage = value => typeof value === 'string' && /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
const isImageReference = value => typeof value === 'string' && value.startsWith(GRIMOIRE_IMAGE_REFERENCE_PREFIX);

const imageKey = dataUrl => {
  // Deterministic FNV-1a + byte length. This is an address, not a security hash.
  let hash = 0x811c9dc5;
  for (let index = 0; index < dataUrl.length; index += 1) {
    hash ^= dataUrl.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `v1-${hash.toString(16).padStart(8, '0')}-${dataUrl.length}`;
};

export const normalizePersistedState = input => {
  const state = clonePlain(input && typeof input === 'object' ? input : {});
  const phase = state.phase === 'RITUAL'
    ? (Array.isArray(state.deck) && state.deck.length ? 'SCRIPTORIUM' : 'LANDING')
    : state.phase;

  return {
    ...state,
    ...TRANSIENT_STATE_DEFAULTS,
    archiveProgress: { ...TRANSIENT_STATE_DEFAULTS.archiveProgress },
    phase: phase || 'LANDING',
  };
};

export const hasMeaningfulGrimoireSession = state => Boolean(
  state
  && (
    (Array.isArray(state.deck) && state.deck.length > 0)
    || state.dossier
    || state.reading
    || state.portrait
    || (Array.isArray(state.spiritChat) && state.spiritChat.length > 1)
    || (typeof state.author === 'string' && state.author.trim() && state.phase !== 'LANDING')
  )
);

export const shouldPersistGrimoireSession = state => Boolean(
  hasMeaningfulGrimoireSession(state)
  && state.phase !== 'RITUAL'
  && !state.isForging
  && !state.isConsulting
  && state.archiveState !== 'COMPILING'
);

export const extractEmbeddedImages = input => {
  const images = new Map();

  const walk = value => {
    if (isEmbeddedImage(value)) {
      const key = imageKey(value);
      if (!images.has(key)) images.set(key, { key, dataUrl: value });
      return `${GRIMOIRE_IMAGE_REFERENCE_PREFIX}${key}`;
    }
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, walk(nested)]));
    }
    return value;
  };

  return {
    value: walk(input),
    images: [...images.values()],
  };
};

export const buildGrimoireSessionEnvelope = ({ state, savedAt = new Date().toISOString() } = {}) => {
  const normalized = normalizePersistedState(state);
  const extracted = extractEmbeddedImages(normalized);
  return {
    envelope: {
      schemaId: GRIMOIRE_SESSION_SCHEMA_ID,
      schemaVersion: GRIMOIRE_SESSION_SCHEMA_VERSION,
      savedAt,
      state: extracted.value,
    },
    images: extracted.images,
  };
};

export const serializeGrimoireSession = options => {
  const built = buildGrimoireSessionEnvelope(options);
  const text = JSON.stringify(built.envelope);
  if (/data:image\//i.test(text)) {
    throw new Error('Continuity invariant violated: embedded image data reached the semantic snapshot.');
  }
  return { ...built, text };
};

const migrateEnvelope = parsed => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Saved Grimoire session is not an object.');
  }

  if (parsed.schemaId === GRIMOIRE_SESSION_SCHEMA_ID && parsed.schemaVersion === GRIMOIRE_SESSION_SCHEMA_VERSION) {
    if (!parsed.state || typeof parsed.state !== 'object') throw new Error('Saved Grimoire session contains no state.');
    return { envelope: parsed, migrated: false };
  }

  // Reserved migration path for the pre-release continuity prototype.
  if (parsed.schemaId === GRIMOIRE_SESSION_SCHEMA_ID && parsed.schemaVersion === 0) {
    const legacyState = parsed.state || parsed.session;
    if (!legacyState || typeof legacyState !== 'object') throw new Error('Legacy Grimoire session contains no state.');
    return {
      migrated: true,
      envelope: {
        schemaId: GRIMOIRE_SESSION_SCHEMA_ID,
        schemaVersion: GRIMOIRE_SESSION_SCHEMA_VERSION,
        savedAt: parsed.savedAt || new Date(0).toISOString(),
        state: normalizePersistedState(legacyState),
      },
    };
  }

  // A deliberately narrow legacy escape hatch for development snapshots that were
  // plain reducer state objects. Foreign archives are not accepted here.
  if (!parsed.schemaId && ('phase' in parsed || Array.isArray(parsed.deck))) {
    return {
      migrated: true,
      envelope: {
        schemaId: GRIMOIRE_SESSION_SCHEMA_ID,
        schemaVersion: GRIMOIRE_SESSION_SCHEMA_VERSION,
        savedAt: new Date(0).toISOString(),
        state: normalizePersistedState(parsed),
      },
    };
  }

  throw new Error(`Unsupported Grimoire session schema: ${String(parsed.schemaId || 'unknown')}@${String(parsed.schemaVersion ?? 'unknown')}`);
};

export const parseGrimoireSession = input => {
  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch {
      throw new Error('Saved Grimoire session is not valid JSON.');
    }
  }
  const migrated = migrateEnvelope(parsed);
  return {
    ...migrated,
    envelope: {
      ...migrated.envelope,
      state: normalizePersistedState(migrated.envelope.state),
    },
  };
};

export const hydrateImageReferences = async (input, loadImage) => {
  const missingImages = [];

  const walk = async value => {
    if (isImageReference(value)) {
      const key = value.slice(GRIMOIRE_IMAGE_REFERENCE_PREFIX.length);
      let restored = null;
      try {
        restored = await loadImage(key);
      } catch {
        restored = null;
      }
      if (!isEmbeddedImage(restored)) {
        missingImages.push(key);
        return null;
      }
      return restored;
    }
    if (Array.isArray(value)) return Promise.all(value.map(walk));
    if (value && typeof value === 'object') {
      const entries = await Promise.all(Object.entries(value).map(async ([key, nested]) => [key, await walk(nested)]));
      return Object.fromEntries(entries);
    }
    return value;
  };

  return {
    value: await walk(input),
    missingImages: [...new Set(missingImages)],
  };
};

const requestToPromise = request => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
});

const openImageDatabase = indexedDBImpl => new Promise((resolve, reject) => {
  if (!indexedDBImpl?.open) {
    reject(new Error('IndexedDB is unavailable.'));
    return;
  }
  const request = indexedDBImpl.open(GRIMOIRE_IMAGE_DB_NAME, GRIMOIRE_IMAGE_DB_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(GRIMOIRE_IMAGE_STORE_NAME)) {
      database.createObjectStore(GRIMOIRE_IMAGE_STORE_NAME, { keyPath: 'key' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Unable to open the Grimoire image store.'));
});

export const createIndexedDbImageStore = ({ indexedDBImpl = globalThis.indexedDB } = {}) => ({
  async putMany(records = []) {
    if (!records.length) return;
    const database = await openImageDatabase(indexedDBImpl);
    try {
      const transaction = database.transaction(GRIMOIRE_IMAGE_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(GRIMOIRE_IMAGE_STORE_NAME);
      records.forEach(record => store.put(record));
      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Unable to persist Grimoire images.'));
        transaction.onabort = () => reject(transaction.error || new Error('Grimoire image persistence was aborted.'));
      });
    } finally {
      database.close();
    }
  },

  async get(key) {
    const database = await openImageDatabase(indexedDBImpl);
    try {
      const transaction = database.transaction(GRIMOIRE_IMAGE_STORE_NAME, 'readonly');
      const record = await requestToPromise(transaction.objectStore(GRIMOIRE_IMAGE_STORE_NAME).get(key));
      return record?.dataUrl || null;
    } finally {
      database.close();
    }
  },

  async clear() {
    const database = await openImageDatabase(indexedDBImpl);
    try {
      const transaction = database.transaction(GRIMOIRE_IMAGE_STORE_NAME, 'readwrite');
      await requestToPromise(transaction.objectStore(GRIMOIRE_IMAGE_STORE_NAME).clear());
    } finally {
      database.close();
    }
  },
});

const safeStorage = storage => {
  if (!storage?.getItem || !storage?.setItem) throw new Error('Web storage is unavailable.');
  return storage;
};

export const persistGrimoireSession = async ({
  state,
  storage = globalThis.localStorage,
  imageStore = createIndexedDbImageStore(),
  savedAt,
} = {}) => {
  if (!shouldPersistGrimoireSession(state)) {
    return { status: 'SKIPPED', saved: false, reason: 'NO_STABLE_SESSION' };
  }

  const { envelope, images, text } = serializeGrimoireSession({ state, savedAt });
  const warnings = [];

  try {
    await imageStore.putMany(images);
  } catch (error) {
    warnings.push(`IMAGE_STORE_UNAVAILABLE:${error?.message || 'unknown error'}`);
  }

  try {
    safeStorage(storage).setItem(GRIMOIRE_SESSION_STORAGE_KEY, text);
  } catch (error) {
    return {
      status: 'FAILED',
      saved: false,
      error: `SESSION_STORAGE_FAILED:${error?.message || 'unknown error'}`,
      warnings,
    };
  }

  return {
    status: warnings.length ? 'SAVED_WITH_WARNINGS' : 'SAVED',
    saved: true,
    imageCount: images.length,
    savedAt: envelope.savedAt,
    warnings,
  };
};

export const restoreGrimoireSession = async ({
  storage = globalThis.localStorage,
  imageStore = createIndexedDbImageStore(),
} = {}) => {
  let text;
  try {
    text = safeStorage(storage).getItem(GRIMOIRE_SESSION_STORAGE_KEY);
  } catch (error) {
    return { status: 'FAILED', state: null, error: `SESSION_STORAGE_FAILED:${error?.message || 'unknown error'}` };
  }
  if (!text) return { status: 'EMPTY', state: null, missingImages: [] };

  let parsed;
  try {
    parsed = parseGrimoireSession(text);
  } catch (error) {
    return { status: 'CORRUPT', state: null, error: error.message, missingImages: [] };
  }

  const hydrated = await hydrateImageReferences(parsed.envelope.state, key => imageStore.get(key));
  return {
    status: hydrated.missingImages.length ? 'RESTORED_WITH_MISSING_IMAGES' : 'RESTORED',
    state: normalizePersistedState(hydrated.value),
    savedAt: parsed.envelope.savedAt,
    migrated: parsed.migrated,
    missingImages: hydrated.missingImages,
  };
};

export const rebindSessionCatalogState = (state, { styles = [], traditions = [] } = {}) => {
  if (!state || typeof state !== 'object') return state;
  const style = styles.find(entry => entry?.id === state.selectedStyle?.id)
    || styles.find(entry => entry?.name === state.selectedStyle?.name)
    || state.selectedStyle;
  const tradition = traditions.find(entry => entry?.id === state.selectedTradition?.id)
    || traditions.find(entry => entry?.name === state.selectedTradition?.name)
    || state.selectedTradition;
  return { ...state, selectedStyle: style, selectedTradition: tradition };
};

export const clearSavedGrimoireSession = async ({
  storage = globalThis.localStorage,
  imageStore = createIndexedDbImageStore(),
} = {}) => {
  try {
    storage?.removeItem?.(GRIMOIRE_SESSION_STORAGE_KEY);
  } catch {
    // The explicit clean action should still attempt image cleanup below.
  }
  try {
    await imageStore.clear();
  } catch {
    // Missing IndexedDB must not prevent the app from starting clean.
  }
};

export const readRawSavedGrimoireSession = ({ storage = globalThis.localStorage } = {}) => {
  try {
    return storage?.getItem?.(GRIMOIRE_SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};
