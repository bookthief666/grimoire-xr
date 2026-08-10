import { useEffect, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import * as THREE from 'three'
import { PATHS, SEPHIROTH } from '../../tools/liber333'
import type { ChamberPreviewArtifact } from '../chambers/types'
import { TempleText } from '../TempleText'

const noRaycast = () => null

function SolarForgePreview({ accent }: { accent: string }) {
  const cardsRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = cardsRef.current
    if (!mesh) return

    ;[-1, 0, 1].forEach((offset, index) => {
      dummy.position.set(offset * 0.17, index === 1 ? 0.025 : -0.02, index * 0.012)
      dummy.rotation.set(0, 0, offset * -0.16)
      dummy.scale.setScalar(index === 1 ? 1.08 : 0.9)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <group>
      <instancedMesh ref={cardsRef} args={[undefined, undefined, 3]} raycast={noRaycast}>
        <boxGeometry args={[0.22, 0.36, 0.018]} />
        <meshBasicMaterial color="#08101a" />
      </instancedMesh>
      <mesh position={[0, 0.025, 0.025]} raycast={noRaycast}>
        <ringGeometry args={[0.075, 0.095, 24]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <TempleText
        position={[0, 0.025, 0.035]}
        fontSize={0.075}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ✶
      </TempleText>
    </group>
  )
}

function PermutationAxisPreview({ accent }: { accent: string }) {
  const geometry = useMemo(() => {
    const positions = [
      0, -0.34, 0, 0, 0.34, 0,
      -0.34, 0, 0, 0.34, 0, 0,
      -0.24, -0.24, 0, 0.24, 0.24, 0,
      -0.24, 0.24, 0, 0.24, -0.24, 0,
    ]
    const next = new THREE.BufferGeometry()
    next.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return next
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <lineSegments geometry={geometry} raycast={noRaycast}>
        <lineBasicMaterial
          color={accent}
          transparent
          opacity={0.64}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <mesh position={[0, 0, 0.008]} raycast={noRaycast}>
        <ringGeometry args={[0.18, 0.192, 32]} />
        <meshBasicMaterial color="#d8f6ff" transparent opacity={0.72} />
      </mesh>
      <TempleText
        position={[0, 0, 0.025]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        יהוה
      </TempleText>
    </group>
  )
}

/**
 * Dee's construction as one buffer.
 *
 * The other three previews already instance or merge their repeats; this was
 * the last one drawing five separate meshes with five materials, three of them
 * the same accent. The glyph is static, so the whole figure — solar ring, its
 * centre point, the lunar crescent, and the elemental cross — can be baked into
 * a single geometry once and submitted in one draw.
 *
 * Colour is carried per-vertex rather than per-material, which is what lets the
 * white centre point and ice-white crescent share a buffer with the accent
 * ring and cross.
 */
function buildMonasGeometry(accent: string) {
  const positions: number[] = []
  const colors: number[] = []

  const accentColor = new THREE.Color(accent)
  const white = new THREE.Color('#ffffff')
  const ice = new THREE.Color('#d8f6ff')

  const push = (x: number, y: number, z: number, colour: THREE.Color) => {
    positions.push(x, y, z)
    colors.push(colour.r, colour.g, colour.b)
  }

  /** Two triangles spanning an annulus segment, or a fan wedge when inner = 0. */
  const arc = (
    cx: number,
    cy: number,
    z: number,
    inner: number,
    outer: number,
    from: number,
    to: number,
    segments: number,
    colour: THREE.Color,
  ) => {
    for (let i = 0; i < segments; i += 1) {
      const a0 = from + ((to - from) * i) / segments
      const a1 = from + ((to - from) * (i + 1)) / segments
      const c0 = Math.cos(a0)
      const s0 = Math.sin(a0)
      const c1 = Math.cos(a1)
      const s1 = Math.sin(a1)

      const xo0 = cx + c0 * outer
      const yo0 = cy + s0 * outer
      const xo1 = cx + c1 * outer
      const yo1 = cy + s1 * outer
      const xi0 = cx + c0 * inner
      const yi0 = cy + s0 * inner
      const xi1 = cx + c1 * inner
      const yi1 = cy + s1 * inner

      push(xi0, yi0, z, colour)
      push(xo0, yo0, z, colour)
      push(xo1, yo1, z, colour)

      push(xi0, yi0, z, colour)
      push(xo1, yo1, z, colour)
      push(xi1, yi1, z, colour)
    }
  }

  const quad = (
    cx: number,
    cy: number,
    z: number,
    halfWidth: number,
    halfHeight: number,
    colour: THREE.Color,
  ) => {
    push(cx - halfWidth, cy - halfHeight, z, colour)
    push(cx + halfWidth, cy - halfHeight, z, colour)
    push(cx + halfWidth, cy + halfHeight, z, colour)

    push(cx - halfWidth, cy - halfHeight, z, colour)
    push(cx + halfWidth, cy + halfHeight, z, colour)
    push(cx - halfWidth, cy + halfHeight, z, colour)
  }

  const TAU = Math.PI * 2

  // Solar circle, and the central point it never forgets.
  arc(0, 0.12, 0, 0.17, 0.185, 0, TAU, 36, accentColor)
  arc(0, 0.12, 0.006, 0, 0.025, 0, TAU, 16, white)

  // Lunar crescent, standing above the solar body.
  arc(0, 0.36, 0, 0.128, 0.152, 0, Math.PI, 28, ice)

  // Cross of the elements, beneath.
  quad(0, -0.11, 0, 0.009, 0.14, accentColor)
  quad(0, -0.16, 0.002, 0.13, 0.009, accentColor)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

function MonasConstructionPreview({ accent }: { accent: string }) {
  const geometry = useMemo(() => buildMonasGeometry(accent), [accent])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group position={[0, 0.02, 0]}>
      <mesh geometry={geometry} raycast={noRaycast}>
        <meshBasicMaterial vertexColors />
      </mesh>
    </group>
  )
}

function ChapterTreePreview({ accent }: { accent: string }) {
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const [a, b] of PATHS) {
      const start = SEPHIROTH[a].position
      const end = SEPHIROTH[b].position
      positions.push(
        start[0] * 0.31,
        start[1] * 0.22 - 0.33,
        0,
        end[0] * 0.31,
        end[1] * 0.22 - 0.33,
        0,
      )
    }
    const next = new THREE.BufferGeometry()
    next.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return next
  }, [])

  useEffect(() => {
    const mesh = nodesRef.current
    if (!mesh) return

    SEPHIROTH.forEach((sephira, index) => {
      dummy.position.set(
        sephira.position[0] * 0.31,
        sephira.position[1] * 0.22 - 0.33,
        0.012,
      )
      dummy.scale.setScalar(index === 0 || index === 5 ? 1.2 : 0.9)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [dummy])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <lineSegments geometry={geometry} raycast={noRaycast}>
        <lineBasicMaterial color={accent} transparent opacity={0.58} />
      </lineSegments>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, SEPHIROTH.length]}
        raycast={noRaycast}
      >
        <circleGeometry args={[0.035, 14]} />
        <meshBasicMaterial color="#d8f6ff" />
      </instancedMesh>
    </group>
  )
}

export function StationPreviewArtifact({
  kind,
  accent,
  active,
  animationRef,
  fieldMaterialRef,
}: {
  kind: ChamberPreviewArtifact
  accent: string
  active: boolean
  animationRef: Ref<THREE.Group>
  fieldMaterialRef: Ref<THREE.MeshBasicMaterial>
}) {
  return (
    <group ref={animationRef} raycast={noRaycast}>
      <mesh position={[0, 0, -0.025]} raycast={noRaycast}>
        <circleGeometry args={[0.47, 36]} />
        <meshBasicMaterial color="#030710" />
      </mesh>
      <mesh position={[0, 0, -0.035]} raycast={noRaycast}>
        <ringGeometry args={[0.42, 0.5, 40]} />
        <meshBasicMaterial
          ref={fieldMaterialRef}
          color={accent}
          transparent
          opacity={active ? 0.13 : 0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {kind === 'solar-forge' ? <SolarForgePreview accent={accent} /> : null}
      {kind === 'permutation-axis' ? <PermutationAxisPreview accent={accent} /> : null}
      {kind === 'monas-construction' ? <MonasConstructionPreview accent={accent} /> : null}
      {kind === 'chapter-tree' ? <ChapterTreePreview accent={accent} /> : null}
    </group>
  )
}
