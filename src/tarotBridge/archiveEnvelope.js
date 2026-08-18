import { UPSTREAM_TAROT_CONTRACT } from './canonicalTarotBridge.js';

export const GRIMOIRE_ARCHIVE_SCHEMA_ID = 'grimoire.xr.archive';
export const GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.0.0';

const cloneJson = value => value == null ? value : JSON.parse(JSON.stringify(value));
const cleanText = value => String(value ?? '').trim();
const hasOwn = (value, key) => Boolean(value && Object.prototype.hasOwnProperty.call(value, key));

export const archiveContractStatus = contract => {
  if (!contract || typeof contract !== 'object') return 'LEGACY_NO_CONTRACT_PIN';
  return contract.contractId === UPSTREAM_TAROT_CONTRACT.contractId
    && contract.contractVersion === UPSTREAM_TAROT_CONTRACT.contractVersion
    && contract.commit === UPSTREAM_TAROT_CONTRACT.commit
    ? 'CURRENT_CONTRACT_MATCH'
    : 'ARCHIVED_CONTRACT_MISMATCH';
};

export const summarizeReadingProvenance = reading => {
  const record = reading?.readingRecord || null;
  if (!record) {
    return Object.freeze({
      hasCanonicalRecord: false,
      contractStatus: 'NO_READING_RECORD',
      relationMethod: null,
      relationMethodAuthority: null,
      sourceIds: Object.freeze([]),
      claimIds: Object.freeze([]),
      unresolvedReasonCodes: Object.freeze([]),
      selectionSource: reading?.selectionSource || null,
    });
  }
  const provenance = record.provenance || {};
  const semanticContract = hasOwn(reading, 'semanticContract')
    ? reading.semanticContract
    : UPSTREAM_TAROT_CONTRACT;
  return Object.freeze({
    hasCanonicalRecord: true,
    contractStatus: archiveContractStatus(semanticContract),
    recordVersion: record.recordVersion || null,
    engineVersion: record.engineVersion || null,
    spreadId: record.input?.spreadId || null,
    tarotSystem: record.input?.tarotSystem || null,
    relationMethod: record.input?.relationMethod || null,
    relationMethodAuthority: provenance.relationMethodAuthority || null,
    sourceIds: Object.freeze([...(provenance.sourceIds || [])]),
    claimIds: Object.freeze([...(provenance.claimIds || [])]),
    unresolvedReasonCodes: Object.freeze([...(provenance.unresolvedReasonCodes || [])]),
    selectionSource: reading?.selectionSource || null,
  });
};

const normalizeReading = (reading, semanticContract = UPSTREAM_TAROT_CONTRACT) => {
  if (!reading || typeof reading !== 'object') return null;
  return {
    cards: cloneJson(Array.isArray(reading.cards) ? reading.cards : []),
    answer: cleanText(reading.answer),
    answerAuthority: 'MODEL_GENERATED_SYNTHESIS',
    readingRecord: cloneJson(reading.readingRecord || null),
    selectionSource: reading.selectionSource || null,
    semanticContract: cloneJson(hasOwn(reading, 'semanticContract') ? reading.semanticContract : semanticContract),
  };
};

export const buildGrimoireArchiveEnvelope = ({ state, deck = state?.deck, exportedAt = new Date().toISOString() } = {}) => {
  if (!state || typeof state !== 'object') throw new Error('Archive export requires Grimoire state.');
  const normalizedDeck = cloneJson(Array.isArray(deck) ? deck : []);
  const reading = normalizeReading(state.reading);
  return {
    schemaId: GRIMOIRE_ARCHIVE_SCHEMA_ID,
    schemaVersion: GRIMOIRE_ARCHIVE_SCHEMA_VERSION,
    exportedAt,
    semanticContract: cloneJson(UPSTREAM_TAROT_CONTRACT),
    grimoire: {
      author: cleanText(state.author),
      dossier: cleanText(state.dossier),
      selectedStyleId: state.selectedStyle?.id || null,
      selectedTraditionId: state.selectedTradition?.id || null,
      erosLevel: Number.isInteger(state.erosLevel) ? state.erosLevel : 0,
      techLevel: Number.isInteger(state.techLevel) ? state.techLevel : 1,
      suggestedQuestions: cloneJson(Array.isArray(state.suggestedQuestions) ? state.suggestedQuestions : []),
      portrait: state.portrait || null,
      deck: normalizedDeck,
      spiritChat: cloneJson(Array.isArray(state.spiritChat) ? state.spiritChat : []),
      activeSpread: state.activeSpread || 'TRIAD',
      spreadSlots: cloneJson(Array.isArray(state.spreadSlots) ? state.spreadSlots : [null, null, null]),
      reading,
    },
  };
};

