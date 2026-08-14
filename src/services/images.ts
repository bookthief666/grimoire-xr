import type {
  ArtStyle,
  CardMetadata,
  ErosField,
  ErosLevel,
  TarotSystem,
  VisualStyle,
} from '../types/grimoire'
import { apiUrl } from './apiBase'

export type CardImageQualityMode = 'preview' | 'final'

export type CardImageRequest = {
  deckId: string
  cardId: number
  cardName: string
  sigil: string
  artPrompt: string
  tarotSystem?: TarotSystem
  erosLevel?: ErosLevel
  artStyle?: ArtStyle
  visualStyle?: VisualStyle
  erosField?: ErosField
  metadata?: CardMetadata
  qualityMode?: CardImageQualityMode
  seed?: number
}

type CardImageSuccess = {
  ok: true
  imageUrl: string
  provider?: string
}

export type CardImageHealth = {
  ok: boolean
  provider?: string
  comfyuiVersion?: string
  configuredCheckpoint?: string
  checkpointAvailable?: boolean
  models?: string[]
  error?: string
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(fallbackMessage)
  }
}

export async function getCardImageHealth(): Promise<CardImageHealth> {
  const response = await fetch(apiUrl('/api/card-image-health'), {
    method: 'GET',
    cache: 'no-store',
  })

  const payload = await parseJsonResponse<CardImageHealth>(
    response,
    'Card image health endpoint returned an unreadable response.',
  )

  if (!response.ok || !payload.ok) {
    return {
      ...payload,
      ok: false,
      error: payload.error || `Image service health check failed (${response.status}).`,
    }
  }

  return payload
}

export async function generateCardImage(
  request: CardImageRequest,
): Promise<CardImageSuccess> {
  const startResponse = await fetch(apiUrl('/api/card-image-start'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      qualityMode: request.qualityMode ?? 'final',
    }),
  })

  const startPayload = await parseJsonResponse<
    { ok: true; promptId: string; provider?: string } | { ok: false; error: string; details?: string }
  >(startResponse, 'Card image start endpoint returned an unreadable response.')

  if (!startResponse.ok || !startPayload.ok) {
    throw new Error(!startPayload.ok ? startPayload.error : 'Card image start failed.')
  }

  const startedAt = Date.now()
  const timeoutMs = 900000

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => window.setTimeout(resolve, 3000))

    const statusResponse = await fetch(
      apiUrl(`/api/card-image-status?promptId=${encodeURIComponent(startPayload.promptId)}&t=${Date.now()}`),
      { cache: 'no-store' },
    )

    const statusPayload = await parseJsonResponse<
      | { ok: true; status: 'processing'; provider?: string }
      | { ok: true; status: 'ready'; imageUrl: string; provider?: string }
      | { ok: false; error: string }
    >(statusResponse, 'Card image status endpoint returned an unreadable response.')

    if (!statusResponse.ok || !statusPayload.ok) {
      throw new Error(!statusPayload.ok ? statusPayload.error : 'Card image status failed.')
    }

    if (statusPayload.status === 'ready') {
      return {
        ok: true,
        imageUrl: statusPayload.imageUrl,
        provider: statusPayload.provider ?? 'comfyui',
      }
    }
  }

  throw new Error('ComfyUI image generation timed out.')
}
