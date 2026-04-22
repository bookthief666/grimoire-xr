export async function requestCardArtPlaceholder(cardName: string) {
  return {
    cardName,
    status: 'pending' as const,
    message: 'Card art generation route will be connected in a future backend pass.',
  }
}
