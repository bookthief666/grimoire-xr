import * as THREE from 'three'
import { useState } from 'react'
import { shortText } from './shared'
import { TempleText } from '../TempleText'

export function FloatingMenuButton({
  label,
  x,
  y,
  width = 0.22,
  disabled = false,
  onClick,
}: {
  label: string
  x: number
  y: number
  width?: number
  disabled?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const trigger = () => {
    if (!disabled) onClick()
  }

  return (
    <group
      position={[x, y, 0.075]}
      scale={hovered && !disabled ? 1.04 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        trigger()
      }}
    >
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[width + 0.28, 0.34]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[width, 0.13]} />
        <meshBasicMaterial
          color={disabled ? '#100807' : '#241008'}
          transparent
          opacity={disabled ? 0.16 : hovered ? 0.44 : 0.24}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 0.12, 0.24]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={hovered && !disabled ? 0.28 : 0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.002, 0.03]}
        fontSize={0.04}
        color={disabled ? '#6d5135' : hovered ? '#ffffff' : '#ffd18a'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.03}
      >
        {label}
      </TempleText>

      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[width + 0.26, 0.38]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}


/**
 * A dial's ‹ / › arrow. Uses the same pointer-down/up + pointer-capture pattern
 * as FloatingMenuButton above: bare onClick is unreliable against XR controller
 * rays, and these arrows are how every forge option gets chosen, so they must
 * not be on the fragile path. Visuals are unchanged - a glyph plus a generous
 * transparent hitbox (opacity 0.001, depthWrite false, never visible={false},
 * which would stop raycasting entirely).
 */
function DialArrow({
  glyph,
  x,
  onActivate,
}: {
  glyph: string
  x: number
  onActivate: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      scale={hovered ? 1.12 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        onActivate()
      }}
    >
      <TempleText
        position={[x, 0.002, 0.078]}
        fontSize={0.058}
        color={hovered ? '#ffffff' : '#ffcf7c'}
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </TempleText>

      <mesh position={[x, 0, 0.092]}>
        <planeGeometry args={[0.2, 0.18]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function dialGlyph(label: string) {
  if (label === 'TAROT SYSTEM') return '☉'
  if (label === 'TONE') return '☽'
  if (label === 'LEVEL') return '♄'
  if (label === 'STYLE FAMILY') return '☿'
  if (label === 'ART STYLE') return '✶'
  if (label === 'EROS LEVEL') return '♀'
  // Fire and Earth as their plain triangles rather than the Alchemical Symbols
  // block (U+1F702/1F703). Those two codepoints are absent from the bundled
  // font, and a single missing glyph is enough to send troika back to the
  // jsdelivr resolver at runtime - which is the whole dependency we are cutting.
  // The traditional alchemical forms are these triangles anyway.
  if (label === 'INTENT') return '△'
  if (label === 'SUBJECT') return '▽'
  return '✦'
}

export function FloatingDial({
  label,
  value,
  y,
  onPrevious,
  onNext,
}: {
  label: string
  value: string
  y: number
  onPrevious: () => void
  onNext: () => void
}) {
  const glyph = dialGlyph(label)

  return (
    <group position={[0, y, 0.04]}>
      <mesh position={[0.18, 0, 0.033]}>
        <planeGeometry args={[1.62, 0.128]} />
        <meshBasicMaterial
          color="#120706"
          transparent
          opacity={0.44}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, 0.061, 0.038]}>
        <planeGeometry args={[1.56, 0.004]} />
        <meshBasicMaterial
          color="#ff8a00"
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, -0.061, 0.038]}>
        <planeGeometry args={[1.56, 0.003]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[-0.76, 0, 0.074]}
        fontSize={0.052}
        color="#f7be72"
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </TempleText>

      <TempleText
        position={[-0.67, 0, 0.062]}
        fontSize={0.027}
        color="#9f744b"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.36}
      >
        {label}
      </TempleText>

      <DialArrow glyph="◂" x={-0.28} onActivate={onPrevious} />

      <mesh position={[0.18, 0, 0.045]}>
        <planeGeometry args={[0.73, 0.116]} />
        <meshBasicMaterial
          color="#070404"
          transparent
          opacity={0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, 0, 0.052]}>
        <planeGeometry args={[0.67, 0.056]} />
        <meshBasicMaterial
          color="#ff6a00"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0.18, 0.002, 0.078]}
        fontSize={0.033}
        color="#f2d4a2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.66}
      >
        {shortText(value, 30)}
      </TempleText>

      <DialArrow glyph="▸" x={0.65} onActivate={onNext} />
    </group>
  )
}
