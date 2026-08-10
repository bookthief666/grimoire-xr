/**
 * Page long prose for an in-world reading surface.
 *
 * A headset cannot scroll comfortably and a wall of small text is unreadable at
 * focal distance, so chapter prose is broken into fixed-size pages instead. The
 * split is on word boundaries: breaking mid-word in a source verse would alter
 * what the text appears to say.
 */
export function paginate(text: string, perPage: number): string[] {
  if (perPage <= 0) return [text]

  const words = text.split(/\s+/).filter(Boolean)
  const pages: string[] = []
  let current = ''

  for (const word of words) {
    if (current.length && current.length + word.length + 1 > perPage) {
      pages.push(current)
      current = word
    } else {
      current = current.length ? `${current} ${word}` : word
    }
  }

  if (current.length) pages.push(current)
  return pages.length ? pages : ['']
}

/**
 * The pages of one chapter record, in reading order: source verse first, then
 * editorial commentary. The two are never merged into a single page — a reader
 * has to be able to see where Crowley stops and this edition starts.
 */
export type ReaderPage = {
  kind: 'verse' | 'commentary'
  body: string
}

export function buildReaderPages(
  verse: string,
  commentary: string,
  versePerPage = 300,
  commentaryPerPage = 430,
): ReaderPage[] {
  return [
    ...paginate(verse, versePerPage).map((body) => ({ kind: 'verse' as const, body })),
    ...paginate(commentary, commentaryPerPage).map((body) => ({
      kind: 'commentary' as const,
      body,
    })),
  ]
}
