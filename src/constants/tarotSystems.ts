export const TAROT_SYSTEMS = [
  {
    id: 'rider_waite_smith',
    label: 'Rider-Waite-Smith',
    shortLabel: 'RWS',
    description:
      'Pictorial Golden Dawn-derived deck logic: Pages, Knights, Queens, Kings, scenic minors, moral-psychological symbolism.',
    instruction:
      'Use Rider-Waite-Smith / Golden Dawn pictorial tarot structure. Emphasize scenic symbolic minors, moral drama, archetypal tableaux, and practical divinatory clarity.',
  },
  {
    id: 'thoth_thelemic',
    label: 'Thoth / Thelemic',
    shortLabel: 'Thoth',
    description:
      'Crowley-Harris tarot logic: Thelemic cosmology, qabalah, astrology, decans, Aeonic language, and alchemical force.',
    instruction:
      'Use Thoth / Thelemic tarot structure. Emphasize Thelema, qabalah, astrology, decans, alchemy, pathworking, and initiatory ordeal.',
  },
  {
    id: 'marseille',
    label: 'Tarot de Marseille',
    shortLabel: 'Marseille',
    description:
      'Older emblematic tarot logic: austere trumps, pip minors, numerological reading, direct symbolic grammar.',
    instruction:
      'Use Tarot de Marseille structure. Emphasize emblematic trumps, pip-card numerology, elemental dignity, and concise symbolic grammar rather than scenic modern psychology.',
  },
  {
    id: 'golden_dawn',
    label: 'Golden Dawn Hermetic',
    shortLabel: 'Golden Dawn',
    description:
      'Ceremonial Hermetic tarot logic: Tree of Life paths, Hebrew letters, planetary and zodiacal attributions, elemental grades.',
    instruction:
      'Use Golden Dawn Hermetic tarot structure. Emphasize Tree of Life paths, Hebrew letters, astrological attributions, elemental grades, and ceremonial magical correspondences.',
  },
  {
    id: 'jungian_archetypal',
    label: 'Jungian / Archetypal',
    shortLabel: 'Jungian',
    description:
      'Depth-psychological tarot logic: shadow, anima/animus, Self, individuation, dream symbols, mythic complexes.',
    instruction:
      'Use Jungian archetypal tarot structure. Emphasize individuation, shadow integration, anima/animus dynamics, dream symbolism, mythic complexes, and psychological transformation.',
  },
] as const

export const TAROT_SYSTEM_IDS = TAROT_SYSTEMS.map((system) => system.id) as [
  (typeof TAROT_SYSTEMS)[number]['id'],
  ...(typeof TAROT_SYSTEMS)[number]['id'][],
]

export type TarotSystemId = (typeof TAROT_SYSTEM_IDS)[number]

export const DEFAULT_TAROT_SYSTEM: TarotSystemId = 'thoth_thelemic'

export const TAROT_SYSTEM_OPTIONS = TAROT_SYSTEMS.map((system) => ({
  value: system.id,
  label: system.label,
})) as ReadonlyArray<{
  value: TarotSystemId
  label: string
}>

export function getTarotSystem(systemId: TarotSystemId) {
  return TAROT_SYSTEMS.find((system) => system.id === systemId) ?? TAROT_SYSTEMS[0]
}
