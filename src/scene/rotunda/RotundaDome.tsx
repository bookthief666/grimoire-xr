import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'

const noRaycast = () => null

/**
 * The dome: constellation ceiling over the rotunda.
 *
 * Closes the room. With a floor and a colonnade but no ceiling the eye runs off
 * into black at the top of the frame and the space stops feeling enclosed.
 *
 * Both the stars and the lines between them are single instanced draws. A naive
 * version — one mesh per star, one per constellation segment — would add several
 * hundred draw calls to a scene already ~4x over the Quest budget. Instancing
 * makes the entire night sky cost two.
 */

const DOME_RADIUS = 7.6
const DOME_CENTRE_Y = 0.2
const CENTRE_Z = -1.0
const STAR_COUNT = 120

type Star = {
  pos: THREE.Vector3
  size: number
  phase: number
}

/** Deterministic scatter, so the sky is the same every session. */
function makeStars(): Star[] {
  let seed = 0x9e37
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    return seed / 0x7fffffff
  }

  return Array.from({ length: STAR_COUNT }, () => {
    // Bias toward the upper hemisphere: stars near the horizon would be hidden
    // behind the colonnade anyway.
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(0.15 + rand() * 0.85)
    const r = DOME_RADIUS * (0.93 + rand() * 0.06)

    return {
      pos: new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.cos(phi) * r + DOME_CENTRE_Y,
        Math.sin(phi) * Math.sin(theta) * r + CENTRE_Z,
      ),
      size: 0.018 + rand() * 0.03,
      phase: rand() * Math.PI * 2,
    }
  })
}

/**
 * Constellation lines. Each star is joined to its nearest unused neighbour,
 * which produces the sparse branching figures of the reference image rather
 * than a uniform mesh.
 */
function makeLinks(stars: Star[]) {
  const links: Array<{ a: THREE.Vector3; b: THREE.Vector3 }> = []
  const used = new Set<number>()

  for (let i = 0; i < stars.length; i += 2) {
    if (used.has(i)) continue

    let best = -1
    let bestDist = Infinity

    for (let j = 0; j < stars.length; j += 1) {
      if (j === i || used.has(j)) continue
      const d = stars[i].pos.distanceTo(stars[j].pos)
      if (d < bestDist && d > 0.35) {
        bestDist = d
        best = j
      }
    }

    if (best >= 0 && bestDist < 2.4) {
      links.push({ a: stars[i].pos, b: stars[best].pos })
      used.add(i)
      used.add(best)
    }
  }

  return links
}

export function RotundaDome({ accent = NEON.cyan }: { accent?: string }) {
  const starsRef = useRef<THREE.InstancedMesh>(null)
  const linksRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const stars = useMemo(() => makeStars(), [])
  const links = useMemo(() => makeLinks(stars), [stars])

  // Link transforms never change, so they are written once.
  useEffect(() => {
    const mesh = linksRef.current
    if (!mesh) return

    const up = new THREE.Vector3(0, 1, 0)
    const dir = new THREE.Vector3()

    links.forEach((link, i) => {
      dir.subVectors(link.b, link.a)
      const len = dir.length()

      dummy.position.copy(link.a).addScaledVector(dir, 0.5)
      dummy.quaternion.setFromUnitVectors(up, dir.normalize())
      dummy.scale.set(1, len, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [dummy, links])

  useFrame(({ clock }) => {
    const mesh = starsRef.current
    if (!mesh) return

    const t = clock.getElapsedTime()

    for (let i = 0; i < stars.length; i += 1) {
      const s = stars[i]
      // Twinkle. Scale rather than opacity, because instances share one material
      // and per-instance opacity is not expressible without a custom shader.
      const twinkle = 0.7 + Math.sin(t * 0.9 + s.phase) * 0.3

      dummy.position.copy(s.pos)
      dummy.quaternion.identity()
      dummy.scale.setScalar(s.size * twinkle)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group raycast={noRaycast}>
      {/* The vault itself. BackSide so we see its inner surface, and opaque so
          it caps the room rather than letting the void through. */}
      <mesh position={[0, DOME_CENTRE_Y, CENTRE_Z]} raycast={noRaycast}>
        <sphereGeometry args={[DOME_RADIUS + 0.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={NEON.void} side={THREE.BackSide} />
      </mesh>

      {/* Meridian ribs, so the dome reads as built rather than as a painted sky. */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI
        return (
          <mesh
            key={i}
            position={[0, DOME_CENTRE_Y, CENTRE_Z]}
            rotation={[0, a, 0]}
            raycast={noRaycast}
          >
            <torusGeometry args={[DOME_RADIUS * 0.99, 0.012, 6, 48, Math.PI]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.16}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}

      {/* Oculus: a bright ring at the crown, where a real dome would open. */}
      <mesh
        position={[0, DOME_CENTRE_Y + DOME_RADIUS * 0.97, CENTRE_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={noRaycast}
      >
        <ringGeometry args={[0.5, 0.62, 48]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Constellation lines — one draw call for all of them. */}
      <instancedMesh
        ref={linksRef}
        args={[undefined, undefined, links.length]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.004, 0.004, 1, 3]} />
        <meshBasicMaterial
          color={NEON.ice}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* Stars — one draw call for all of them. */}
      <instancedMesh
        ref={starsRef}
        args={[undefined, undefined, stars.length]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial
          color={NEON.ice}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}
