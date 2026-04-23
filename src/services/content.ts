import {
  grimoireCardSchema,
  grimoireDeckSchema,
  ritualConfigSchema,
  type GrimoireCard,
  type GrimoireDeck,
  type RitualConfig,
  type SubjectDossier,
} from '../types/grimoire'

type ForgeSuccess = {
  ok: true
  deck: GrimoireDeck
}

type ForgeFailure = {
  ok: false
  error: string
}

type ForgeResponse = ForgeSuccess | ForgeFailure

export async function generateDeck(config: RitualConfig): Promise<GrimoireDeck> {
  const validatedConfig = ritualConfigSchema.parse(config)

  const response = await fetch('/api/forge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedConfig),
  })

  let payload: ForgeResponse | null = null

  try {
    payload = (await response.json()) as ForgeResponse
  } catch {
    throw new Error('Forge returned an unreadable response.')
  }

  if (!response.ok || !payload || !payload.ok) {
    const message =
      payload && !payload.ok && payload.error
        ? payload.error
        : 'The forge is cold. Try again.'
    throw new Error(message)
  }

  return grimoireDeckSchema.parse(payload.deck)
}

export async function generateSubjectDossier(
  config: RitualConfig,
): Promise<SubjectDossier> {
  const deck = await generateDeck(config)
  return deck.dossier
}

export async function generateCardExegesis(card: GrimoireCard, _config: RitualConfig) {
  return grimoireCardSchema.parse(card).exegesis
}

export async function generateCardMetadata(card: GrimoireCard) {
  return grimoireCardSchema.parse(card).metadata
}
