export const TECH_LEVELS = {
  neophyte: {
    label: 'NEOPHYTE',
    desc: 'Plain English. Practical & Emotional.',
    instruction:
      'Explain simply in plain English. Focus on practical advice and emotional resonance. Avoid jargon.',
  },
  adept: {
    label: 'ADEPT',
    desc: 'Balanced. Archetypal & Astrological.',
    instruction:
      'Standard esoteric tone. Balance psychological archetypes with astrological correspondences.',
  },
  magus: {
    label: 'MAGUS',
    desc: 'High Magick. Qabalah & Thelema.',
    instruction:
      'Dense, scholarly, and profound. Use Qabalistic terms, Hebrew letters, and Thelemic cosmology explicitly.',
  },
} as const

export const TRADITION_OPTIONS = [
  { value: 'thelemic', label: 'Thelemic' },
  { value: 'hermetic', label: 'Hermetic' },
  { value: 'goetic', label: 'Goetic' },
  { value: 'tarot', label: 'Tarot' },
  { value: 'kabbalistic', label: 'Kabbalistic' },
  { value: 'tantric', label: 'Tantric' },
  { value: 'chaos_magick', label: 'Chaos Magick' },
] as const

export const TONE_OPTIONS = [
  { value: 'scholarly', label: 'Scholarly' },
  { value: 'oracular', label: 'Oracular' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'severe', label: 'Severe' },
  { value: 'ecstatic', label: 'Ecstatic' },
] as const

export const TECH_LEVEL_OPTIONS = [
  { value: 'neophyte', label: 'Neophyte' },
  { value: 'adept', label: 'Adept' },
  { value: 'magus', label: 'Magus' },
] as const
