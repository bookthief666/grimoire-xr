import type { CardMetadata, ErosField, VisualStyle } from '../types/grimoire'

export type CardImageRequest = {
  deckId: string
  cardId: number
  cardName: string
  sigil: string
  artPrompt: string
  visualStyle?: VisualStyle
  erosField?: ErosField
  metadata?: CardMetadata
}

type CardImageSuccess = {
  ok: true
  imageUrl: string
  provider?: string
}



async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(fallbackMessage)
  }
}

export async function generateCardImage(
  request: CardImageRequest,
): Promise<CardImageSuccess> {
  const startResponse = await fetch('/api/card-image-start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const startPayload = await parseJsonResponse<
    { ok: true; promptId: string; provider?: string } | { ok: false; error: string; details?: string }
  >(startResponse, 'Card image start endpoint returned an unreadable response.')

  if (!startResponse.ok || !startPayload.ok) {
    throw new Error(!startPayload.ok ? startPayload.error : 'Card image start failed.')
  }

  const startedAt = Date.now()
  const timeoutMs = 240000

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => window.setTimeout(resolve, 3000))

    const statusResponse = await fetch(
      `/api/card-image-status?promptId=${encodeURIComponent(startPayload.promptId)}&t=${Date.now()}`,
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

