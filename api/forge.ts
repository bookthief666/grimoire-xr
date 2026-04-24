import { GoogleGenAI } from '@google/genai'
import * as z from 'zod'
import { TECH_LEVELS } from '../src/constants/ritualOptions.js'
import {
  grimoireDeckSchema,
  ritualConfigSchema,
  type TechLevel,
  type Tone,
  type Tradition,
} from '../src/types/grimoire.js'

export const runtime = 'edge'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function logForge(stage: string, startTime: number, extra?: unknown) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  if (extra !== undefined) {
    console.log(`[FORGE | ${elapsed}s] ${stage}`, extra)
  } else {
    console.log(`[FORGE | ${elapsed}s] ${stage}`)
  }
}

function stripJsonSchemaNoise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripJsonSchemaNoise)

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === '$schema') continue
      out[key] = stripJsonSchemaNoise(child)
    }
    return out
  }

  return value
}

const responseJsonSchema = stripJsonSchemaNoise(z.toJSONSchema(grimoireDeckSchema))

function cleanJsonText(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
}

function maybeParseJsonString(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }

  return value
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

function ensureOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function ensureOptionalGematria(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value))
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10)
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed)
    }
  }

  return undefined
}

function ensureKeywords(value: unknown, subject: string) {
  if (Array.isArray(value)) {
    const keywords = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 6)

    if (keywords.length >= 2) return keywords
  }

  if (typeof value === 'string' && value.trim()) {
    const parts = value
      .split(/[,\n|]/g)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)

    if (parts.length >= 2) return parts
  }

  const firstWord = subject.trim().split(/\s+/)[0] || 'Subject'
  return [firstWord, 'Threshold', 'Discipline', 'Will']
}

function ensureSuggestedQuestions(value: unknown, subject: string) {
  if (Array.isArray(value)) {
    const questions = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3)

    if (questions.length > 0) return questions
  }

  return [
    `What hidden current is shaping ${subject}?`,
    `What must be renounced or disciplined in ${subject}?`,
    `What operation would bring ${subject} into clearer manifestation?`,
  ]
}

function normalizeMetadata(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const polarity =
    source.polarity === 'ascending' ||
    source.polarity === 'descending' ||
    source.polarity === 'balanced'
      ? source.polarity
      : 'balanced'

  const metadata: Record<string, unknown> = {
    element: ensureString(source.element, 'Aether'),
    planet: ensureString(source.planet, 'Saturn'),
    polarity,
    keywords: ensureKeywords(source.keywords, subject),
  }

  const alchemical = ensureOptionalString(source.alchemical)
  const hebrew = ensureOptionalString(source.hebrew)
  const daimon = ensureOptionalString(source.daimon)
  const gematria = ensureOptionalGematria(source.gematria)

  if (alchemical) metadata.alchemical = alchemical
  if (hebrew) metadata.hebrew = hebrew
  if (daimon) metadata.daimon = daimon
  if (gematria !== undefined) metadata.gematria = gematria

  return metadata
}

function normalizeCard(raw: unknown, index: number, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  return {
    id: typeof source.id === 'number' && Number.isInteger(source.id) ? source.id : index + 1,
    name: ensureString(source.name, `Unnamed Arcanum ${index + 1}`),
    sigil: ensureString(source.sigil, `SIGIL-${(index + 1).toString(16).toUpperCase()}`),
    exegesis: ensureString(
      source.exegesis,
      `${subject} encounters a sealed current here. Symbolic discipline is required.`,
    ),
    ritualFunction: ensureString(
      source.ritualFunction,
      `This arcanum concentrates one operative aspect of the working and shows how the subject must be handled with precision.`,
    ),
    metadata: normalizeMetadata(maybeParseJsonString(source.metadata), subject),
  }
}

function normalizeDossier(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  return {
    subject: ensureString(source.subject, subject),
    archetype: ensureString(source.archetype, 'Witness of the Inner Threshold'),
    omen: ensureString(source.omen, 'The altar answers in a language of embers.'),
    summary: ensureString(source.summary, `${subject} enters the forge. The ritual demands clarity.`),
    magicalDiagnosis: ensureString(
      source.magicalDiagnosis,
      `${subject} is entangled in a formative symbolic pressure that must be interpreted before it can be directed.`,
    ),
    operativeAdvice: ensureString(
      source.operativeAdvice,
      `Proceed with precision, restraint, and exact intention. Do not force what has not yet been ritually clarified.`,
    ),
    suggestedQuestions: ensureSuggestedQuestions(source.suggestedQuestions, subject),
  }
}