export const serializeGrimoireArchive = input => JSON.stringify(
  input?.schemaId === GRIMOIRE_ARCHIVE_SCHEMA_ID ? input : buildGrimoireArchiveEnvelope(input),
  null,
  2,
);

const normalizeLegacyArchive = parsed => {
  const legacyState = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
  const deck = Array.isArray(parsed?.deck) ? parsed.deck : (Array.isArray(legacyState?.deck) ? legacyState.deck : []);
  const legacyContract = parsed?.semanticContract || null;
  return {
    schemaId: GRIMOIRE_ARCHIVE_SCHEMA_ID,
    schemaVersion: 'legacy-migrated',
    exportedAt: parsed?.exportedAt || null,
    semanticContract: legacyContract,
    grimoire: {
      author: cleanText(legacyState?.author),
      dossier: cleanText(legacyState?.dossier),
      selectedStyleId: legacyState?.selectedStyle?.id || legacyState?.selectedStyleId || null,
      selectedTraditionId: legacyState?.selectedTradition?.id || legacyState?.selectedTraditionId || null,
      erosLevel: Number.isInteger(legacyState?.erosLevel) ? legacyState.erosLevel : 0,
      techLevel: Number.isInteger(legacyState?.techLevel) ? legacyState.techLevel : 1,
      suggestedQuestions: cloneJson(Array.isArray(legacyState?.suggestedQuestions) ? legacyState.suggestedQuestions : []),
      portrait: legacyState?.portrait || null,
      deck: cloneJson(deck),
      spiritChat: cloneJson(Array.isArray(legacyState?.spiritChat) ? legacyState.spiritChat : []),
      activeSpread: legacyState?.activeSpread || 'TRIAD',
      spreadSlots: cloneJson(Array.isArray(legacyState?.spreadSlots) ? legacyState.spreadSlots : [null, null, null]),
      reading: normalizeReading(legacyState?.reading, legacyContract),
    },
  };
};

export const parseGrimoireArchive = textOrObject => {
  const parsed = typeof textOrObject === 'string' ? JSON.parse(textOrObject) : cloneJson(textOrObject);
  if (!parsed || typeof parsed !== 'object') throw new Error('Archive payload must be a JSON object.');
  const envelope = parsed.schemaId === GRIMOIRE_ARCHIVE_SCHEMA_ID && parsed.grimoire
    ? parsed
    : normalizeLegacyArchive(parsed);
  if (!Array.isArray(envelope.grimoire?.deck)) throw new Error('Archive is missing a Tarot deck.');
  if (envelope.grimoire.reading && !hasOwn(envelope.grimoire.reading, 'semanticContract')) {
    envelope.grimoire.reading.semanticContract = cloneJson(envelope.semanticContract || null);
  }
  return {
    envelope,
    contractStatus: archiveContractStatus(envelope.semanticContract),
    migratedLegacy: envelope.schemaVersion === 'legacy-migrated',
  };
};

export const buildArchiveRestoreState = ({ envelope, styles = [], traditions = [] } = {}) => {
  if (!envelope?.grimoire) throw new Error('Cannot restore an archive without grimoire data.');
  const archived = envelope.grimoire;
  const selectedStyle = styles.find(item => item.id === archived.selectedStyleId) || styles[0] || null;
  const selectedTradition = traditions.find(item => item.id === archived.selectedTraditionId) || traditions[0] || null;
  return {
    phase: 'SCRIPTORIUM',
    author: archived.author || '',
    selectedStyle,
    selectedTradition,
    erosLevel: archived.erosLevel ?? 0,
    techLevel: archived.techLevel ?? 1,
    dossier: archived.dossier || null,
    deck: cloneJson(archived.deck || []),
    suggestedQuestions: cloneJson(archived.suggestedQuestions || []),
    portrait: archived.portrait || null,
    focusedCard: null,
    isForging: false,
    oracleQuestion: '',
    reading: cloneJson(archived.reading || null),
    isConsulting: false,
    archiveState: 'IDLE',
    archiveProgress: { current: 0, total: 0, msg: '' },
    isSpiritBoxOpen: false,
    spiritChat: cloneJson(archived.spiritChat || []),
    spiritInput: '',
    isSpiritTyping: false,
    isStatsOpen: false,
    status: 'ARCHIVE RESTORED',
    error: null,
    reforgeStatus: '',
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    errorMessage: '',
    scriptoriumMode: 'DECK',
    activeSpread: archived.activeSpread || 'TRIAD',
    spreadSlots: cloneJson(archived.spreadSlots || [null, null, null]),
    placementCardId: null,
    restoredArchiveContractStatus: archiveContractStatus(envelope.semanticContract),
  };
};