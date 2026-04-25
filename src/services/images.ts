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

type CardImageFailure = {
  ok: false
  error: string
}

type CardImageResponse = CardImageSuccess | CardImageFailure

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
  const response = await fetch('/api/card-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const payload = await parseJsonResponse<CardImageResponse>(
    response,
    'Card image endpoint returned an unreadable response.',
  )

  if (!response.ok || !payload.ok) {
    const message =
      payload && !payload.ok && payload.error
        ? payload.error
        : 'Card image generation failed.'

    throw new Error(message)
  }

  return payload
}
