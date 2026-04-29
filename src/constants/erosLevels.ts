export const EROS_LEVELS = [
  {
    id: 'ascetic',
    label: 'Ascetic',
    shortLabel: '0 / Ascetic',
    intensity: 0,
    description:
      'Non-erotic, austere, devotional, contemplative, symbolic purity.',
    instruction:
      'Keep the reading and imagery non-erotic. Emphasize austerity, discipline, contemplation, devotion, and symbolic purity.',
    imagePrompt:
      'austere, devotional, contemplative, sacred restraint, solemn ritual atmosphere',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    shortLabel: '1 / Romantic',
    intensity: 1,
    description:
      'Soft sensuality, beauty, intimacy, tenderness, devotional affection.',
    instruction:
      'Use soft romantic and devotional language. Keep sensuality gentle, symbolic, and emotionally intimate.',
    imagePrompt:
      'romantic, tender, graceful, luminous beauty, soft devotional intimacy, elegant sensual atmosphere',
  },
  {
    id: 'charged',
    label: 'Charged',
    shortLabel: '2 / Charged',
    intensity: 2,
    description:
      'Erotic-symbolic charge, magnetism, desire, polarity, attraction, sacred tension.',
    instruction:
      'Use erotic-symbolic intensity without explicit sexual description. Emphasize polarity, magnetism, longing, sacred tension, and initiatory desire.',
    imagePrompt:
      'charged sacred eros, magnetic polarity, symbolic desire, ritual tension, luminous sensuality',
  },
  {
    id: 'ecstatic',
    label: 'Ecstatic',
    shortLabel: '3 / Ecstatic',
    intensity: 3,
    description:
      'Mystical rapture, divine eros, visionary union, tantric sublimation, overwhelming beauty.',
    instruction:
      'Use intense mystical-erotic language in a symbolic and initiatory register. Emphasize rapture, union, sublimation, divine beauty, and ecstatic transformation.',
    imagePrompt:
      'ecstatic mystical eros, visionary rapture, divine union, tantric sublimation, radiant sacred beauty',
  },
  {
    id: 'transgressive',
    label: 'Transgressive',
    shortLabel: '4 / Transgressive',
    intensity: 4,
    description:
      'Shadow-facing eros, taboo as symbol, ordeal, danger, surrender, abyssal transformation.',
    instruction:
      'Use mature symbolic language around taboo, ordeal, surrender, shadow, and transgression. Do not make the output pornographic; keep it mythic, ritualized, and psychologically serious.',
    imagePrompt:
      'dark sacred eros, taboo as symbol, shadow initiation, ritual surrender, abyssal transformation, mythic transgression',
  },
] as const

export const EROS_LEVEL_IDS = EROS_LEVELS.map((level) => level.id) as [
  (typeof EROS_LEVELS)[number]['id'],
  ...(typeof EROS_LEVELS)[number]['id'][],
]

export type ErosLevelId = (typeof EROS_LEVEL_IDS)[number]

export const DEFAULT_EROS_LEVEL: ErosLevelId = 'ascetic'

export const EROS_LEVEL_OPTIONS = EROS_LEVELS.map((level) => ({
  value: level.id,
  label: level.shortLabel,
})) as ReadonlyArray<{
  value: ErosLevelId
  label: string
}>

export function getErosLevel(levelId: ErosLevelId) {
  return EROS_LEVELS.find((level) => level.id === levelId) ?? EROS_LEVELS[0]
}
