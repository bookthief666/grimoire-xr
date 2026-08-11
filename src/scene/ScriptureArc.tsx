import * as THREE from 'three'
import { TempleText } from './TempleText'
import { USER_EYE_VR } from './zones'

const noRaycast = () => null

/** Set explicitly on the text below, so the shelf estimate is not a guess. */
const LINE_HEIGHT = 1.32

/**
 * Text inscribed onto the room instead of printed on a panel.
 *
 * A flat rectangle of prose is the one thing VR is worst at. It has a border
 * the room does not, it occludes whatever is behind it, and at reading size it
 * either sits too close to focus on or too far to read. Every instrument here
 * had drifted into that shape.
 *
 * troika supports `curveRadius`, which bends a text mesh onto a cylinder at
 * render time — so a band of text can wrap the practitioner at a constant focal
 * distance for the cost of a single draw call. Placing the mesh at `-radius` on
 * Z and passing `+radius` puts the cylinder's centre exactly at the head, which
 * means every glyph is the same distance from the eye and the line curves away
 * with the turn of the neck rather than skewing.
 *
 * There is no plate behind it. Depth is carried by a thin arc of light beneath
 * the band, which reads as a shelf the words rest on rather than a box they are
 * trapped in.
 */
export function ScriptureArc({
  children,
  radius,
  y,
  fontSize,
  color,
  opacity = 1,
  maxWidth,
  shelf = true,
  shelfColor,
  shelfOpacity = 0.22,
  outlineOpacity = 0,
}: {
  children: string
  /** Distance from the head. Also the curvature, so glyphs stay equidistant. */
  radius: number
  y: number
  fontSize: number
  color: string
  opacity?: number
  /** Arc width in metres along the cylinder before wrapping. */
  maxWidth: number
  shelf?: boolean
  shelfColor?: string
  shelfOpacity?: number
  /** A faint second pass behind the glyphs, standing in for a glow bloom. */
  outlineOpacity?: number
}) {
  // The cylinder is centred on the head, not on the scene origin, so the band
  // reads at a constant focal distance rather than swinging nearer at the edges.
  const shelfArc = Math.min(Math.PI * 1.2, maxWidth / radius + 0.3)

  /**
   * How far under the text the shelf sits.
   *
   * troika wraps and lays out the block itself, so the line count is not known
   * here — but the shelf has to clear the whole block, and chapter verses run
   * from a single word to several lines. A fixed one-line offset put the light
   * straight through the last line of anything longer.
   *
   * Estimating from the wrap width is enough: glyphs average a little over half
   * their point size in advance width, and the block is anchored on its middle,
   * so half the estimated stack plus a line of padding clears the descenders.
   */
  const perLine = Math.max(1, Math.floor(maxWidth / (fontSize * 0.55)))
  const lines = Math.max(1, Math.ceil(children.length / perLine))
  const shelfDrop = (lines / 2) * fontSize * LINE_HEIGHT + fontSize * 0.9

  /**
   * The shelf is a ribbon on a cylinder wall, not a ring lying flat.
   *
   * A flat `ringGeometry` was the obvious reach and is the wrong solid: its
   * surface is horizontal, so from an eye a few centimetres above it, it is
   * edge-on and invisible no matter how bright. An open-ended cylinder's
   * lateral surface is vertical and faces the axis, so a short section of it
   * reads as a line of light drawn on the air at the same radius as the text.
   *
   * Three's cylinder theta starts at +Z and sweeps toward +X, so centring the
   * band on the forward axis (-Z) means starting half an arc before PI.
   */
  const shelfStart = Math.PI - shelfArc / 2

  return (
    <group position={[0, 0, USER_EYE_VR[2]]} raycast={noRaycast}>
      {outlineOpacity > 0 ? (
        <TempleText
          position={[0, y, -radius - 0.012]}
          curveRadius={radius + 0.012}
          fontSize={fontSize * 1.04}
          color={color}
          fillOpacity={outlineOpacity * opacity}
          anchorX="center"
          anchorY="middle"
          maxWidth={maxWidth}
          lineHeight={LINE_HEIGHT}
          textAlign="center"
          raycast={noRaycast}
        >
          {children}
        </TempleText>
      ) : null}

      <TempleText
        position={[0, y, -radius]}
        curveRadius={radius}
        fontSize={fontSize}
        color={color}
        fillOpacity={opacity}
        anchorX="center"
        anchorY="middle"
        maxWidth={maxWidth}
        lineHeight={LINE_HEIGHT}
        textAlign="center"
        raycast={noRaycast}
      >
        {children}
      </TempleText>

      {shelf ? (
        <mesh position={[0, y - shelfDrop, 0]} raycast={noRaycast}>
          <cylinderGeometry
            args={[radius, radius, 0.008, 96, 1, true, shelfStart, shelfArc]}
          />
          <meshBasicMaterial
            color={shelfColor ?? color}
            transparent
            opacity={shelfOpacity * opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  )
}
