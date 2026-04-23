import { GoogleGenAI } from '@google/genai'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { grimoireDeckSchema } from '../src/types/grimoire.js'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function stripJsonSchemaNoise(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripJsonSchemaNoise)
  }

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

const responseSchema = stripJsonSchemaNoise(zodToJsonSchema(grimoireDeckSchema))

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
      `${subject} encounters a sealed current here. The card indicates a force that must be ordered, interpreted, and brought under exact symbolic discipline.`,
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
    summary: ensureString(
      source.summary,
      `${subject} enters the forge under a severe but lucid current. The ritual demands symbolic precision, disciplined will, and clarity before expansion.`,
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

function buildPrompt(subject: string) {
  return [
    'Return exactly one JSON object.',
    'Do not return markdown.',
    'Do not return commentary.',
    'Do not wrap the object in quotes.',
    'Do not stringify nested objects.',
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
    '    "summary": "string"',
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
    '- Create exactly 8 cards',
    '- Card ids must be integers 1 through 8',
    '- Cards must be unique and symbolically coherent',
    '- Dossier must be an object, not a string',
    '- Cards must be an array, not a string',
    '- Use a serious occult tone',
    '- Make the deck elegant, symbolically dense, and ceremonial',
    '',
    `Subject: ${subject}`,
  ].join('\n')
}

async function forgeOnce(subject: string) {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(subject),
    config: {
      temperature: 0.5,
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanJsonText(text))
    parsed = maybeParseJsonString(parsed)
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${text.slice(0, 300)}`)
  }

  const normalized = coerceDeckPayload(parsed, subject)

  try {
    return grimoireDeckSchema.parse(normalized)
  } catch (error) {
    console.error('Forge validation failed.', {
      subject,
      rawText: text,
      parsed,
      normalized,
      error,
    })
    throw error
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const subject =
    body && typeof body === 'object' && 'subject' in body
      ? String((body as { subject?: unknown }).subject ?? '').trim()
      : ''

  if (subject.length < 2) {
    return Response.json(
      { ok: false, error: 'Subject must be at least 2 characters.' },
      { status: 400 },
    )
  }

  let lastError: unknown = null

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const deck = await forgeOnce(subject)
      return Response.json({ ok: true, deck }, { status: 200 })
    } catch (error) {
      lastError = error
      console.error(`Forge attempt ${attempt} failed.`, error)
    }
  }

  console.error('Ritual forge failed after retries.', lastError)

  return Response.json(
    { ok: false, error: 'The forge failed to assemble a valid deck. Try again.' },
    { status: 502 },
  )
}
