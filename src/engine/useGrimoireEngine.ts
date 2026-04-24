import { useEffect, useMemo, useState } from 'react'
import { consultOracle, generateDeck } from '../services/content'
import {
  grimoireDeckSchema,
  oracleReadingSchema,
  techLevelSchema,
  toneSchema,
  traditionSchema,
  type ForgePhase,
  type GrimoireCard,
  type GrimoireDeck,
  type OracleReading,
  type RitualConfig,
  type RitualSelection,
  type SubjectDossier,
  type TechLevel,
  type Tone,
  type Tradition,
} from '../types/grimoire'

const ARCHIVE_VERSION = 2
const ARCHIVE_KEY = 'grimoire-xr:last-ritual'

type GrimoireEngineState = {
  subject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  intent: string
  forgePhase: ForgePhase
  deck: GrimoireDeck | null
  dossier: SubjectDossier | null
  selection: RitualSelection
  loading: boolean
  error: string | null
  oracleQuestion: string
  oracleReading: OracleReading | null
  oracleLoading: boolean
  oracleError: string | null
  oraclePlaceholder: string | null
  archivePlaceholder: string | null
  hasSavedRitual: boolean
  lastSavedAt: string | null
}

export type GrimoireEngine = GrimoireEngineState & {
  cards: GrimoireCard[]
  focusedCard: GrimoireCard | null
  altarCard: GrimoireCard | null
  setSubject: (subject: string) => void
  setTradition: (tradition: Tradition) => void
  setTone: (tone: Tone) => void
  setTechLevel: (techLevel: TechLevel) => void
  setIntent: (intent: string) => void
  setOracleQuestion: (question: string) => void
  beginRitual: () => Promise<void>
  consultCurrentOracle: () => Promise<void>
  clearOracleReading: () => void
  activateCard: (cardId: number) => void
  clearRitual: () => void
  saveCurrentRitual: () => boolean
  loadMostRecentArchive: () => boolean
  clearArchive: () => void
  acknowledgeAltarLanding: () => void
}

type PersistedRitualArchive = {
  version: number
  savedAt: string
  ritualConfig: RitualConfig
  deck: GrimoireDeck
  dossier: SubjectDossier
  selection: RitualSelection
  oracleQuestion: string
  oracleReading: OracleReading | null
}

