import { useMemo, useState } from 'react'
import { generateDeck } from '../services/content'
import {
  type ForgePhase,
  type GrimoireCard,
  type GrimoireDeck,
  type RitualSelection,
  type SubjectDossier,
} from '../types/grimoire'

type GrimoireEngineState = {
  subject: string
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
  beginRitual: () => Promise<void>
  activateCard: (cardId: number) => void
  acknowledgeAltarLanding: () => void
}

const INITIAL_SELECTION: RitualSelection = {
  focusedCardId: null,
  altarCardId: null,
}

export function useGrimoireEngine(): GrimoireEngine {
  const [subject, setSubject] = useState('')
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
      const generatedDeck = await generateDeck(subject)
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

  const acknowledgeAltarLanding = () => {
    // Placeholder hook for future oracle/archive side effects.
  }

  return {
    subject,
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
    beginRitual,
    activateCard,
    acknowledgeAltarLanding,
  }
}
