import { useEffect, useMemo, useState } from 'react'
import { consultOracle, generateDeck } from '../services/content'
import { generateCardImage } from '../services/images'
import {
  grimoireDeckSchema,
  techLevelSchema,
  visualStyleSchema,
  erosFieldSchema,
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
  type VisualStyle,
  type ErosField,
  type Tone,
  type Tradition,
} from '../types/grimoire'

function isRenderableGeneratedImageUrl(value: string | undefined) {
  if (!value) return false

  return (
    value.startsWith('data:image/') ||
    value.startsWith('blob:') ||
    value.startsWith('/api/')
  )
}


const ARCHIVE_VERSION = 1
const ARCHIVE_KEY = 'grimoire-xr:last-ritual'

type GrimoireEngineState = {
  subject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  visualStyle: VisualStyle
  erosField: ErosField
  intent: string

  forgePhase: ForgePhase
  deck: GrimoireDeck | null
  dossier: SubjectDossier | null
  selection: RitualSelection
  loading: boolean
  error: string | null

  oraclePlaceholder: string | null
  archivePlaceholder: string | null
  hasSavedRitual: boolean
  lastSavedAt: string | null

  oracleQuestion: string
  oracleReading: OracleReading | null
  oracleLoading: boolean
  oracleError: string | null
}

export type GrimoireEngine = GrimoireEngineState & {
  cards: GrimoireCard[]
  focusedCard: GrimoireCard | null
  altarCard: GrimoireCard | null

  setSubject: (subject: string) => void
  setTradition: (tradition: Tradition) => void
  setTone: (tone: Tone) => void
  setTechLevel: (techLevel: TechLevel) => void
  setVisualStyle: (visualStyle: VisualStyle) => void
  setErosField: (erosField: ErosField) => void
  setIntent: (intent: string) => void

  beginRitual: () => Promise<void>
  activateCard: (cardId: number) => void
  clearCardSelection: () => void
  clearRitual: () => void
  generateImageForCard: (cardId: number) => Promise<boolean>

  saveCurrentRitual: () => boolean
  loadMostRecentArchive: () => boolean
  clearArchive: () => void

  setOracleQuestion: (question: string) => void
  consultActiveOracle: () => Promise<void>
  clearOracleReading: () => void

  acknowledgeAltarLanding: () => void
}

type PersistedRitualArchive = {
  version: number
  savedAt: string
  ritualConfig: RitualConfig
  deck: GrimoireDeck
  dossier: SubjectDossier
  selection: RitualSelection
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
  const visualStyleResult = visualStyleSchema.safeParse(source.visualStyle)
  const erosFieldResult = erosFieldSchema.safeParse(source.erosField)

  const intent =
    typeof source.intent === 'string' && source.intent.trim().length >= 4
      ? source.intent.trim()
      : undefined

  return {
    subject,
    tradition: traditionResult.success ? traditionResult.data : 'thelemic',
    tone: toneResult.success ? toneResult.data : 'oracular',
    techLevel: techLevelResult.success ? techLevelResult.data : 'adept',
    visualStyle: visualStyleResult.success ? visualStyleResult.data : 'Hierophantic',
    erosField: erosFieldResult.success ? erosFieldResult.data : 'Veiled',
    intent,
  }
}

