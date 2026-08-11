import { Text } from '@react-three/drei'
import type { ComponentProps } from 'react'

/**
 * Every piece of text in the temple.
 *
 * drei's `Text` is troika-three-text underneath. With no `font` prop it falls
 * back to `unicode-font-resolver`, which **fetches a codepoint index from
 * cdn.jsdelivr.net at runtime**. That made the whole temple depend on a live
 * third-party CDN to render a single label: on a Quest with flaky wifi, behind a
 * captive portal, or during a jsdelivr outage, every label silently fails — and
 * when the fetch throws, the canvas can fail to draw at all.
 *
 * Pointing at a bundled font removes that dependency entirely. DejaVu Sans was
 * chosen by checking its cmap against every non-ASCII character the temple
 * actually uses: it covers 35 of 38, including all Hebrew and niqqud for the
 * Cell, the planetary symbols, and the geometric shapes. The three it misses
 * (U+1F702 and U+1F703 alchemical fire/earth, U+27C1) are drawn as geometry in
 * ThelemicSigils instead, which is sharper at VR scale anyway.
 *
 * drei exposes no global font default, so this wrapper is the mechanism. Use it
 * instead of `Text` everywhere in the scene.
 */

export const TEMPLE_FONT = '/fonts/DejaVuSans.ttf'

/**
 * troika supports more than drei declares.
 *
 * drei types `Text` against the three.js Mesh props it knows about, but it
 * spreads everything else straight onto the troika text mesh, which understands
 * a wider set. `curveRadius` in particular bends a text mesh onto a cylinder at
 * render time — the mechanism that lets an inscription wrap the practitioner
 * for the cost of one draw call instead of one draw per line. Declaring the
 * extras here keeps call sites type-checked rather than casting at each use.
 */
type TroikaExtras = {
  /** Cylinder radius to bend the text onto. Positive puts the centre behind. */
  curveRadius?: number
  /** Glyph fill opacity, independent of the material's own opacity. */
  fillOpacity?: number
  outlineWidth?: number | string
  outlineColor?: string
  outlineOpacity?: number
}

type TempleTextProps = ComponentProps<typeof Text> & TroikaExtras

export function TempleText({ font = TEMPLE_FONT, ...props }: TempleTextProps) {
  return <Text font={font} {...props} />
}