function coerceDeckPayload(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const dossier = normalizeDossier(maybeParseJsonString(source.dossier), subject)
  const rawCards = maybeParseJsonString(source.cards)

  const cards = Array.isArray(rawCards)
    ? rawCards.map((card, index) => normalizeCard(maybeParseJsonString(card), index, subject))
    : []

  return {
    id:
      typeof source.id === 'string' && source.id.trim()
        ? source.id
        : `deck-${slugify(subject)}-${Date.now().toString(16)}`,
    name:
      typeof source.name === 'string' && source.name.trim()
        ? source.name
        : `Arcanum of ${subject}`,
    subject:
      typeof source.subject === 'string' && source.subject.trim()
        ? source.subject
        : subject,
    createdAt:
      typeof source.createdAt === 'string' && source.createdAt.trim()
        ? source.createdAt
        : new Date().toISOString(),
    dossier,
    cards,
  }
}

function traditionDirective(tradition: Tradition) {
  switch (tradition) {
    case 'thelemic':
      return 'Use Thelemic vocabulary, emphasizing will, ordeal, initiation, star, law, attainment, Babalon, and magical ascent.'
    case 'hermetic':
      return 'Use Hermetic vocabulary, emphasizing correspondence, balance, alchemical process, subtle architecture, and mental transmutation.'
    case 'goetic':
      return 'Use severe ceremonial and pact-oriented vocabulary, emphasizing hierarchy, command, negotiation, danger, compulsion, and constrained power.'
    case 'tarot':
      return 'Use precise tarot-oriented symbolic vocabulary, emphasizing archetypes, thresholds, inversion, psychic patterning, and divinatory structure.'
    case 'kabbalistic':
      return 'Use Qabalistic vocabulary, emphasizing emanation, path, sephirothic structure, ascent, descent, and symbolic discipline.'
    case 'tantric':
      return 'Use initiatory tantric vocabulary, emphasizing energy, polarity, disciplined transformation, embodied gnosis, sacred intensity, and union.'
    case 'chaos_magick':
      return 'Use operative chaos magick vocabulary, emphasizing sigils, paradigm shifting, belief as instrument, directed intent, and concrete results.'
  }
}

function toneDirective(tone: Tone) {
  switch (tone) {
    case 'scholarly':
      return 'Write with analytic clarity, precision, and restraint. Avoid melodrama.'
    case 'oracular':
      return 'Write with gnomic gravity, prophetic cadence, and solemn symbolic authority.'
    case 'visionary':
      return 'Write with luminous imaginal intensity, but remain coherent and exact.'
    case 'severe':
      return 'Write with austerity, directness, and ritual seriousness. Avoid ornament unless symbolically necessary.'
    case 'ecstatic':
      return 'Write with heightened spiritual and initiatory intensity, but keep the language disciplined and non-generic.'
  }
}

function techLevelDirective(techLevel: TechLevel) {
  return TECH_LEVELS[techLevel].instruction
}

function correspondenceDirective(techLevel: TechLevel) {
  switch (techLevel) {
    case 'neophyte':
      return 'Keep correspondences light and readable. Use the extra metadata only when it genuinely clarifies the reading.'
    case 'adept':
      return 'Use moderate esoteric density. Include alchemical and Hebrew correspondences where they materially sharpen the interpretation.'
    case 'magus':
      return 'Use high-magick density. For each card, strongly prefer including alchemical, hebrew, daimon, and gematria correspondences in a meaningful, non-random way.'
  }
}

