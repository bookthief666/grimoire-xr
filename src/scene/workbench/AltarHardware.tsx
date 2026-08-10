import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { UnicursalHexagramGlyph } from '../ThelemicSigils'
import type { ErosField } from '../../types/grimoire'
import { TABLE_Y } from './shared'
import type { ForgeEnergy, Vec2 } from './shared'
import { TempleText } from '../TempleText'
import {
  buildMergedPlanarSegments,
  type PlanarSegment,
} from '../geometry/mergedPlanarSegments'

export type TableBarSpec = {
  a: Vec2
  b: Vec2
  color?: string
  opacity?: number
  width?: number
  yOffset?: number
}

export function MergedTableBars({ bars }: { bars: readonly TableBarSpec[] }) {
  const geometry = useMemo(
    () => buildMergedPlanarSegments(
      bars.map((bar): PlanarSegment => ({
        from: bar.a,
        to: bar.b,
        width: bar.width ?? 0.018,
        depth: TABLE_Y + (bar.yOffset ?? 0.012),
        color: bar.color ?? '#ff9a00',
        intensity: bar.opacity ?? 0.72,
      })),
      'xz',
    ),
    [bars],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function TableBar({
  a,
  b,
  color = '#ff9a00',
  opacity = 0.72,
  width = 0.018,
  yOffset = 0.012,
}: {
  a: Vec2
  b: Vec2
  color?: string
  opacity?: number
  width?: number
  yOffset?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, TABLE_Y + yOffset, (a[1] + b[1]) / 2]}
      rotation={[-Math.PI / 2, 0, angle]}
    >
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function AltarChromeHardware({
  railColor,
  forgeEnergy,
}: {
  railColor: string
  forgeEnergy: ForgeEnergy
}) {
  const energized = forgeEnergy !== 'idle'

  const seamOpacity =
    forgeEnergy === 'working'
      ? 0.34
      : forgeEnergy === 'manifest'
        ? 0.26
        : forgeEnergy === 'tuning'
          ? 0.22
          : forgeEnergy === 'oracle'
            ? 0.24
            : 0.12

  const bars = useMemo<TableBarSpec[]>(() => [
    {
      a: [-1.61, 0.878], b: [1.61, 0.878], width: 0.032,
      yOffset: 0.018, color: '#d8e8ff', opacity: energized ? 0.18 : 0.105,
    },
    {
      a: [-1.61, -0.878], b: [1.61, -0.878], width: 0.024,
      yOffset: 0.018, color: '#f8f3df', opacity: energized ? 0.13 : 0.075,
    },
    {
      a: [1.6, -0.88], b: [1.6, 0.88], width: 0.026,
      yOffset: 0.018, color: '#d8e8ff', opacity: energized ? 0.14 : 0.08,
    },
    {
      a: [-1.6, -0.88], b: [-1.6, 0.88], width: 0.026,
      yOffset: 0.018, color: '#d8e8ff', opacity: energized ? 0.14 : 0.08,
    },
    {
      a: [-0.63, 0.54], b: [0.63, 0.54], width: 0.018,
      yOffset: 0.021, color: railColor, opacity: seamOpacity,
    },
    {
      a: [-0.63, -0.54], b: [0.63, -0.54], width: 0.014,
      yOffset: 0.021, color: '#f8f3df', opacity: seamOpacity * 0.58,
    },
  ], [energized, railColor, seamOpacity])

  return <MergedTableBars bars={bars} />
}

export function TableHexagram({
  active,
  energy = 'idle',
}: {
  active: boolean
  energy?: ForgeEnergy
}) {
  const ringRef = useRef<THREE.MeshBasicMaterial>(null)

  const glyphColor =
    energy === 'working' ? '#ffffff' :
    energy === 'manifest' ? '#ffcf7c' :
    energy === 'oracle' ? '#b98cff' :
    active ? '#ffcf7c' :
    '#9a5a18'

  useFrame(({ clock }) => {
    if (!ringRef.current) return

    const speed =
      energy === 'working' ? 2.2 :
      energy === 'manifest' ? 1.45 :
      energy === 'oracle' ? 1.75 :
      1.2

    const base =
      energy === 'working' ? 0.62 :
      energy === 'manifest' ? 0.56 :
      energy === 'tuning' ? 0.48 :
      energy === 'oracle' ? 0.52 :
      0.28

    const pulse = 0.24 + Math.sin(clock.getElapsedTime() * speed) * 0.12
    ringRef.current.opacity = active ? base + pulse : 0.22 + pulse * 0.34
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.71, 72]} />
        <meshBasicMaterial
          ref={ringRef}
          color={glyphColor}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 48]} />
        <meshBasicMaterial
          color={glyphColor}
          transparent
          opacity={active ? 0.09 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group position={[0, TABLE_Y + 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <UnicursalHexagramGlyph
          radius={0.62}
          color={glyphColor}
          opacity={active ? 0.94 : 0.52}
          lineWidth={2.35}
          withRose
        />
      </group>
    </group>
  )
}


export function AltarAstrolabeRings({
  active,
  erosField,
  energy = 'idle',
}: {
  active: boolean
  erosField: ErosField
  energy?: ForgeEnergy
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const middleRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)

  const erosAccent =
    energy === 'oracle'
      ? '#b98cff'
      : energy === 'working'
        ? '#ffffff'
        : erosField === 'Ecstatic'
          ? '#9a35ff'
          : erosField === 'Charged'
            ? '#ff3d5a'
            : '#d6a642'

  const energyBoost =
    energy === 'working' ? 1.85 :
    energy === 'manifest' ? 1.45 :
    energy === 'tuning' ? 1.22 :
    energy === 'oracle' ? 1.35 :
    1

  const tickBars = useMemo<TableBarSpec[]>(() => (
    Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2
      const inner = 0.74
      const outer = index % 3 === 0 ? 0.86 : 0.81
      return {
        a: [Math.cos(angle) * inner, Math.sin(angle) * inner],
        b: [Math.cos(angle) * outer, Math.sin(angle) * outer],
        color: index % 3 === 0 ? erosAccent : '#b8860b',
        opacity: active ? 0.38 : 0.2,
        width: index % 3 === 0 ? 0.014 : 0.008,
      }
    })
  ), [active, erosAccent])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (outerRef.current) {
      outerRef.current.opacity = active ? (0.16 + Math.sin(t * 0.55) * 0.05) * energyBoost : 0.1
    }

    if (middleRef.current) {
      middleRef.current.opacity = active ? (0.24 + Math.sin(t * 0.82 + 1.1) * 0.07) * energyBoost : 0.14
    }

    if (innerRef.current) {
      innerRef.current.opacity = active ? (0.28 + Math.sin(t * 1.1 + 0.4) * 0.08) * energyBoost : 0.18
    }
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.905, 96]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#d6a642"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.007, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <ringGeometry args={[0.48, 0.486, 80]} />
        <meshBasicMaterial
          ref={middleRef}
          color={erosAccent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.008, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 5]}>
        <ringGeometry args={[0.26, 0.268, 64]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#ffcf7c"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <MergedTableBars bars={tickBars} />

      <TempleText
        position={[0, TABLE_Y + 0.05, 0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color={active ? '#ffd18a' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        GRIMOIRE ENGINE
      </TempleText>
    </group>
  )
}
