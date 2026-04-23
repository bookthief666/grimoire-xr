import {
  grimoireCardSchema,
  grimoireDeckSchema,
  oracleConsultationRequestSchema,
  oracleReadingSchema,
  ritualConfigSchema,
  type GrimoireCard,
  type GrimoireDeck,
  type OracleConsultationRequest,
  type OracleReading,
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

type OracleSuccess = {
  ok: true
  reading: OracleReading
}

type OracleFailure = {
  ok: false
  error: string
}

type OracleResponse = OracleSuccess | OracleFailure

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(fallbackMessage)
  }
}

export async function generateDeck(config: RitualConfig): Promise<GrimoireDeck> {
  const validatedConfig = ritualConfigSchema.parse(config)

  const response = await fetch('/api/forge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedConfig),
  })

  const payload = await parseJsonResponse<ForgeResponse>(
    response,
    'Forge returned an unreadable response.',
  )

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok && payload.error
        ? payload.error
        : 'The forge is cold. Try again.'

    throw new Error(message)
  }

  return grimoireDeckSchema.parse(payload.deck)
}

export async function consultOracle(
  request: OracleConsultationRequest,
): Promise<OracleReading> {
  const validatedRequest = oracleConsultationRequestSchema.parse(request)

  const response = await fetch('/api/oracle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedRequest),
  })

  const payload = await parseJsonResponse<OracleResponse>(
    response,
    'Oracle returned an unreadable response.',
  )

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok && payload.error
        ? payload.error
        : 'The oracle is silent. Try again.'

    throw new Error(message)
  }

  return oracleReadingSchema.parse(payload.reading)
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
