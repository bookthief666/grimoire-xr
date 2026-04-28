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

function ensureOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function ensureOptionalUrl(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()

  if (!trimmed) return undefined

  // Do not trust Gemini-provided remote image URLs.
  // Generated images should come only from the local render pipeline or future owned storage.
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/api/')
  ) {
    return trimmed
  }

  return undefined
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

function buildFallbackArtPrompt({
  subject,
  cardName,
  sigil,
  visualStyle,
  erosField,
}: {
  subject: string
  cardName: string
  sigil: string
  visualStyle?: string
  erosField?: string
}) {
  return [
    `Vertical occult tarot-card illustration for "${cardName}" in a custom deck about "${subject}".`,
    `Central sigil: ${sigil}.`,
    `Visual style: ${visualStyle ?? 'Hierophantic'}.`,
    `Eros field: ${erosField ?? 'Veiled'}; symbolic, devotional, veiled sensuality only; no explicit nudity.`,
    'Obsidian and burnished gold altar atmosphere, Hermetic/Thelemic symbolism, luminous planetary geometry, elegant ritual composition.',
    'Beautiful painterly card art, sharp sacred geometry, rich symbolic detail, no text labels, no watermark.',
  ].join(' ')
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

function normalizeCard(raw: unknown, index: number, subject: string, visualStyle?: string, erosField?: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const id = typeof source.id === 'number' && Number.isInteger(source.id) ? source.id : index + 1
  const name = ensureString(source.name, `Unnamed Arcanum ${index + 1}`)
  const sigil = ensureString(source.sigil, `SIGIL-${(index + 1).toString(16).toUpperCase()}`)

  return {
    id,
    name,
    sigil,
    exegesis: ensureString(
      source.exegesis,
      `${subject} encounters a sealed current here. Symbolic discipline is required.`,
    ),
    ritualFunction: ensureString(
      source.ritualFunction,
      `This arcanum concentrates one operative aspect of the working and shows how the subject must be handled with precision.`,
    ),
    artPrompt: ensureString(
      source.artPrompt,
      buildFallbackArtPrompt({ subject, cardName: name, sigil, visualStyle, erosField }),
    ),
    imageUrl: ensureOptionalUrl(source.imageUrl),
    imageStatus:
      source.imageStatus === 'ready' ||
      source.imageStatus === 'generating' ||
      source.imageStatus === 'error'
        ? source.imageStatus
        : 'pending',
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

function coerceDeckPayload(raw: unknown, subject: string, visualStyle?: string, erosField?: string) {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const dossier = normalizeDossier(maybeParseJsonString(source.dossier), subject)
  const rawCards = maybeParseJsonString(source.cards)

  const cards = Array.isArray(rawCards)
    ? rawCards.map((card, index) => normalizeCard(maybeParseJsonString(card), index, subject, visualStyle, erosField))
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
  return TECH_LEVELS[techLevel]?.instruction ?? TECH_LEVELS.adept.instruction
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

function buildPrompt({
  subject,
  tradition,
  tone,
  techLevel,
  visualStyle,
  erosField,
  intent,
}: {
  subject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  visualStyle?: string
  erosField?: string
  intent?: string
}) {
  return [
    'Return exactly one JSON object.',
    'Do not return markdown.',
    'Do not wrap the object in quotes.',
    'Do not stringify nested objects.',
    '',
    'You are the Forge layer of Grimoire XR: an initiated occult systems designer, Thelemic/Hermetic symbolic analyst, Qabalistic cartographer, and ritual strategist.',
    'You are forging a symbolic deck, not writing generic tarot copy.',
    'The output must feel like a serious esoteric instrument: precise, strange, beautiful, operative, and intellectually sharp.',
    '',
    'QUALITY STANDARD:',
    'Avoid generic mystical filler such as "embrace the journey", "trust the process", "step into your power", "balance your energy", or "listen to your intuition".',
    'Do not produce vague positivity. Do not flatten the subject into self-help.',
    'Every card must have a distinct function in the ritual system.',
    'Every correspondence must make symbolic sense.',
    'Every exegesis must explain the occult mechanism, not merely decorate the card name.',
    'The language should be vivid but controlled: no purple-prose fog, no empty grandiosity.',
    '',
    'INTERPRETIVE LENSES TO APPLY:',
    '- Thelemic: True Will, ordeal, star, law, attainment, abyss, Babalon, Hadit/Nuit dynamics where appropriate.',
    '- Qabalistic: sephirothic pressure, path logic, ascent/descent, vessel, rupture, repair, polarity of force and form.',
    '- Hermetic/alchemical: solve/coagula, nigredo/albedo/citrinitas/rubedo, planetary mediation, correspondence.',
    '- Tantric/embodied: disciplined intensity, polarity, transmutation, embodied gnosis, sacred union without sentimentality.',
    '- Operative magical: what the card asks the user to do, restrain, invoke, banish, contemplate, test, vow, or enact.',
    '',
    'CRITICAL INSTRUCTIONS:',
    `You MUST visibly obey Tradition=${tradition}, Tone=${tone}, and TechLevel=${techLevel}.`,
    traditionDirective(tradition),
    toneDirective(tone),
    techLevelDirective(techLevel),
    'The subject must be treated as a symbolic complex, not merely a theme.',
    'Each card must be meaningfully different from the others.',
    'Each card must include a concrete ritualFunction.',
    'Metadata must not be random: element, planet, polarity, keywords, alchemical, Hebrew, daimon, and gematria should support the card meaning.',
    '',
    'DOSSIER REQUIREMENTS:',
    '- archetype: name the governing archetypal pattern of the subject.',
    '- omen: one memorable symbolic omen, concrete and image-rich.',
    '- summary: 120-220 words explaining the subject as an initiatory field.',
    '- magicalDiagnosis: 120-220 words identifying the central tension, hidden cost, shadow, or occult mechanism.',
    '- operativeAdvice: 100-180 words giving practical symbolic/ritual orientation.',
    '- suggestedQuestions: 3 strong questions the user could ask the oracle.',
    '',
    'CARD ART REQUIREMENTS:',
    '- Every card must include artPrompt.',
    '- artPrompt must be a direct image-generation prompt for a vertical tarot/oracle card.',
    '- artPrompt must include: central image, composition, palette, symbols, correspondences, ritual atmosphere, and visual style.',
    '- artPrompt must honor visualStyle and erosField.',
    '- Eros field must remain symbolic and non-explicit: veiled sensuality, devotional tension, sacred polarity, no explicit nudity.',
    '- Do not reference copyrighted living artists, franchises, or style names that would create an IP problem.',
    '- Set imageStatus to "pending".',
    '',
    'CARD REQUIREMENTS:',
    '- Create 7 cards unless the schema/request elsewhere requires more.',
    '- name: concise, memorable, archetypal.',
    '- sigil: short symbolic formula, not random letters.',
    '- exegesis: 140-240 words. Explain the card as a precise occult mechanism.',
    '- ritualFunction: 80-150 words. Give the card’s use in practice: contemplation, banishing, invocation, vow, behavioral test, journaling rite, or visualization.',
    '- metadata.element: one of Fire, Water, Air, Earth, Aether, Salt, Sulfur, Mercury, Spirit, Void, or a similarly defensible esoteric element.',
    '- metadata.planet: a real planetary/astrological force or symbolic luminary where appropriate.',
    '- metadata.polarity: ascending, descending, or balanced.',
    '- metadata.keywords: 4-6 sharp symbolic keywords.',
    '- metadata.alchemical: specific phase/substance/process where possible.',
    '- metadata.hebrew: a relevant Hebrew letter, word, or Qabalistic hint where appropriate. If uncertain, use a defensible symbolic term rather than fabricating scholarship.',
    '- metadata.daimon: a poetic daimonic office or intelligence, not a copyrighted or real-world spirit claim unless tradition strongly implies it.',
    '- metadata.gematria: a plausible integer used symbolically, not presented as historical proof.',
    '',
    'Required JSON shape:',
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
    '        "polarity": "ascending",',
    '        "keywords": ["string", "string", "string", "string"],',
    '        "alchemical": "string",',
    '        "hebrew": "string",',
    '        "daimon": "string",',
    '        "gematria": 93',
    '      }',
    '    }',
    '  ]',
    '}',
    '',
    'Validation rules:',
    '- Return only valid JSON.',
    '- Do not include comments.',
    '- Do not include markdown.',
    '- Do not omit required fields.',
    '- Use positive integer card IDs starting at 1.',
    '- createdAt must be a valid ISO-8601 datetime string.',
    '- suggestedQuestions must have no more than 3 entries.',
    '- cards must have at least 3 entries; 7 is preferred.',
    '- Keep the content rich, but do not exceed reasonable JSON size.',
    '',
    `Subject: ${subject}`,
    `Tradition: ${tradition}`,
    `Tone: ${tone}`,
    `Tech level: ${techLevel}`,
    `Visual style: ${visualStyle ?? 'Hierophantic'}`,
    `Eros field: ${erosField ?? 'Veiled'}`,
    intent ? `Ritual intent: ${intent}` : 'Ritual intent: none supplied',
  ]
    .filter(Boolean)
    .join('\n')
}

async function forgeOnce(
  subject: string,
  tradition: Tradition,
  tone: Tone,
  techLevel: TechLevel,
  visualStyle: string | undefined,
  erosField: string | undefined,
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
    visualStyle,
    erosField,
    intent,
  })

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt({
      subject,
      tradition,
      tone,
      techLevel,
      visualStyle,
      erosField,
      intent,
    }),
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

  const normalized = coerceDeckPayload(parsed, subject, visualStyle, erosField)
  logForge('Payload normalized', startTime)

  const finalDeck = grimoireDeckSchema.parse(normalized)

  logForge('Art-ready deck summary', startTime, {
    cardCount: finalDeck.cards.length,
    firstCardName: finalDeck.cards[0]?.name,
    firstCardHasArtPrompt: Boolean(finalDeck.cards[0]?.artPrompt),
    firstCardImageStatus: finalDeck.cards[0]?.imageStatus,
    firstArtPromptLength: finalDeck.cards[0]?.artPrompt?.length ?? 0,
  })

  logForge('Schema validated. Response returning.', startTime)

  return finalDeck
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

  logForge('Request received', startTime, {
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
    logForge('Body parsed successfully', startTime)
  } catch (error: any) {
    logForge('Body parse failed', startTime, {
      message: error?.message || String(error),
    })

    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid JSON body.',
    })
  }

  const parsedConfig = ritualConfigSchema.safeParse(body)

  if (!parsedConfig.success) {
    logForge('Invalid ritual configuration', startTime, parsedConfig.error.flatten())

    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid ritual configuration.',
    })
  }

  const { subject, tradition, tone, techLevel, visualStyle, erosField, intent } = parsedConfig.data

  try {
    const deck = await forgeOnce(
      subject,
      tradition,
      tone,
      techLevel,
      visualStyle,
      erosField,
      intent,
      startTime,
    )

    return sendJson(response, 200, {
      ok: true,
      deck,
    })
  } catch (error: any) {
    logForge('Forge process failed', startTime, {
      message: error?.message || String(error),
    })

    return sendJson(response, 502, {
      ok: false,
      error: 'The forge failed to assemble a valid deck. Check server logs.',
    })
  }
}
