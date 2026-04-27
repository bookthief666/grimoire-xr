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


type HordeAsyncResponse = {
  id?: string
  message?: string
}

type HordeCheckResponse = {
  done?: boolean
  faulted?: boolean
  wait_time?: number
  queue_position?: number
}

type HordeStatusResponse = {
  done?: boolean
  faulted?: boolean
  generations?: Array<{
    img?: string
    seed?: string
    censored?: boolean
  }>
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAiPrompt({
  cardName,
  sigil,
  artPrompt,
  visualStyle,
  erosField,
  metadata,
}: z.infer<typeof cardImageRequestSchema>) {
  const meta = metadataText(metadata)

  return [
    `occult tarot card illustration titled "${cardName}"`,
    artPrompt,
    `central sigil: ${sigil}`,
    meta ? `correspondences: ${meta}` : '',
    `visual style: ${visualStyle ?? 'hierophantic esoteric digital painting'}`,
    `mood: ${erosField ?? 'veiled ritual intensity'}`,
    'sacred geometry, alchemical symbolism, luminous borders, cinematic lighting',
    'detailed tarot composition, no modern UI, no readable text, no watermark',
  ]
    .filter(Boolean)
    .join(', ')
}


function base64Mime(base64: string) {
  if (base64.startsWith('iVBOR')) return 'image/png'
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('UklGR')) return 'image/webp'
  return 'image/webp'
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

async function normalizeImageForWebGl(image: string): Promise<string | null> {
  const trimmed = image.trim()

  if (!trimmed) return null

  if (trimmed.startsWith('data:image/')) {
    return trimmed
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const imageResponse = await fetch(trimmed)

      if (!imageResponse.ok) {
        return trimmed
      }

      const contentType =
        imageResponse.headers.get('content-type')?.split(';')[0] || 'image/webp'

      const buffer = await imageResponse.arrayBuffer()
      const base64 = arrayBufferToBase64(buffer)

      return `data:${contentType};base64,${base64}`
    } catch {
      return trimmed
    }
  }

  const compactBase64 = trimmed.replace(/\s+/g, '')

  if (compactBase64.length > 64) {
    return `data:${base64Mime(compactBase64)};base64,${compactBase64}`
  }

  return null
}

async function generateWithAiHorde(
  payload: z.infer<typeof cardImageRequestSchema>,
): Promise<string | null> {
  const apiKey = process.env.AI_HORDE_API_KEY || '0000000000'
  const prompt = buildAiPrompt(payload)

  const submitResponse = await fetch('https://aihorde.net/api/v2/generate/async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      'Client-Agent': 'grimoire-xr:0.1:bookthief666',
    },
    body: JSON.stringify({
      prompt,
      params: {
        width: 768,
        height: 1152,
        steps: 28,
        cfg_scale: 7.5,
        sampler_name: 'k_euler_a',
        n: 1,
      },
      nsfw: false,
      censor_nsfw: true,
      trusted_workers: false,
      slow_workers: true,
      r2: true,
      shared: false,
      replacement_filter: true,
    }),
  })

  if (!submitResponse.ok) {
    return null
  }

  const submitJson = (await submitResponse.json()) as HordeAsyncResponse
  const id = submitJson.id

  if (!id) {
    return null
  }

  const startedAt = Date.now()
  const timeoutMs = 24000

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(2500)

    const checkResponse = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`, {
      headers: {
        apikey: apiKey,
        'Client-Agent': 'grimoire-xr:0.1:bookthief666',
      },
    })

    if (!checkResponse.ok) continue

    const checkJson = (await checkResponse.json()) as HordeCheckResponse

    if (checkJson.faulted) {
      return null
    }

    if (!checkJson.done) {
      continue
    }

    const statusResponse = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`, {
      headers: {
        apikey: apiKey,
        'Client-Agent': 'grimoire-xr:0.1:bookthief666',
      },
    })

    if (!statusResponse.ok) {
      return null
    }

    const statusJson = (await statusResponse.json()) as HordeStatusResponse
    const image = statusJson.generations?.[0]?.img

    if (typeof image === 'string' && image.length > 8) {
      return await normalizeImageForWebGl(image)
    }

    return null
  }

  return null
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

  const aiImageUrl = await generateWithAiHorde(parsed.data)
  const imageUrl = aiImageUrl ?? buildCardSvg(parsed.data)

  return sendJson(response, 200, {
    ok: true,
    imageUrl,
    provider: aiImageUrl ? 'ai-horde' : 'procedural-svg-fallback',
  })
}
