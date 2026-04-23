import { GoogleGenAI } from '@google/genai'
import * as z from 'zod'
import {
  grimoireDeckSchema,
  ritualConfigSchema,
  type Tone,
  type Tradition,
} from '../src/types/grimoire.js'

export const maxDuration = 60

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

function normalizeMetadata(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const polarity =
    source.polarity === 'ascending' ||
    source.polarity === 'descending' ||
    source.polarity === 'balanced'
      ? source.polarity
      : 'balanced'

  return {
    element: ensureString(source.element, 'Aether'),
    planet: ensureString(source.planet, 'Saturn'),
    polarity,
    keywords: ensureKeywords(source.keywords, subject),
  }
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
      return 'Use Thelemic vocabulary, emphasizing will, ordeal, initiation, star, law, and magical attainment.'
    case 'hermetic':
      return 'Use Hermetic vocabulary, emphasizing correspondence, mental transmutation, balance, and the subtle architecture of reality.'
    case 'goetic':
      return 'Use severe ceremonial and pact-oriented vocabulary, emphasizing negotiation, compulsion, hierarchy, danger, and command.'
    case 'tarot':
      return 'Use precise tarot-oriented symbolic vocabulary, emphasizing archetypes, spread logic, thresholds, and inner patterns.'
    case 'kabbalistic':
      return 'Use Qabalistic vocabulary, emphasizing emanation, path, sephirothic structure, ascent, and symbolic discipline.'
    case 'tantric':
      return 'Use initiatory tantric vocabulary, emphasizing energy, polarity, disciplined transformation, embodied gnosis, and sacred intensity.'
    case 'chaos_magick':
      return 'Use operative chaos magick vocabulary, emphasizing belief as tool, sigils, paradigm shifting, directed intent, and results.'
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

function buildPrompt(subject: string, tradition: Tradition, tone: Tone) {
  return [
    'Return exactly one JSON object.',
    'Do not return markdown.',
    'Do not wrap the object in quotes.',
    'Do not stringify nested objects.',
    traditionDirective(tradition),
    toneDirective(tone),
    'Avoid generic mystical platitudes.',
    'Make the text feel symbolically exact, occult, and operational rather than vague.',
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
    '    "operativeAdvice": "string"',
    '  },',
    '  "cards": [',
    '    {',
    '      "id": 1,',
    '      "name": "string",',
    '      "sigil": "string",',
    '      "exegesis": "string",',
    '      "metadata": {',
    '        "element": "string",',
    '        "planet": "string",',
    '        "polarity": "ascending | descending | balanced",',
    '        "keywords": ["string", "string", "string", "string"]',
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
    '- Card names and exegeses must feel specific to the subject, tradition, and tone',
    '',
    `Subject: ${subject}`,
    `Tradition: ${tradition}`,
    `Tone: ${tone}`,
  ].join('\n')
}

async function forgeOnce(
  subject: string,
  tradition: Tradition,
  tone: Tone,
  startTime: number,
) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const ai = new GoogleGenAI({ apiKey })

  logForge('Gemini call started', startTime, { subject, tradition, tone })

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(subject, tradition, tone),
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

export default {
  async fetch(request: Request) {
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

    const { subject, tradition, tone } = parsedConfig.data

    try {
      const deck = await forgeOnce(subject, tradition, tone, startTime)
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
  },
}
