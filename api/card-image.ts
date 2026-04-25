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
  deckId,
  cardId,
  cardName,
  sigil,
  artPrompt,
  visualStyle,
  erosField,
  metadata,
}: z.infer<typeof cardImageRequestSchema>) {
  const seed = hashString(`${deckId}:${cardId}:${cardName}:${sigil}:${artPrompt}`)
  const hueA = seed % 360
  const hueB = (hueA + 42 + (seed % 91)) % 360
  const hueC = (hueA + 190) % 360
  const promptLines = wrapText(artPrompt, 34, 4)
  const meta = metadataText(metadata)

  const styleLabel = visualStyle ?? 'Hierophantic'
  const erosLabel = erosField ?? 'Veiled'

  const nodeCount = 10
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2 + (seed % 13) * 0.05
    const r = 112 + ((seed >> (i % 8)) % 42)
    const x = 256 + Math.cos(angle) * r
    const y = 382 + Math.sin(angle) * r
    return { x, y }
  })

  const pathData = nodes
    .map((node, i) => `${i === 0 ? 'M' : 'L'} ${node.x.toFixed(1)} ${node.y.toFixed(1)}`)
    .join(' ') + ' Z'

  const smallGlyphs = ['☉', '☽', '♀', '☿', '♃', '♄', '✶', '◇']

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1152" viewBox="0 0 768 1152">
  <defs>
    <radialGradient id="aura" cx="50%" cy="38%" r="64%">
      <stop offset="0%" stop-color="hsl(${hueB}, 92%, 68%)" stop-opacity="0.95"/>
      <stop offset="34%" stop-color="hsl(${hueA}, 78%, 28%)" stop-opacity="0.82"/>
      <stop offset="74%" stop-color="#090205" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#020101" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe3a1"/>
      <stop offset="45%" stop-color="#b8860b"/>
      <stop offset="100%" stop-color="#fff1c6"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="768" height="1152" rx="46" fill="#050202"/>
  <rect x="28" y="28" width="712" height="1096" rx="36" fill="url(#aura)"/>
  <rect x="48" y="48" width="672" height="1056" rx="28" fill="none" stroke="url(#gold)" stroke-width="5" opacity="0.86"/>
  <rect x="72" y="72" width="624" height="1008" rx="20" fill="none" stroke="hsl(${hueC}, 84%, 68%)" stroke-width="2" opacity="0.42"/>

  <circle cx="384" cy="382" r="218" fill="#050104" opacity="0.48"/>
  <circle cx="384" cy="382" r="190" fill="none" stroke="url(#gold)" stroke-width="4" opacity="0.62"/>
  <circle cx="384" cy="382" r="144" fill="none" stroke="hsl(${hueB}, 94%, 72%)" stroke-width="2" opacity="0.56"/>
  <path d="${pathData}" fill="none" stroke="hsl(${hueC}, 92%, 70%)" stroke-width="3" opacity="0.54" filter="url(#softGlow)"/>

  ${nodes
    .map(
      (node, i) => `
  <circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${i % 3 === 0 ? 12 : 8}" fill="url(#gold)" opacity="${i % 3 === 0 ? 0.82 : 0.56}"/>
  <text x="${node.x.toFixed(1)}" y="${(node.y + 4).toFixed(1)}" text-anchor="middle" font-size="18" fill="#170804">${smallGlyphs[i % smallGlyphs.length]}</text>`,
    )
    .join('')}

  <text x="384" y="116" text-anchor="middle" font-size="34" font-family="serif" fill="#fff0c0" letter-spacing="3">${escapeXml(cardName.toUpperCase())}</text>
  <line x1="144" y1="144" x2="624" y2="144" stroke="url(#gold)" stroke-width="3" opacity="0.64"/>

  <text x="384" y="398" text-anchor="middle" font-size="96" font-family="serif" fill="#fff6d2" filter="url(#softGlow)">${escapeXml(sigil.slice(0, 18))}</text>
  <text x="384" y="476" text-anchor="middle" font-size="24" font-family="serif" fill="#f4c77d" letter-spacing="2">CARD ${cardId}</text>

  <g opacity="0.82">
    <path d="M192 704 C252 642, 316 642, 384 704 C452 642, 516 642, 576 704" fill="none" stroke="url(#gold)" stroke-width="4"/>
    <path d="M214 744 C274 704, 322 704, 384 744 C446 704, 494 704, 554 744" fill="none" stroke="hsl(${hueB}, 86%, 70%)" stroke-width="2"/>
  </g>

  <text x="384" y="814" text-anchor="middle" font-size="23" font-family="serif" fill="#ffe3a1">${escapeXml(styleLabel)} · ${escapeXml(erosLabel)}</text>
  ${meta ? `<text x="384" y="852" text-anchor="middle" font-size="19" font-family="serif" fill="#d6b37b">${escapeXml(meta)}</text>` : ''}

  ${promptLines
    .map(
      (line, i) =>
        `<text x="384" y="${928 + i * 30}" text-anchor="middle" font-size="20" font-family="serif" fill="#d8bf9b">${escapeXml(line)}</text>`,
    )
    .join('\n')}

  <rect x="96" y="1032" width="576" height="2" fill="url(#gold)" opacity="0.48"/>
  <text x="384" y="1076" text-anchor="middle" font-size="19" font-family="monospace" fill="#9f744b" letter-spacing="2">GRIMOIRE XR // IMAGE SEAL</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
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
