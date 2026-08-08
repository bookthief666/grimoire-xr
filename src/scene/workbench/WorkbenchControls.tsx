import * as THREE from 'three'
import { useState } from 'react'
import { Text } from '@react-three/drei'
import { shortText } from './shared'

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

      <Text
        position={[0, 0.002, 0.03]}
        fontSize={0.04}
        color={disabled ? '#6d5135' : hovered ? '#ffffff' : '#ffd18a'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.03}
      >
        {label}
      </Text>

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


function dialGlyph(label: string) {
  if (label === 'TAROT SYSTEM') return '☉'
  if (label === 'TONE') return '☽'
  if (label === 'LEVEL') return '♄'
  if (label === 'STYLE FAMILY') return '☿'
  if (label === 'ART STYLE') return '✶'
  if (label === 'EROS LEVEL') return '♀'
  if (label === 'INTENT') return '🜂'
  if (label === 'SUBJECT') return '🜃'
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

      <Text
        position={[-0.76, 0, 0.074]}
        fontSize={0.052}
        color="#f7be72"
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </Text>

      <Text
        position={[-0.67, 0, 0.062]}
        fontSize={0.027}
        color="#9f744b"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.36}
      >
        {label}
      </Text>

      <Text
        position={[-0.28, 0.002, 0.078]}
        fontSize={0.058}
        color="#ffcf7c"
        anchorX="center"
        anchorY="middle"
        onClick={(event) => {
          event.stopPropagation()
          onPrevious()
        }}
      >
        ◂
      </Text>

      <mesh position={[-0.28, 0, 0.092]} onClick={(event) => {
        event.stopPropagation()
        onPrevious()
      }}>
        <planeGeometry args={[0.18, 0.16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

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

      <Text
        position={[0.18, 0.002, 0.078]}
        fontSize={0.033}
        color="#f2d4a2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.66}
      >
        {shortText(value, 30)}
      </Text>

      <Text
        position={[0.65, 0.002, 0.078]}
        fontSize={0.058}
        color="#ffcf7c"
        anchorX="center"
        anchorY="middle"
        onClick={(event) => {
          event.stopPropagation()
          onNext()
        }}
      >
        ▸
      </Text>

      <mesh position={[0.65, 0, 0.092]} onClick={(event) => {
        event.stopPropagation()
        onNext()
      }}>
        <planeGeometry args={[0.18, 0.16]} />
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