function buildPrompt(
  subject: string,
  tradition: Tradition,
  tone: Tone,
  techLevel: TechLevel,
  intent?: string,
) {
  return [
    'Return exactly one JSON object.',
    'Do not return markdown.',
    'Do not wrap the object in quotes.',
    'Do not stringify nested objects.',
    '',
    'CRITICAL INSTRUCTIONS:',
    `You MUST visibly obey Tradition=${tradition}, Tone=${tone}, and TechLevel=${techLevel}.`,
    'The result must not read like a generic mystical reading that could fit any system.',
    traditionDirective(tradition),
    toneDirective(tone),
    techLevelDirective(techLevel),
    correspondenceDirective(techLevel),
    'Avoid generic mystical platitudes.',
    'Make the text symbolically exact, occult, and operational rather than vague.',
    '',
    'The output must be a plain JSON object with this exact top-level shape:',
    '{',
    '  "id": "string",',
    '  "name": "string",',
    '  "subject": "string",',
    '  "createdAt": "ISO-8601 datetime string",',
    '  "dossier": {',
    '    "subject": "string",',
    '    "archetype": "string",',
    '    "omen": "string",',
    '    "summary": "string",',
    '    "magicalDiagnosis": "string",',
    '    "operativeAdvice": "string",',
    '    "suggestedQuestions": ["string", "string", "string"]',
    '  },',
    '  "cards": [',
    '    {',
    '      "id": 1,',
    '      "name": "string",',
    '      "sigil": "string",',
    '      "exegesis": "string",',
    '      "ritualFunction": "string",',
    '      "metadata": {',
    '        "element": "string",',
    '        "planet": "string",',
    '        "polarity": "ascending | descending | balanced",',
    '        "keywords": ["string", "string", "string", "string"],',
    '        "alchemical": "string",',
    '        "hebrew": "string",',
    '        "daimon": "string",',
    '        "gematria": 111',
    '      }',
    '    }',
    '  ]',
    '}',
    '',
    'Requirements:',
    '- Create exactly 4 cards',
    '- Card ids must be integers 1 through 4',
    '- The deck must feel internally coherent',
    '- The dossier must diagnose the subject clearly',
    '- The operative advice must be actionable, disciplined, and non-generic',
    '- suggestedQuestions must be short, sharp, and useful follow-up questions for consultation',
    '- Each card must have a ritualFunction explaining its operative role inside the reading',
    '- Card names and exegeses must feel specific to the subject, tradition, tone, tech level, and stated query',
    '- If an intent/query is provided, the dossier and card logic must respond directly to it',
    '- For magus, card metadata should become visibly more technical and correspondence-heavy',
    '',
    `Subject: ${subject}`,
    `Tradition: ${tradition}`,
    `Tone: ${tone}`,
    `TechLevel: ${techLevel}`,
    intent && intent.trim()
      ? `Intent / Query: ${intent.trim()}`
      : 'Intent / Query: none explicitly provided',
  ].join('\n')
}

async function forgeOnce(
  subject: string,
  tradition: Tradition,
  tone: Tone,
  techLevel: TechLevel,
  intent: string | undefined,
  startTime: number,
) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const ai = new GoogleGenAI({ apiKey })

  logForge('Gemini call started', startTime, {
    subject,
    tradition,
    tone,
    techLevel,
    intent,
  })

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(subject, tradition, tone, techLevel, intent),
    config: {
      temperature: 0.5,
      responseMimeType: 'application/json',
      responseJsonSchema,
    },
  })

  logForge('Gemini call finished', startTime)

  const text = response.text
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  logForge('Text length received', startTime, { length: text.length })

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanJsonText(text))
    logForge('JSON parsed successfully', startTime)
  } catch {
    logForge('JSON parse failed', startTime, { preview: text.slice(0, 150) })
    throw new Error('Gemini returned invalid JSON.')
  }

  const normalized = coerceDeckPayload(parsed, subject)
  logForge('Payload normalized', startTime)

  const finalDeck = grimoireDeckSchema.parse(normalized)
  logForge('Schema validated. Response returning.', startTime)

  return finalDeck
}

export default async function handler(request: Request): Promise<Response> {
  const startTime = Date.now()

  logForge('Request received', startTime, {
    method: request.method,
    contentType:
      request && request.headers && typeof request.headers.get === 'function'
        ? request.headers.get('content-type')
        : 'unknown',
  })

  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
  }

  let body: unknown
  try {
    body = await request.json()
    logForge('Body parsed successfully', startTime)
  } catch (error: any) {
    logForge('Body parse failed', startTime, {
      message: error?.message || String(error),
    })
    return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsedConfig = ritualConfigSchema.safeParse(body)

  if (!parsedConfig.success) {
    return Response.json(
      { ok: false, error: 'Invalid ritual configuration.' },
      { status: 400 },
    )
  }

  const { subject, tradition, tone, techLevel, intent } = parsedConfig.data

  try {
    const deck = await forgeOnce(
      subject,
      tradition,
      tone,
      techLevel,
      intent,
      startTime,
    )

    return Response.json({ ok: true, deck }, { status: 200 })
  } catch (error: any) {
    logForge('Forge process failed', startTime, {
      message: error?.message || String(error),
    })

    return Response.json(
      { ok: false, error: 'The forge failed to assemble a valid deck. Check server logs.' },
      { status: 502 },
    )
  }
}
