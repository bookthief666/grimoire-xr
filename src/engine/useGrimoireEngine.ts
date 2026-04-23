import { useMemo, useState } from 'react'
import { generateDeck } from '../services/content'
import {
  type ForgePhase,
  type GrimoireCard,
  type GrimoireDeck,
  type RitualSelection,
  type SubjectDossier,
  type Tone,
  type Tradition,
} from '../types/grimoire'

type GrimoireEngineState = {
  subject: string
  tradition: Tradition
  tone: Tone
  intent: string
  forgePhase: ForgePhase
  deck: GrimoireDeck | null
  dossier: SubjectDossier | null
  selection: RitualSelection
  loading: boolean
  error: string | null
  oraclePlaceholder: string | null
  archivePlaceholder: string | null
}

export type GrimoireEngine = GrimoireEngineState & {
  cards: GrimoireCard[]
  focusedCard: GrimoireCard | null
  altarCard: GrimoireCard | null
  setSubject: (subject: string) => void
  setTradition: (tradition: Tradition) => void
  setTone: (tone: Tone) => void
  setIntent: (intent: string) => void
  beginRitual: () => Promise<void>
  activateCard: (cardId: number) => void
  clearRitual: () => void
  acknowledgeAltarLanding: () => void
}

const INITIAL_SELECTION: RitualSelection = {
  focusedCardId: null,
  altarCardId: null,
}

export function useGrimoireEngine(): GrimoireEngine {
  const [subject, setSubjectState] = useState('')
  const [tradition, setTraditionState] = useState<Tradition>('thelemic')
  const [tone, setToneState] = useState<Tone>('oracular')
  const [intent, setIntentState] = useState('')
  const [forgePhase, setForgePhase] = useState<ForgePhase>('idle')
  const [deck, setDeck] = useState<GrimoireDeck | null>(null)
  const [dossier, setDossier] = useState<SubjectDossier | null>(null)
  const [selection, setSelection] = useState<RitualSelection>(INITIAL_SELECTION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cards = deck?.cards ?? []

  const focusedCard = useMemo(
    () => cards.find((card) => card.id === selection.focusedCardId) ?? null,
    [cards, selection.focusedCardId],
  )

  const altarCard = useMemo(
    () => cards.find((card) => card.id === selection.altarCardId) ?? null,
    [cards, selection.altarCardId],
  )

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

  const setIntent = (nextIntent: string) => {
    setIntentState(nextIntent)
    if (error) setError(null)
  }

  const beginRitual = async () => {
    if (!subject.trim()) {
      setError('Enter a ritual subject before beginning the forge.')
      setForgePhase('error')
      return
    }

    setLoading(true)
    setError(null)
    setDeck(null)
    setDossier(null)
    setForgePhase('forging')
    setSelection(INITIAL_SELECTION)

    try {
      const generatedDeck = await generateDeck({
        subject,
        tradition,
        tone,
        intent: intent.trim() || undefined,
      })
      setDeck(generatedDeck)
      setDossier(generatedDeck.dossier)
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

  const clearRitual = () => {
    setDeck(null)
    setDossier(null)
    setSelection(INITIAL_SELECTION)
    setForgePhase('idle')
    setError(null)
    setLoading(false)
  }

  const acknowledgeAltarLanding = () => {
    // Placeholder hook for future oracle/archive side effects.
  }

  return {
    subject,
    tradition,
    tone,
    intent,
    forgePhase,
    deck,
    dossier,
    selection,
    loading,
    error,
    oraclePlaceholder: null,
    archivePlaceholder: null,
    cards,
    focusedCard,
    altarCard,
    setSubject,
    setTradition,
    setTone,
    setIntent,
    beginRitual,
    activateCard,
    clearRitual,
    acknowledgeAltarLanding,
  }
}
