import { GoogleGenAI } from '@google/genai'
import { grimoireDeckSchema } from '../src/types/grimoire.js'
import { grimoireDeckSchema } from '../src/types/grimoire'

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

const responseJsonSchema = stripJsonSchemaNoise(
  zodToJsonSchema(grimoireDeckSchema)
)

function buildPrompt(subject: string) {
  return [
    'You are forging a bespoke occult arcanum deck for a ceremonial XR temple interface.',
    'Return only JSON matching the provided schema.',
    'No markdown. No prose outside the JSON object. No code fences.',
    'Tone: serious, elegant, occult, symbolically precise, never cheesy.',
    'Generate exactly one deck for this subject:',
    `Subject: ${subject}`,
    '',
    'Requirements:',
    '- deck name should feel distinctive and ceremonial',
    '- dossier should include subject, archetype, omen, and summary',
    '- create 8 cards',
    '- each card must have a unique id from 1 to 8',
    '- each card needs a unique name',
    '- each card needs a sigil string',
    '- each card needs a substantial exegesis',
    '- metadata must include element, planet, polarity, and keywords',
    '- keywords should be compact and symbolically useful',
    '- keep everything coherent around the subject',
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
      temperature: 0.6,
      responseMimeType: 'application/json',
      responseJsonSchema,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsed = JSON.parse(text)
  return grimoireDeckSchema.parse(parsed)
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return Response.json(
        { ok: false, error: 'Method not allowed.' },
        { status: 405 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { ok: false, error: 'Invalid JSON body.' },
        { status: 400 }
      )
    }

    const subject =
      body && typeof body === 'object' && 'subject' in body
        ? String((body as { subject?: unknown }).subject ?? '').trim()
        : ''

    if (subject.length < 2) {
      return Response.json(
        { ok: false, error: 'Subject must be at least 2 characters.' },
        { status: 400 }
      )
    }

    let lastError: unknown = null

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const deck = await forgeOnce(subject)
        return Response.json({ ok: true, deck }, { status: 200 })
      } catch (error) {
        lastError = error
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : 'Ritual forge failed.'

    return Response.json(
      { ok: false, error: message },
      { status: 502 }
    )
  },
}
