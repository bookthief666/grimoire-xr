import type { GrimoireCard } from '../../types/grimoire'

export type CardImagePolicyInput = Pick<
  GrimoireCard,
  'artPrompt' | 'imageStatus' | 'imageUrl'
>

export function canRequestCardImage(
  card: CardImagePolicyInput,
  localRequestInFlight = false,
) {
  if (localRequestInFlight) return false
  if (!card.artPrompt?.trim()) return false
  if (card.imageStatus === 'generating') return false
  if (card.imageStatus === 'ready' && card.imageUrl) return false
  return true
}

export function cardImageActionLabel(
  card: CardImagePolicyInput,
  localRequestInFlight = false,
) {
  if (card.imageStatus === 'ready' && card.imageUrl) return 'IMAGE SEALED'
  if (localRequestInFlight || card.imageStatus === 'generating') return 'GENERATING…'
  if (!card.artPrompt?.trim()) return 'NO ART SEED'
  if (card.imageStatus === 'error') return 'RETRY ART'
  return 'GENERATE ART'
}

/**
 * Selection and art generation are intentionally separate operations.
 * This module answers whether an explicit generation control may fire; it is
 * never called automatically as a consequence of selecting/manifesting a card.
 */
export const CARD_IMAGE_POLICY = Object.freeze({
  selectionGeneratesImage: false,
  explicitActionRequired: true,
})
