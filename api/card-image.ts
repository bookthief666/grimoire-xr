import * as z from 'zod'

export const maxDuration = 30

const cardImageRequestSchema = z.object({
  deckId: z.string().min(3),
  cardId: z.number().int().positive(),
  cardName: z.string().min(2),
  sigil: z.string().min(1),
  artPrompt: z.string().min(12),
  visualStyle: z.string().optional(),
  erosField: z.string().optional(),
  metadata: z.unknown().optional(),
})

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

function sendJson(response: NodeApiResponse, statusCode: number, payload: unknown) {
  response.setHeader?.('Cache-Control', 'no-store')
  return response.status(statusCode).json(payload)
}

async function readJsonBody(request: NodeApiRequest): Promise<unknown> {
  const body = request.body

  if (body !== undefined && body !== null) {
    if (typeof body === 'string') return JSON.parse(body)
    if (body instanceof Uint8Array) return JSON.parse(new TextDecoder().decode(body))
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

function hashString(input: string) {
  let hash = 2166136261

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function wrapText(value: string, maxChars = 31, maxLines = 5) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }

    if (lines.length >= maxLines) break
  }

  if (current && lines.length < maxLines) lines.push(current)
  return lines
}

function metadataText(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return ''

  const source = metadata as Record<string, unknown>
  const element = typeof source.element === 'string' ? source.element : ''
  const planet = typeof source.planet === 'string' ? source.planet : ''
  const alchemical = typeof source.alchemical === 'string' ? source.alchemical : ''

  return [element, planet, alchemical].filter(Boolean).slice(0, 3).join(' · ')
}

function buildCardSvg({
  cardId,
  cardName,
  sigil,
  visualStyle,
  erosField,
}: z.infer<typeof cardImageRequestSchema>) {
  const label = [
    `CARD ${cardId}`,
    cardName,
    sigil,
    visualStyle ?? 'Hierophantic',
    erosField ?? 'Veiled',
  ]
    .join(' | ')
    .slice(0, 120)

  return `https://dummyimage.com/768x1152/12030a/ffd18a.png&text=${encodeURIComponent(label)}`
}

export default async function handler(
  request: NodeApiRequest,
  response: NodeApiResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    return sendJson(response, 405, {
      ok: false,
      error: 'Method not allowed.',
    })
  }

  let body: unknown

  try {
    body = await readJsonBody(request)
  } catch {
    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid JSON body.',
    })
  }

  const parsed = cardImageRequestSchema.safeParse(body)

  if (!parsed.success) {
    return sendJson(response, 400, {
      ok: false,
      error: 'Invalid card image request.',
      details: parsed.error.flatten(),
    })
  }

  const imageUrl = buildCardSvg(parsed.data)

  return sendJson(response, 200, {
    ok: true,
    imageUrl,
    provider: 'procedural-svg',
  })
}