const INITIAL_SELECTION: RitualSelection = {
  focusedCardId: null,
  altarCardId: null,
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeSelection(
  rawSelection: unknown,
  deck: GrimoireDeck | null,
): RitualSelection {
  const cardIds = new Set(deck?.cards.map((card) => card.id) ?? [])

  if (!isObject(rawSelection)) {
    return INITIAL_SELECTION
  }

  const focusedCardId =
    typeof rawSelection.focusedCardId === 'number' &&
    Number.isInteger(rawSelection.focusedCardId) &&
    cardIds.has(rawSelection.focusedCardId)
      ? rawSelection.focusedCardId
      : null

  const altarCardId =
    typeof rawSelection.altarCardId === 'number' &&
    Number.isInteger(rawSelection.altarCardId) &&
    cardIds.has(rawSelection.altarCardId)
      ? rawSelection.altarCardId
      : focusedCardId

  return {
    focusedCardId,
    altarCardId,
  }
}

function normalizeRitualConfig(raw: unknown, deck: GrimoireDeck): RitualConfig {
  const source = isObject(raw) ? raw : {}

  const subject =
    typeof source.subject === 'string' && source.subject.trim().length >= 2
      ? source.subject.trim()
      : deck.subject

  const traditionResult = traditionSchema.safeParse(source.tradition)
  const toneResult = toneSchema.safeParse(source.tone)
  const techLevelResult = techLevelSchema.safeParse(source.techLevel)

  const intent =
    typeof source.intent === 'string' && source.intent.trim().length >= 4
      ? source.intent.trim()
      : undefined

  return {
    subject,
    tradition: traditionResult.success ? traditionResult.data : 'thelemic',
    tone: toneResult.success ? toneResult.data : 'oracular',
    techLevel: techLevelResult.success ? techLevelResult.data : 'adept',
    intent,
  }
}

function normalizeOracleReading(raw: unknown): OracleReading | null {
  const parsed = oracleReadingSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

function parseArchivePayload(raw: unknown): PersistedRitualArchive | null {
  if (!isObject(raw)) return null

  const deckResult = grimoireDeckSchema.safeParse(raw.deck)
  if (!deckResult.success) return null

  const deck = deckResult.data
  const ritualConfig = normalizeRitualConfig(raw.ritualConfig ?? raw, deck)

  const savedAt =
    typeof raw.savedAt === 'string' && raw.savedAt.trim()
      ? raw.savedAt
      : new Date().toISOString()

  const oracleQuestion =
    typeof raw.oracleQuestion === 'string' ? raw.oracleQuestion : ''

  return {
    version: ARCHIVE_VERSION,
    savedAt,
    ritualConfig,
    deck,
    dossier: deck.dossier,
    selection: normalizeSelection(raw.selection, deck),
    oracleQuestion,
    oracleReading: normalizeOracleReading(raw.oracleReading),
  }
}

function readMostRecentArchive(): PersistedRitualArchive | null {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return parseArchivePayload(parsed)
  } catch {
    return null
  }
}

function writeArchive(payload: PersistedRitualArchive): boolean {
  if (!isBrowser()) return false

  try {
    window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

function deleteArchive() {
  if (!isBrowser()) return

  try {
    window.localStorage.removeItem(ARCHIVE_KEY)
  } catch {
    // Archive deletion failure should not break the ritual engine.
  }
}

function createArchivePayload({
  ritualConfig,
  deck,
  selection,
  oracleQuestion,
  oracleReading,
}: {
  ritualConfig: RitualConfig
  deck: GrimoireDeck
  selection: RitualSelection
  oracleQuestion: string
  oracleReading: OracleReading | null
}): PersistedRitualArchive {
  return {
    version: ARCHIVE_VERSION,
    savedAt: new Date().toISOString(),
    ritualConfig,
    deck,
    dossier: deck.dossier,
    selection: normalizeSelection(selection, deck),
    oracleQuestion,
    oracleReading,
  }
}

export function useGrimoireEngine(): GrimoireEngine {
  const [subject, setSubjectState] = useState('')
  const [tradition, setTraditionState] = useState<Tradition>('thelemic')
  const [tone, setToneState] = useState<Tone>('oracular')
  const [techLevel, setTechLevelState] = useState<TechLevel>('adept')
  const [intent, setIntentState] = useState('')
  const [forgePhase, setForgePhase] = useState<ForgePhase>('idle')
  const [deck, setDeck] = useState<GrimoireDeck | null>(null)
  const [dossier, setDossier] = useState<SubjectDossier | null>(null)
  const [selection, setSelection] = useState<RitualSelection>(INITIAL_SELECTION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [oracleQuestion, setOracleQuestionState] = useState('')
  const [oracleReading, setOracleReading] = useState<OracleReading | null>(null)
  const [oracleLoading, setOracleLoading] = useState(false)
  const [oracleError, setOracleError] = useState<string | null>(null)
  const [oraclePlaceholder, setOraclePlaceholder] = useState<string | null>(null)

  const [archivePlaceholder, setArchivePlaceholder] = useState<string | null>(null)
  const [hasSavedRitual, setHasSavedRitual] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [forgedConfig, setForgedConfig] = useState<RitualConfig | null>(null)

  const cards = deck?.cards ?? []

  const focusedCard = useMemo(
    () => cards.find((card) => card.id === selection.focusedCardId) ?? null,
    [cards, selection.focusedCardId],
  )

  const altarCard = useMemo(
    () => cards.find((card) => card.id === selection.altarCardId) ?? null,
    [cards, selection.altarCardId],
  )

  const currentInputConfig: RitualConfig = useMemo(
    () => ({
      subject: subject.trim() || 'Untitled Working',
      tradition,
      tone,
      techLevel,
      intent: intent.trim() || undefined,
    }),
    [subject, tradition, tone, techLevel, intent],
  )

  const applyArchive = (archive: PersistedRitualArchive) => {
    setSubjectState(archive.ritualConfig.subject)
    setTraditionState(archive.ritualConfig.tradition)
    setToneState(archive.ritualConfig.tone)
    setTechLevelState(archive.ritualConfig.techLevel)
    setIntentState(archive.ritualConfig.intent ?? '')
    setDeck(archive.deck)
    setDossier(archive.dossier)
    setSelection(archive.selection)
    setForgedConfig(archive.ritualConfig)
    setForgePhase('ready')
    setLoading(false)
    setError(null)
    setOracleQuestionState(archive.oracleQuestion)
    setOracleReading(archive.oracleReading)
    setOracleLoading(false)
    setOracleError(null)
    setOraclePlaceholder(archive.oracleReading ? 'Loaded archived oracle reading.' : null)
    setHasSavedRitual(true)
    setLastSavedAt(archive.savedAt)
    setArchivePlaceholder('Loaded the most recent archived ritual.')
  }

  useEffect(() => {
    const archive = readMostRecentArchive()

    if (archive) {
      applyArchive(archive)
      return
    }

    setHasSavedRitual(false)
    setLastSavedAt(null)
  }, [])

  useEffect(() => {
    if (!deck || !dossier || loading || oracleLoading) return

    const ritualConfig = forgedConfig ?? {
      ...currentInputConfig,
      subject: deck.subject,
    }

    const payload = createArchivePayload({
      ritualConfig,
      deck,
      selection,
      oracleQuestion,
      oracleReading,
    })

    const didSave = writeArchive(payload)

    if (didSave) {
      setHasSavedRitual(true)
      setLastSavedAt(payload.savedAt)
      setArchivePlaceholder('Saved active ritual to local archive.')
    }
  }, [
    deck,
    dossier,
    selection,
    forgedConfig,
    currentInputConfig,
    loading,
    oracleLoading,
    oracleQuestion,
    oracleReading,
  ])

  const setSubject = (nextSubject: string) => {
    setSubjectState(nextSubject)
    if (error) setError(null)
    if (forgePhase === 'error') setForgePhase(deck ? 'ready' : 'idle')
  }

  const setTradition = (nextTradition: Tradition) => {
    setTraditionState(nextTradition)
    if (error) setError(null)
  }

  const setTone = (nextTone: Tone) => {
    setToneState(nextTone)
    if (error) setError(null)
  }

  const setTechLevel = (nextTechLevel: TechLevel) => {
    setTechLevelState(nextTechLevel)
    if (error) setError(null)
  }

  const setIntent = (nextIntent: string) => {
    setIntentState(nextIntent)
    if (error) setError(null)
  }

  const setOracleQuestion = (nextQuestion: string) => {
    setOracleQuestionState(nextQuestion)
    if (oracleError) setOracleError(null)
    if (oraclePlaceholder) setOraclePlaceholder(null)
  }

  const beginRitual = async () => {
    const trimmedSubject = subject.trim()

    if (!trimmedSubject) {
      setError('Enter a ritual subject before beginning the forge.')
      setForgePhase('error')
      return
    }

    const ritualConfig: RitualConfig = {
      subject: trimmedSubject,
      tradition,
      tone,
      techLevel,
      intent: intent.trim() || undefined,
    }

    setLoading(true)
    setError(null)
    setArchivePlaceholder(null)
    setDeck(null)
    setDossier(null)
    setForgedConfig(null)
    setOracleQuestionState('')
    setOracleReading(null)
    setOracleLoading(false)
    setOracleError(null)
    setOraclePlaceholder(null)
    setForgePhase('forging')
    setSelection(INITIAL_SELECTION)

    try {
      const generatedDeck = await generateDeck(ritualConfig)

      setDeck(generatedDeck)
      setDossier(generatedDeck.dossier)
      setForgedConfig(ritualConfig)
      setForgePhase('ready')
    } catch (err) {
      setForgePhase('error')
      setError(err instanceof Error ? err.message : 'Ritual forge failed unexpectedly.')
    } finally {
      setLoading(false)
    }
  }

  const consultCurrentOracle = async () => {
    const trimmedQuestion = oracleQuestion.trim()

    if (!deck) {
      setOracleError('Forge or load a ritual before consulting the oracle.')
      return
    }

    if (trimmedQuestion.length < 3) {
      setOracleError('Enter an oracle question before consultation.')
      return
    }

    const config: RitualConfig = forgedConfig ?? {
      ...currentInputConfig,
      subject: deck.subject,
    }

    const selectedCardIds = selection.focusedCardId ? [selection.focusedCardId] : undefined

    setOracleLoading(true)
    setOracleError(null)
    setOraclePlaceholder('Consulting the oracle layer…')

    try {
      const reading = await consultOracle({
        config,
        deck,
        question: trimmedQuestion,
        selectedCardIds,
      })

      setOracleReading(reading)
      setOraclePlaceholder('Oracle reading assembled.')
      setArchivePlaceholder('Oracle reading added to local archive.')
    } catch (err) {
      setOracleError(err instanceof Error ? err.message : 'Oracle consultation failed unexpectedly.')
      setOraclePlaceholder(null)
    } finally {
      setOracleLoading(false)
    }
  }

  const clearOracleReading = () => {
    setOracleReading(null)
    setOracleError(null)
    setOraclePlaceholder('Oracle reading cleared.')
  }

  const activateCard = (cardId: number) => {
    setSelection({ focusedCardId: cardId, altarCardId: cardId })
  }

  const clearRitual = () => {
    setDeck(null)
    setDossier(null)
    setForgedConfig(null)
    setSelection(INITIAL_SELECTION)
    setOracleQuestionState('')
    setOracleReading(null)
    setOracleLoading(false)
    setOracleError(null)
    setOraclePlaceholder(null)
    setForgePhase('idle')
    setError(null)
    setArchivePlaceholder('Active ritual cleared. Local archive preserved.')
    setLoading(false)
  }

  const saveCurrentRitual = () => {
    if (!deck) {
      setArchivePlaceholder('No active ritual exists to save.')
      return false
    }

    const ritualConfig = forgedConfig ?? {
      ...currentInputConfig,
      subject: deck.subject,
    }

    const payload = createArchivePayload({
      ritualConfig,
      deck,
      selection,
      oracleQuestion,
      oracleReading,
    })

    const didSave = writeArchive(payload)

    if (didSave) {
      setHasSavedRitual(true)
      setLastSavedAt(payload.savedAt)
      setArchivePlaceholder('Saved active ritual to local archive.')
      setError(null)
      return true
    }

    setArchivePlaceholder('Archive save failed.')
    setError('Could not save this ritual to local storage.')
    return false
  }

  const loadMostRecentArchive = () => {
    const archive = readMostRecentArchive()

    if (!archive) {
      setArchivePlaceholder('No saved ritual was found.')
      setHasSavedRitual(false)
      setLastSavedAt(null)
      return false
    }

    applyArchive(archive)
    return true
  }

  const clearArchive = () => {
    deleteArchive()
    setHasSavedRitual(false)
    setLastSavedAt(null)
    setArchivePlaceholder('Local archive cleared.')
  }

  const acknowledgeAltarLanding = () => {
    // Future hook: archive timeline entries, oracle events, haptics, or ritual analytics.
  }

  return {
    subject,
    tradition,
    tone,
    techLevel,
    intent,
    forgePhase,
    deck,
    dossier,
    selection,
    loading,
    error,
    oracleQuestion,
    oracleReading,
    oracleLoading,
    oracleError,
    oraclePlaceholder,
    archivePlaceholder,
    hasSavedRitual,
    lastSavedAt,
    cards,
    focusedCard,
    altarCard,
    setSubject,
    setTradition,
    setTone,
    setTechLevel,
    setIntent,
    setOracleQuestion,
    beginRitual,
    consultCurrentOracle,
    clearOracleReading,
    activateCard,
    clearRitual,
    saveCurrentRitual,
    loadMostRecentArchive,
    clearArchive,
    acknowledgeAltarLanding,
  }
}