function parseArchivePayload(raw: unknown): PersistedRitualArchive | null {
  if (!isObject(raw)) return null

  const deckResult = grimoireDeckSchema.safeParse(raw.deck)
  if (!deckResult.success) return null

  const deck = stripArchiveImagePayloads(deckResult.data)
  const ritualConfig = normalizeRitualConfig(raw.ritualConfig ?? raw, deck)

  const savedAt =
    typeof raw.savedAt === 'string' && raw.savedAt.trim()
      ? raw.savedAt
      : new Date().toISOString()

  return {
    version: ARCHIVE_VERSION,
    savedAt,
    ritualConfig,
    deck,
    dossier: deck.dossier,
    selection: normalizeSelection(raw.selection, deck),
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
    const safePayload = {
      ...payload,
      deck: stripArchiveImagePayloads(payload.deck),
    }

    window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(safePayload))
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


function stripArchiveImagePayloads(deck: GrimoireDeck): GrimoireDeck {
  return {
    ...deck,
    cards: deck.cards.map((card) => {
      const imageUrl = card.imageUrl

      if (
        !imageUrl ||
        (!imageUrl.startsWith('data:image/') && !imageUrl.startsWith('blob:'))
      ) {
        return card
      }

      const nextCard = { ...card }

      delete nextCard.imageUrl

      if (nextCard.imageStatus === 'ready') {
        nextCard.imageStatus = 'pending'
      }

      return nextCard
    }),
  }
}

function createArchivePayload({
  ritualConfig,
  deck,
  selection,
}: {
  ritualConfig: RitualConfig
  deck: GrimoireDeck
  selection: RitualSelection
}): PersistedRitualArchive {
  const archiveDeck = stripArchiveImagePayloads(deck)

  return {
    version: ARCHIVE_VERSION,
    savedAt: new Date().toISOString(),
    ritualConfig,
    deck: archiveDeck,
    dossier: archiveDeck.dossier,
    selection: normalizeSelection(selection, archiveDeck),
  }
}

export function useGrimoireEngine(): GrimoireEngine {
  const [subject, setSubjectState] = useState('')
  const [tradition, setTraditionState] = useState<Tradition>('thelemic')
  const [tone, setToneState] = useState<Tone>('oracular')
  const [techLevel, setTechLevelState] = useState<TechLevel>('adept')
  const [visualStyle, setVisualStyleState] = useState<VisualStyle>('Hierophantic')
  const [erosField, setErosFieldState] = useState<ErosField>('Veiled')
  const [intent, setIntentState] = useState('')

  const [forgePhase, setForgePhase] = useState<ForgePhase>('idle')
  const [deck, setDeck] = useState<GrimoireDeck | null>(null)
  const [dossier, setDossier] = useState<SubjectDossier | null>(null)
  const [selection, setSelection] = useState<RitualSelection>(INITIAL_SELECTION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [archivePlaceholder, setArchivePlaceholder] = useState<string | null>(null)
  const [hasSavedRitual, setHasSavedRitual] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [forgedConfig, setForgedConfig] = useState<RitualConfig | null>(null)

  const [oracleQuestion, setOracleQuestionState] = useState('')
  const [oracleReading, setOracleReading] = useState<OracleReading | null>(null)
  const [oracleLoading, setOracleLoading] = useState(false)
  const [oracleError, setOracleError] = useState<string | null>(null)
  const [oraclePlaceholder, setOraclePlaceholder] = useState<string | null>(null)

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
      visualStyle,
      erosField,
      intent: intent.trim() || undefined,
    }),
    [subject, tradition, tone, techLevel, visualStyle, erosField, intent],
  )

  const applyArchive = (archive: PersistedRitualArchive) => {
    setSubjectState(archive.ritualConfig.subject)
    setTraditionState(archive.ritualConfig.tradition)
    setToneState(archive.ritualConfig.tone)
    setTechLevelState(archive.ritualConfig.techLevel)
    setVisualStyleState(archive.ritualConfig.visualStyle ?? 'Hierophantic')
    setErosFieldState(archive.ritualConfig.erosField ?? 'Veiled')
    setIntentState(archive.ritualConfig.intent ?? '')

    setDeck(archive.deck)
    setDossier(archive.dossier)
    setSelection(archive.selection)
    setForgedConfig(archive.ritualConfig)

    setForgePhase('ready')
    setLoading(false)
    setError(null)

    setOracleReading(null)
    setOracleLoading(false)
    setOracleError(null)
    setOraclePlaceholder('Archived ritual loaded. Oracle memory is fresh.')

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
    if (!deck || !dossier || loading) return

    const ritualConfig = forgedConfig ?? currentInputConfig
    const payload = createArchivePayload({
      ritualConfig,
      deck,
      selection,
    })

    const didSave = writeArchive(payload)

    if (didSave) {
      setHasSavedRitual(true)
      setLastSavedAt(payload.savedAt)
      setArchivePlaceholder('Saved active ritual to local archive.')
    }
  }, [deck, dossier, selection, forgedConfig, currentInputConfig, loading])

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

  const setVisualStyle = (nextVisualStyle: VisualStyle) => {
    setVisualStyleState(nextVisualStyle)
    if (error) setError(null)
  }

  const setErosField = (nextErosField: ErosField) => {
    setErosFieldState(nextErosField)
    if (error) setError(null)
  }

  const setIntent = (nextIntent: string) => {
    setIntentState(nextIntent)
    if (error) setError(null)
  }

  const setOracleQuestion = (nextQuestion: string) => {
    setOracleQuestionState(nextQuestion)
    if (oracleError) setOracleError(null)
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
      visualStyle,
      erosField,
      intent: intent.trim() || undefined,
    }

    setLoading(true)
    setError(null)
    setArchivePlaceholder(null)

    setDeck(null)
    setDossier(null)
    setForgedConfig(null)
    setForgePhase('forging')
    setSelection(INITIAL_SELECTION)

    setOracleReading(null)
    setOracleError(null)
    setOraclePlaceholder(null)
    setOracleLoading(false)

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

  const activateCard = (cardId: number) => {
    setSelection({ focusedCardId: cardId, altarCardId: cardId })
  }

  const clearCardSelection = () => {
    setSelection(INITIAL_SELECTION)
  }

  const clearRitual = () => {
    setDeck(null)
    setDossier(null)
    setForgedConfig(null)
    setSelection(INITIAL_SELECTION)
    setForgePhase('idle')
    setError(null)
    setArchivePlaceholder('Active ritual cleared. Local archive preserved.')
    setLoading(false)

    setOracleReading(null)
    setOracleLoading(false)
    setOracleError(null)
    setOraclePlaceholder(null)
  }

  const generateImageForCard = async (cardId: number) => {
    console.info('[ENGINE] generateImageForCard called', {
      cardId,
      hasDeck: Boolean(deck),
      deckId: deck?.id,
      deckCardIds: deck?.cards.map((card) => card.id),
    })

    if (!deck) {
      console.warn('[ENGINE] No active deck exists for image manifestation.')
      setArchivePlaceholder('No active deck exists for image manifestation.')
      return false
    }

    const target = deck.cards.find((card) => String(card.id) === String(cardId))

    if (!target) {
      console.error('[ENGINE] Card image manifestation failed: card not found.', {
        cardId,
        deckCardIds: deck.cards.map((card) => card.id),
      })
      setArchivePlaceholder('Card image manifestation failed: card not found.')
      return false
    }

    console.info('[ENGINE] Target card found for image manifestation', {
      id: target.id,
      name: target.name,
      imageStatus: target.imageStatus,
      hasArtPrompt: Boolean(target.artPrompt),
      artPromptLength: target.artPrompt?.length ?? 0,
    })

    if (target.imageStatus === 'ready' && isRenderableGeneratedImageUrl(target.imageUrl)) {
      setArchivePlaceholder(`Image already sealed for ${target.name}.`)
      return true
    }

    if (target.imageStatus === 'generating') {
      setArchivePlaceholder(`Image manifestation already active for ${target.name}.`)
      return false
    }

    if (!target.artPrompt) {
      setArchivePlaceholder(`No art seed exists for ${target.name}.`)
      return false
    }

    setArchivePlaceholder(`Manifesting image seal for ${target.name}.`)

    setDeck((currentDeck) => {
      if (!currentDeck) return currentDeck

      return {
        ...currentDeck,
        cards: currentDeck.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                imageStatus: 'generating',
              }
            : card,
        ),
      }
    })

    try {
      console.info('[ENGINE] Calling generateCardImage service', {
        deckId: deck.id,
        cardId: target.id,
        cardName: target.name,
      })

      const result = await generateCardImage({
        deckId: deck.id,
        cardId: target.id,
        cardName: target.name,
        sigil: target.sigil,
        artPrompt: target.artPrompt,
        visualStyle,
        erosField,
        metadata: target.metadata,
      })

      console.info('[ENGINE] generateCardImage service resolved', {
        cardId: target.id,
        imageUrlPrefix: result.imageUrl?.slice(0, 32),
      })

      setDeck((currentDeck) => {
        if (!currentDeck) return currentDeck

        return {
          ...currentDeck,
          cards: currentDeck.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  imageUrl: result.imageUrl,
                  imageStatus: 'ready',
                }
              : card,
          ),
        }
      })

      setArchivePlaceholder(`Image sealed for ${target.name}.`)
      return true
    } catch (err) {
      console.error('[ENGINE] generateImageForCard failed', err)

      setDeck((currentDeck) => {
        if (!currentDeck) return currentDeck

        return {
          ...currentDeck,
          cards: currentDeck.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  imageStatus: 'error',
                }
              : card,
          ),
        }
      })

      setArchivePlaceholder(
        err instanceof Error
          ? `Image manifestation failed: ${err.message}`
          : 'Image manifestation failed.',
      )

      return false
    }
  }

  const saveCurrentRitual = () => {
    if (!deck) {
      setArchivePlaceholder('No active ritual exists to save.')
      return false
    }

    const ritualConfig = forgedConfig ?? currentInputConfig
    const payload = createArchivePayload({
      ritualConfig,
      deck,
      selection,
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

  const consultActiveOracle = async () => {
    const question = oracleQuestion.trim()

    if (!deck) {
      setOracleError('Forge or load a ritual before consulting the oracle.')
      setOraclePlaceholder(null)
      return
    }

    if (question.length < 3) {
      setOracleError('Enter an oracle question first.')
      setOraclePlaceholder(null)
      return
    }

    const config = forgedConfig ?? currentInputConfig
    const selectedCardIds = focusedCard ? [focusedCard.id] : undefined

    setOracleLoading(true)
    setOracleError(null)
    setOraclePlaceholder('Oracle consultation in progress.')

    try {
      const reading = await consultOracle({
        config,
        deck,
        question,
        selectedCardIds,
      })

      setOracleReading(reading)
      setOraclePlaceholder('Oracle reading received.')
    } catch (err) {
      setOracleReading(null)
      setOracleError(err instanceof Error ? err.message : 'Oracle consultation failed.')
      setOraclePlaceholder(null)
    } finally {
      setOracleLoading(false)
    }
  }

  const clearOracleReading = () => {
    setOracleReading(null)
    setOracleError(null)
    setOraclePlaceholder(null)
  }

  const acknowledgeAltarLanding = () => {
    // Future hook: archive timeline entries, oracle events, haptics, or ritual analytics.
  }

  // Image generation is intentionally manual for now.
  // Auto-triggering ComfyUI jobs caused local queue backlogs on Mac/MPS.

  return {
    subject,
    tradition,
    tone,
    techLevel,
    visualStyle,
    erosField,
    intent,

    forgePhase,
    deck,
    dossier,
    selection,
    loading,
    error,

    oraclePlaceholder,
    archivePlaceholder,
    hasSavedRitual,
    lastSavedAt,

    oracleQuestion,
    oracleReading,
    oracleLoading,
    oracleError,

    cards,
    focusedCard,
    altarCard,

    setSubject,
    setTradition,
    setTone,
    setTechLevel,
    setVisualStyle,
    setErosField,
    setIntent,

    beginRitual,
    activateCard,
    clearCardSelection,
    clearRitual,
    generateImageForCard,

    saveCurrentRitual,
    loadMostRecentArchive,
    clearArchive,

    setOracleQuestion,
    consultActiveOracle,
    clearOracleReading,

    acknowledgeAltarLanding,
  }
}
