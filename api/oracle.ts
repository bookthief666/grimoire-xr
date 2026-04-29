/// <reference types="node" />
import { GoogleGenAI } from '@google/genai'
import * as z from 'zod'
import { TECH_LEVELS } from '../src/constants/ritualOptions.js'
import {
  oracleConsultationRequestSchema,
  oracleReadingSchema,
  type GrimoireCard,
  type GrimoireDeck,
  type OracleReading,
  type RitualConfig,
  type TechLevel,
  type Tone,
  type Tradition,
} from '../src/types/grimoire.js'

export const maxDuration = 60

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function logOracle(stage: string, startTime: number, extra?: unknown) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

  if (extra !== undefined) {
    console.log(`[ORACLE | ${elapsed}s] ${stage}`, extra)
  } else {
    console.log(`[ORACLE | ${elapsed}s] ${stage}`)
  }
}

function cleanJsonText(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function ensureString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function ensureKeywords(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const keywords = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 8)

    if (keywords.length >= 2) return keywords
  }

  if (typeof value === 'string' && value.trim()) {
    const keywords = value
      .split(/[,\n|]/g)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8)

    if (keywords.length >= 2) return keywords
  }

  return fallback
}

function hashString(input: string) {
  let hash = 2166136261

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function chooseOracleCards(
  deck: GrimoireDeck,
  question: string,
  selectedCardIds?: number[],
): GrimoireCard[] {
  const byId = new Map(deck.cards.map((card) => [card.id, card]))

  if (selectedCardIds && selectedCardIds.length > 0) {
    const selected = selectedCardIds
      .map((id) => byId.get(id))
      .filter((card): card is GrimoireCard => Boolean(card))
      .slice(0, 4)

    if (selected.length > 0) return selected
  }

  const cards = [...deck.cards]
  if (cards.length <= 3) return cards

  const seed = hashString(`${deck.id}:${question}`)
  const chosen: GrimoireCard[] = []
  const used = new Set<number>()

  let cursor = seed % cards.length
  const step = 1 + (seed % Math.max(cards.length - 1, 1))

  while (chosen.length < Math.min(3, cards.length)) {
    const card = cards[cursor % cards.length]

    if (!used.has(card.id)) {
      used.add(card.id)
      chosen.push(card)
    }

    cursor += step
  }

  return chosen
}

function traditionDirective(tradition: Tradition) {
  switch (tradition) {
    case 'thelemic':
      return 'Use Thelemic vocabulary: will, ordeal, initiation, star, law, attainment, Babalon, abyss, and magical ascent.'
    case 'hermetic':
      return 'Use Hermetic vocabulary: correspondence, balance, alchemy, subtle architecture, planetary mediation, and mental transmutation.'
    case 'goetic':
      return 'Use ceremonial and pact-oriented vocabulary: hierarchy, command, constraint, negotiation, danger, compulsion, and bounded force.'
    case 'tarot':
      return 'Use tarot vocabulary: archetypes, reversals, thresholds, elemental dignities, path logic, and divinatory pressure.'
    case 'kabbalistic':
      return 'Use Qabalistic vocabulary: sephiroth, paths, emanation, ascent, descent, vessel, rupture, and symbolic repair.'
    case 'tantric':
      return 'Use initiatory tantric vocabulary: polarity, energy, discipline, embodiment, transformation, sacred intensity, and union.'
    case 'chaos_magick':
      return 'Use chaos magick vocabulary: sigils, belief as instrument, paradigm shift, operational intent, servitors, and result-oriented practice.'
  }
}

function toneDirective(tone: Tone) {
  switch (tone) {
    case 'scholarly':
      return 'Write with analytic clarity, precision, and restraint.'
    case 'oracular':
      return 'Write with gnomic gravity, prophetic cadence, and solemn symbolic authority.'
    case 'visionary':
      return 'Write with imaginal force and luminous symbolic intensity while remaining coherent.'
    case 'severe':
      return 'Write with austerity, directness, ritual seriousness, and no ornamental vagueness.'
    case 'ecstatic':
      return 'Write with heightened initiatory intensity, but keep the language disciplined and exact.'
  }
}

function techLevelDirective(techLevel: TechLevel) {
  return TECH_LEVELS[techLevel].instruction
}

function formatCardForPrompt(card: GrimoireCard, index: number) {
  return [
    `CARD ${index + 1}`,
    `id: ${card.id}`,
    `name: ${card.name}`,
    `sigil: ${card.sigil}`,
    `exegesis: ${card.exegesis}`,
    card.ritualFunction ? `ritualFunction: ${card.ritualFunction}` : '',
    `metadata: ${JSON.stringify(card.metadata)}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function buildPrompt({
  config,
  deck,
  question,
  drawnCards,
}: {
  config: RitualConfig
  deck: GrimoireDeck
  question: string
  drawnCards: GrimoireCard[]
}) {
  return [
    'Return exactly one JSON object.',
    'Return valid JSON only. No prose outside the JSON object.',
    'Do not return markdown.',
    'Do not wrap the object in quotes.',
    'Do not stringify nested objects.',
    '',
    'You are the Oracle layer of Grimoire XR: an initiated symbolic analyst, Thelemic/Hermetic diviner, Qabalistic interpreter, and operative ritual strategist.',
    'You are not creating a new deck.',
    'You are interpreting the existing forged deck and answering the user question through the drawn cards.',
    '',
    'QUALITY STANDARD:',
    'The reading must feel like a serious occult consultation, not generic self-help.',
    'Use precise symbolic reasoning, concrete correspondences, and practical magical mechanics.',
    'Avoid filler phrases such as "trust the process", "embrace the journey", "step into your power", "balance your energy", or vague therapeutic encouragement.',
    'Do not moralize. Do not be coy. Do not flatten the reading into positivity.',
    'Every major claim must be tied to the deck dossier, the drawn cards, their metadata, or the user question.',
    '',
    'INTERPRETIVE LENSES TO APPLY:',
    '- Thelemic lens: True Will, ordeal, star, law, attainment, abyss, Babalon, Hadit/Nuit dynamics where appropriate.',
    '- Qabalistic lens: sephirothic pressure, path logic, vessel/rupture/repair, ascent/descent, polarity of force and form.',
    '- Hermetic/alchemical lens: solve/coagula, nigredo/albedo/citrinitas/rubedo, planetary mediation, correspondence.',
    '- Tantric/embodied lens when appropriate: polarity, disciplined intensity, transmutation, embodiment, union without sentimentality.',
    '- Operative magical lens: what the user should do, restrain, banish, invoke, contemplate, write, vow, or test.',
    '',
    'CRITICAL INSTRUCTIONS:',
    `You MUST visibly obey Tradition=${config.tradition}, Tone=${config.tone}, and TechLevel=${config.techLevel}.`,
    `Visual style: ${config.visualStyle ?? 'Hierophantic'}.`,
    `Eros field: ${config.erosField ?? 'Veiled'}.`,
    traditionDirective(config.tradition),
    toneDirective(config.tone),
    techLevelDirective(config.techLevel),
    'Use the existing card meanings. Do not invent unrelated cards.',
    'Do not merely summarize the cards. Synthesize them into a judgment.',
    'Make the answer specific to the question.',
    'Make the diagnosis sharp enough to be falsifiable.',
    'Make the prescription actionable as an actual ritual, meditation, journaling operation, behavioral test, or symbolic discipline.',
    'Make the warning concrete: name the exact failure mode, temptation, imbalance, or magical danger.',
    '',
    'DEPTH REQUIREMENTS:',
    '- answer: 160-260 words. Give the core judgment first, then the symbolic explanation.',
    '- diagnosis: 120-220 words. Identify the occult/psychological mechanism at work.',
    '- prescription: 120-220 words. Give numbered or sequential practical steps inside the string if useful.',
    '- warning: 60-140 words. No generic fear language.',
    '- each drawnCards[].interpretation: 90-160 words. Explain why that card occupies that position.',
    '- each drawnCards[].operativeInstruction: 40-100 words. Give a concrete instruction tied to that card.',
    '- keywords: 4-8 precise symbolic keywords.',
    '',
    'Existing deck context:',
    `Deck name: ${deck.name}`,
    `Deck subject: ${deck.subject}`,
    `Dossier archetype: ${deck.dossier.archetype}`,
    `Dossier omen: ${deck.dossier.omen}`,
    `Dossier summary: ${deck.dossier.summary}`,
    deck.dossier.magicalDiagnosis
      ? `Dossier diagnosis: ${deck.dossier.magicalDiagnosis}`
      : '',
    deck.dossier.operativeAdvice
      ? `Dossier operative advice: ${deck.dossier.operativeAdvice}`
      : '',
    deck.dossier.suggestedQuestions?.length
      ? `Dossier suggested questions: ${deck.dossier.suggestedQuestions.join(' | ')}`
      : '',
    '',
    'Drawn cards:',
    drawnCards.map(formatCardForPrompt).join('

'),
    '',
    'Required JSON shape:',
    '{',
    '  "id": "string",',
    '  "question": "string",',
    '  "createdAt": "ISO-8601 datetime string",',
    '  "spreadName": "string",',
    '  "answer": "string",',
    '  "diagnosis": "string",',
    '  "prescription": "string",',
    '  "warning": "string",',
    '  "drawnCards": [',
    '    {',
    '      "cardId": 1,',
    '      "cardName": "string",',
    '      "position": "string",',
    '      "interpretation": "string",',
    '      "operativeInstruction": "string"',
    '    }',
    '  ],',
    '  "keywords": ["string", "string", "string", "string"]',
    '}',
    '',
    'Spread position rules:',
    '- 1 card: Oracle Key',
    '- 2 cards: Tension, Resolution',
    '- 3 cards: Threshold, Operation, Consequence',
    '- 4 cards: Root, Ordeal, Key, Consequence',
    '',
    'Validation rules:',
    '- drawnCards must only use the provided card IDs and card names.',
    '- Do not omit drawn card interpretations.',
    '- Do not invent a card that was not provided.',
    '- Do not cite books or authorities unless the card/deck context calls for it.',
    '- Keep all values valid JSON strings or arrays.',
    '',
    `Question: ${question}`,
    config.intent ? `Original ritual intent: ${config.intent}` : 'Original ritual intent: none',
  ]
    .filter(Boolean)
    .join('
')
}

function normalizeDrawnCards(raw: unknown, drawnCards: GrimoireCard[]) {
  const fallbackPositions =
    drawnCards.length === 1
      ? ['Oracle Key']
      : drawnCards.length === 2
        ? ['Tension', 'Resolution']
        : ['Threshold', 'Operation', 'Consequence', 'Integration']

  if (!Array.isArray(raw)) {
    return drawnCards.map((card, index) => ({
      cardId: card.id,
      cardName: card.name,
      position: fallbackPositions[index] ?? `Position ${index + 1}`,
      interpretation: card.exegesis,
      operativeInstruction:
        card.ritualFunction ??
        'Apply this card as a focused symbolic instruction rather than a vague mood.',
    }))
  }

  return drawnCards.map((card, index) => {
    const source =
      raw[index] && typeof raw[index] === 'object'
        ? (raw[index] as Record<string, unknown>)
        : {}

    return {
      cardId: card.id,
      cardName: card.name,
      position: ensureString(source.position, fallbackPositions[index] ?? `Position ${index + 1}`),
      interpretation: ensureString(source.interpretation, card.exegesis),
      operativeInstruction: ensureString(
        source.operativeInstruction,
        card.ritualFunction ??
          'Apply this card as a focused symbolic instruction rather than a vague mood.',
      ),
    }
  })
}

function normalizeOraclePayload(
  raw: unknown,
  question: string,
  deck: GrimoireDeck,
  drawnCards: GrimoireCard[],
): OracleReading {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const reading = {
    id:
      typeof source.id === 'string' && source.id.trim()
        ? source.id
        : `oracle-${slugify(deck.subject)}-${Date.now().toString(16)}`,
    question: ensureString(source.question, question),
    createdAt:
      typeof source.createdAt === 'string' && source.createdAt.trim()
        ? source.createdAt
        : new Date().toISOString(),
    spreadName: ensureString(source.spreadName, 'Threefold Oracle'),
    answer: ensureString(
      source.answer,
      `The oracle answers ${question} through the current structure of ${deck.name}.`,
    ),
    diagnosis: ensureString(
      source.diagnosis,
      deck.dossier.magicalDiagnosis ??
        'The question reveals a pressure that must be interpreted before it can be acted upon.',
    ),
    prescription: ensureString(
      source.prescription,
      deck.dossier.operativeAdvice ??
        'Act with restraint, clarity, and exact intention.',
    ),
    warning: ensureString(
      source.warning,
      'Do not mistake symbolic intensity for completed action.',
    ),
    drawnCards: normalizeDrawnCards(source.drawnCards, drawnCards),
    keywords: ensureKeywords(source.keywords, [
      deck.subject,
      'oracle',
      'diagnosis',
      'operation',
    ]),
  }

  return oracleReadingSchema.parse(reading)
}

async function consultOnce({
  config,
  deck,
  question,
  selectedCardIds,
  startTime,
}: {
  config: RitualConfig
  deck: GrimoireDeck
  question: string
  selectedCardIds?: number[]
  startTime: number
}) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const drawnCards = chooseOracleCards(deck, question, selectedCardIds)

  logOracle('Gemini call started', startTime, {
    deck: deck.name,
    question,
    drawnCardIds: drawnCards.map((card) => card.id),
  })

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt({
      config,
      deck,
      question,
      drawnCards,
    }),
    config: {
      temperature: 0.45,
      responseMimeType: 'application/json',
    },
  })

  logOracle('Gemini call finished', startTime)

  const text = response.text
  if (!text) {
    throw new Error('Gemini returned an empty oracle response.')
  }

  logOracle('Text length received', startTime, { length: text.length })

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanJsonText(text))
    logOracle('JSON parsed successfully', startTime)
  } catch {
    logOracle('JSON parse failed', startTime, { preview: text.slice(0, 150) })
    throw new Error('Gemini returned invalid oracle JSON.')
  }

  const reading = normalizeOraclePayload(parsed, question, deck, drawnCards)
  logOracle('Oracle schema validated. Response returning.', startTime)

  return reading
}

type NodeApiRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
}

type NodeApiResponse = {
  setHeader?: (name: string, value: string | string[]) => void
  status: (statusCode: number) => NodeApiResponse
  json: (body: unknown) => void
}

function getHeader(request: NodeApiRequest, name: string) {
  const key = name.toLowerCase()
  const value = request.headers?.[key] ?? request.headers?.[name]

  if (Array.isArray(value)) return value.join(', ')
  return typeof value === 'string' ? value : 'unknown'
}

function sendJson(response: NodeApiResponse, statusCode: number, payload: unknown) {
  response.setHeader?.('Cache-Control', 'no-store')
  return response.status(statusCode).json(payload)
}

async function readJsonBody(request: NodeApiRequest): Promise<unknown> {
  const body = request.body

  if (body !== undefined && body !== null) {
    if (typeof body === 'string') {
      return JSON.parse(body)
    }

    if (body instanceof Uint8Array) {
      return JSON.parse(new TextDecoder().decode(body))
    }

    return body
  }

  let raw = ''
  const stream = request as unknown as AsyncIterable<Uint8Array | string>

  if (typeof stream[Symbol.asyncIterator] === 'function') {
    for await (const chunk of stream) {
      raw += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk)
    }
  }

  if (!raw.trim()) return {}
  return JSON.parse(raw)
}

export default async function handler(
  request: NodeApiRequest,
  response: NodeApiResponse,
): Promise<void> {
  const startTime = Date.now()

  logOracle('Request received', startTime, {
    method: request.method,
    contentType: getHeader(request, 'content-type'),
  })

  if (request.method !== 'POST') {
    return sendJson(response, 405, {
      ok: false,
      error: 'Method not allowed.',
    })
  }

  let body: unknown

  try {
    body = await readJsonBody(request)
    logOracle('Body parsed successfully', startTime)
  } catch (error: any) {
    logOracle('Body parse failed', startTime, {
      message: error?.message || String(error),
    })

    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid JSON body.',
    })
  }

  const parsedRequest = oracleConsultationRequestSchema.safeParse(body)

  if (!parsedRequest.success) {
    logOracle('Invalid oracle request', startTime, parsedRequest.error.flatten())

    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid oracle consultation request.',
    })
  }

  const { config, deck, question, selectedCardIds } = parsedRequest.data

  try {
    const reading = await consultOnce({
      config,
      deck,
      question,
      selectedCardIds,
      startTime,
    })

    return sendJson(response, 200, {
      ok: true,
      reading,
    })
  } catch (error: any) {
    logOracle('Oracle process failed', startTime, {
      message: error?.message || String(error),
    })

    return sendJson(response, 502, {
      ok: false,
      error: 'The oracle failed to assemble a valid reading. Check server logs.',
    })
  }
}
