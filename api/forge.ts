import { GoogleGenAI } from '@google/genai'
import * as z from 'zod'
import { grimoireDeckSchema } from '../src/types/grimoire.js'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// --- Observability ---
function logForge(stage: string, startTime: number, extra?: any) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  if (extra) {
    console.log(`[FORGE | ${elapsed}s] ${stage}`, extra)
  } else {
    console.log(`[FORGE | ${elapsed}s] ${stage}`)
  }
}

// --- Schema Prep ---
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

// Assumes your Zod setup supports this based on the previous GPT fix
const responseJsonSchema = stripJsonSchemaNoise((z as any).toJSONSchema(grimoireDeckSchema))

// --- Coercion Utilities ---
function cleanJsonText(text: string) {
  return text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
}

function maybeParseJsonString(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try { return JSON.parse(trimmed) } catch { return value }
  }
  return value
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

function ensureString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function ensureKeywords(value: unknown, subject: string) {
  if (Array.isArray(value)) {
    const keywords = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean).slice(0, 6)
    if (keywords.length >= 2) return keywords
  }
  if (typeof value === 'string' && value.trim()) {
    const parts = value.split(/[,\n|]/g).map((item) => item.trim()).filter(Boolean).slice(0, 6)
    if (parts.length >= 2) return parts
  }
  const firstWord = subject.trim().split(/\s+/)[0] || 'Subject'
  return [firstWord, 'Threshold', 'Discipline', 'Will']
}

function normalizeMetadata(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const polarity = source.polarity === 'ascending' || source.polarity === 'descending' || source.polarity === 'balanced' ? source.polarity : 'balanced'
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
    exegesis: ensureString(source.exegesis, `${subject} encounters a sealed current here. Symbolic discipline is required.`),
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
  }
}

function coerceDeckPayload(raw: unknown, subject: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const dossier = normalizeDossier(maybeParseJsonString(source.dossier), subject)
  const rawCards = maybeParseJsonString(source.cards)
  const cards = Array.isArray(rawCards) ? rawCards.map((card, index) => normalizeCard(maybeParseJsonString(card), index, subject)) : []
  
  return {
    id: typeof source.id === 'string' && source.id.trim() ? source.id : `deck-${slugify(subject)}-${Date.now().toString(16)}`,
    name: typeof source.name === 'string' && source.name.trim() ? source.name : `Arcanum of ${subject}`,
    subject: typeof source.subject === 'string' && source.subject.trim() ? source.subject : subject,
    createdAt: typeof source.createdAt === 'string' && source.createdAt.trim() ? source.createdAt : new Date().toISOString(),
    dossier,
    cards,
  }
}

function buildPrompt(subject: string) {
  return [
    'Return exactly one JSON object.',
    'Do not return markdown. Do not wrap the object in quotes.',
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
    '- Create exactly 4 cards', // <-- REDUCED LOAD
    '- Card ids must be integers 1 through 4',
    '- Use a serious occult tone',
    `Subject: ${subject}`,
  ].join('\n')
}

export default async function handler(request: Request): Promise<Response> {
  const startTime = Date.now()
  logForge('Request received', startTime)

  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed.' }, { status: 405 })
  }

let body: unknown
let rawBody = ''

try {
  logForge('About to read raw body', startTime, {
    method: request.method,
    contentType: request.headers.get('content-type'),
  })

  rawBody = await request.text()

  logForge('Raw body received', startTime, {
    length: rawBody.length,
    preview: rawBody.slice(0, 200),
  })

  body = rawBody ? JSON.parse(rawBody) : {}

  logForge('Body JSON parsed successfully', startTime)
} catch (error: any) {
  logForge('Body parse failed', startTime, {
    message: error?.message || String(error),
    rawBodyPreview: rawBody.slice(0, 200),
  })

  return Response.json(
    { ok: false, error: 'Invalid JSON body.' },
    { status: 400 },
  )
}

  const subject = body && typeof body === 'object' && 'subject' in body
      ? String((body as { subject?: unknown }).subject ?? '').trim()
      : ''

  if (subject.length < 2) {
    return Response.json({ ok: false, error: 'Subject must be at least 2 characters.' }, { status: 400 })
  }

  if (!apiKey) {
    logForge('FATAL: Missing GEMINI_API_KEY', startTime)
    return Response.json({ ok: false, error: 'Server configuration error.' }, { status: 500 })
  }

  logForge('Gemini call started', startTime, { subject })

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model,
      contents: buildPrompt(subject),
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
        responseJsonSchema,
      },
    })
    
    logForge('Gemini call finished', startTime)

    const text = response.text
    if (!text) throw new Error('Gemini returned an empty response.')
    
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

    return Response.json({ ok: true, deck: finalDeck }, { status: 200 })

  } catch (error: any) {
    logForge('Forge process failed', startTime, { message: error.message || error })
    return Response.json(
      { ok: false, error: 'The forge failed to assemble a valid deck. Check server logs.' },
      { status: 502 }
    )
  }
}

