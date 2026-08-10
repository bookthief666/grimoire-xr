export type DeterministicStarDatum = {
  id: number
  position: [number, number, number]
  size: number
  phase: number
  warm: boolean
}

/**
 * Stable pseudo-random unit interval derived from integer coordinates.
 *
 * Scene decoration must not call Math.random() during React render. A stable
 * field is also preferable in VR because remounting a chamber should not move
 * the entire sky/ember distribution around the user's head.
 */
export function deterministicUnit(index: number, channel = 0) {
  let value = (index + 1) * 0x9e3779b1 + (channel + 1) * 0x85ebca6b
  value ^= value >>> 16
  value = Math.imul(value, 0x7feb352d)
  value ^= value >>> 15
  value = Math.imul(value, 0x846ca68b)
  value ^= value >>> 16
  return (value >>> 0) / 0x1_0000_0000
}

export function deterministicRange(
  index: number,
  channel: number,
  min: number,
  max: number,
) {
  return min + deterministicUnit(index, channel) * (max - min)
}

export function buildCosmicStarField(count = 78): DeterministicStarDatum[] {
  return Array.from({ length: count }, (_, index) => {
    const theta = deterministicRange(index, 0, 0, Math.PI * 2)
    const y = deterministicRange(index, 1, 0.2, 9.2)
    const radius = deterministicRange(index, 2, 10, 38)

    return {
      id: index,
      position: [
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius - 18,
      ],
      size: deterministicRange(index, 3, 0.012, 0.038),
      phase: deterministicRange(index, 4, 0, Math.PI * 2),
      warm: index % 9 === 0,
    }
  })
}

export type DeterministicEmberDatum = {
  x: number
  y: number
  z: number
  size: number
  drift: number
  sway: number
  phase: number
}

export function buildEmberField(count = 22): DeterministicEmberDatum[] {
  return Array.from({ length: count }, (_, index) => ({
    x: deterministicRange(index, 10, -2.6, 2.6),
    y: deterministicRange(index, 11, 0.15, 2.95),
    z: deterministicRange(index, 12, -5, -0.6),
    size: deterministicRange(index, 13, 0.012, 0.042),
    drift: deterministicRange(index, 14, 0.08, 0.18),
    sway: deterministicRange(index, 15, 0.15, 0.45),
    phase: deterministicRange(index, 16, 0, Math.PI * 2) + index,
  }))
}
