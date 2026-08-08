export type Vec2 = [number, number]

export type WorkbenchMode = 'closed' | 'forge' | 'spread' | 'archive'
export type ForgeEnergy = 'idle' | 'tuning' | 'working' | 'manifest' | 'oracle'

export const SUBJECT_OPTIONS = [
  'Faust',
  'True Will',
  'The Shadow',
  'Creative Power',
  'Love Under Will',
  'Holy Guardian Angel',
  'Fear / Ordeal',
  'Money / Survival',
]

export const INTENT_OPTIONS = [
  'What is the hidden cost?',
  'What must I do next?',
  'What force is blocking manifestation?',
  'What should be disciplined?',
  'What is the ordeal teaching?',
  'What is the initiatory opportunity?',
]

export const TABLE_Y = 0.08
export const WORKBENCH_SCALE = 0.48

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function shortText(value: string, max = 32) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

export function formatArchiveTime(value: string | null) {
  if (!value) return 'NO SAVED RITUAL'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).toUpperCase()
}

export function cycleString<T extends string>(
  values: ReadonlyArray<T>,
  current: T,
  direction: -1 | 1,
): T {
  const index = Math.max(0, values.findIndex((value) => value === current))
  const next = (index + direction + values.length) % values.length
  return values[next]
}

export function cycleOption<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  current: T,
  direction: -1 | 1,
) {
  const index = Math.max(0, options.findIndex((option) => option.value === current))
  const next = (index + direction + options.length) % options.length
  return options[next].value
}

export function optionLabel<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value
}
