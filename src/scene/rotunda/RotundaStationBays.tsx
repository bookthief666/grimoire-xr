import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { provenanceLabel } from '../../tools/provenance'
import type { Chamber, ChamberId } from '../chambers/types'
import { TempleText } from '../TempleText'
import { NeonSignLabel } from './NeonSign'
import { NEON_SIGN_PLATES, NEON_SIGN_WIDTH } from './neonSignLayout'
import { stationPose } from './navigationLayout'
import { StationPreviewArtifact } from './StationPreviewArtifact'

const noRaycast = () => null

/** Where the sign group sits in bay space; plate z-offsets stack from here. */
const SIGN_Y = 0.94
const SIGN_Z = 0.015

/**
 * Every repeated surface across all four bays, described once.
 *
 * The four stations are the same architecture at four angles, which makes the
 * whole shell one instancing problem rather than four composition problems.
 * Written out as meshes it costs 40 draws — 28 for the recess/halo/arch/jambs/
 * rails and 12 more for the sign plates — permanently mounted, for wall
 * furniture that is deliberately non-interactive and mostly depicts chambers
 * the practitioner is not currently standing in. Instanced it costs 8.
 *
 * `active`/`idle` are opacities. Instances share one material, so per-instance
 * opacity is not expressible without a custom shader; the brightness step is
 * baked into the instance colour instead. Under additive blending the output
 * contribution is colour x opacity, so scaling the colour by `idle / active`
 * while the material holds `active` reproduces the idle appearance exactly.
 */
const BAY_SHELLS = {
  recess: { offsets: [[0, 0.12, -0.11]], active: 1, idle: 1, tinted: false },
  halo: { offsets: [[0, 0.12, -0.06]], active: 0.12, idle: 0.045, tinted: true },
  arch: { offsets: [[0, 0.66, 0.004]], active: 0.96, idle: 0.56, tinted: true },
  jamb: {
    offsets: [
      [-0.72, 0.1, 0.004],
      [0.72, 0.1, 0.004],
    ],
    active: 0.84,
    idle: 0.46,
    tinted: true,
  },
  rail: {
    offsets: [
      [0, -0.68, 0.006],
      [0, 0.72, 0.006],
    ],
    active: 0.58,
    idle: 0.22,
    tinted: true,
  },
  signGlow: {
    offsets: [[0, SIGN_Y, SIGN_Z + NEON_SIGN_PLATES[0].z]],
    active: NEON_SIGN_PLATES[0].active,
    idle: NEON_SIGN_PLATES[0].idle,
    tinted: true,
  },
  signBorder: {
    offsets: [[0, SIGN_Y, SIGN_Z + NEON_SIGN_PLATES[1].z]],
    active: NEON_SIGN_PLATES[1].active,
    idle: NEON_SIGN_PLATES[1].idle,
    tinted: true,
  },
  signPlate: {
    offsets: [[0, SIGN_Y, SIGN_Z + NEON_SIGN_PLATES[2].z]],
    active: NEON_SIGN_PLATES[2].active,
    idle: NEON_SIGN_PLATES[2].idle,
    tinted: false,
  },
} as const satisfies Record<
  string,
  {
    offsets: readonly (readonly [number, number, number])[]
    active: number
    idle: number
    tinted: boolean
  }
>

type ShellKey = keyof typeof BAY_SHELLS

const SHELL_KEYS = Object.keys(BAY_SHELLS) as ShellKey[]

function stationMeta(chamber: Chamber) {
  if (!chamber.source) {
    return chamber.offline === 'partial'
      ? 'GENERATIVE · NETWORK SERVICES'
      : 'GENERATIVE WORKSTATION'
  }

  return `${provenanceLabel(chamber.source)} · ${chamber.offline === 'full' ? 'OFFLINE' : 'NETWORK'}`
}

/**
 * The instanced shell for every bay. One draw per surface type, not per bay.
 */
function BayShells({
  chambers,
  activeId,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
}) {
  const shells = useRef<Partial<Record<ShellKey, THREE.InstancedMesh | null>>>({})

  useEffect(() => {
    const base = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    const world = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const unit = new THREE.Vector3(1, 1, 1)
    const colour = new THREE.Color()

    for (const key of SHELL_KEYS) {
      const layer = BAY_SHELLS[key]
      const mesh = shells.current[key]
      if (!mesh) continue

      chambers.forEach((chamber, bay) => {
        const pose = stationPose(bay, chambers.length)
        base.compose(
          position.set(...pose.position),
          quaternion.setFromEuler(euler.set(0, pose.rotationY, 0)),
          unit,
        )

        const active = chamber.id === activeId
        // Colour carries the brightness step; see BAY_SHELLS.
        const scale = active ? 1 : layer.idle / layer.active

        layer.offsets.forEach((offset, slot) => {
          const instance = bay * layer.offsets.length + slot
          mesh.setMatrixAt(
            instance,
            world.multiplyMatrices(
              base,
              local.makeTranslation(offset[0], offset[1], offset[2]),
            ),
          )
          if (layer.tinted) {
            mesh.setColorAt(instance, colour.set(chamber.accent).multiplyScalar(scale))
          }
        })
      })

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }, [chambers, activeId])

  const bays = chambers.length
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  } as const

  return (
    <group raycast={noRaycast}>
      {/* Dark architectural recess. Depth-writes, so signage reads as mounted
          into the rotunda wall instead of floating in the void. */}
      <instancedMesh
        ref={(node) => {
          shells.current.recess = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <boxGeometry args={[1.88, 2.24, 0.18]} />
        <meshBasicMaterial color="#03050a" />
      </instancedMesh>

      {/* One cheap halo per bay instead of bloom/postprocessing. */}
      <instancedMesh
        ref={(node) => {
          shells.current.halo = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry args={[2.08, 2.44]} />
        <meshBasicMaterial {...additive} opacity={BAY_SHELLS.halo.active} />
      </instancedMesh>

      {/* Arch and jambs lock each bay into its colonnade opening. */}
      <instancedMesh
        ref={(node) => {
          shells.current.arch = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <torusGeometry args={[0.72, 0.016, 5, 36, Math.PI]} />
        <meshBasicMaterial {...additive} opacity={BAY_SHELLS.arch.active} />
      </instancedMesh>

      <instancedMesh
        ref={(node) => {
          shells.current.jamb = node
        }}
        args={[undefined, undefined, bays * BAY_SHELLS.jamb.offsets.length]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry args={[0.024, 1.12]} />
        <meshBasicMaterial
          {...additive}
          opacity={BAY_SHELLS.jamb.active}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <instancedMesh
        ref={(node) => {
          shells.current.rail = node
        }}
        args={[undefined, undefined, bays * BAY_SHELLS.rail.offsets.length]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry args={[1.42, 0.018]} />
        <meshBasicMaterial {...additive} opacity={BAY_SHELLS.rail.active} />
      </instancedMesh>

      {/* Sign plates: soft spill, bright border, opaque face. */}
      <instancedMesh
        ref={(node) => {
          shells.current.signGlow = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry
          args={[NEON_SIGN_WIDTH + NEON_SIGN_PLATES[0].pad, NEON_SIGN_PLATES[0].height]}
        />
        <meshBasicMaterial {...additive} opacity={BAY_SHELLS.signGlow.active} />
      </instancedMesh>

      <instancedMesh
        ref={(node) => {
          shells.current.signBorder = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry
          args={[NEON_SIGN_WIDTH + NEON_SIGN_PLATES[1].pad, NEON_SIGN_PLATES[1].height]}
        />
        <meshBasicMaterial {...additive} opacity={BAY_SHELLS.signBorder.active} />
      </instancedMesh>

      <instancedMesh
        ref={(node) => {
          shells.current.signPlate = node
        }}
        args={[undefined, undefined, bays]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <planeGeometry
          args={[NEON_SIGN_WIDTH + NEON_SIGN_PLATES[2].pad, NEON_SIGN_PLATES[2].height]}
        />
        <meshBasicMaterial
          color={NEON.void}
          transparent
          opacity={BAY_SHELLS.signPlate.active}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}

/**
 * Ambient wall stations. They intentionally do not raycast: at ~6m they live
 * in the ambient zone, so the actual interaction surface belongs on the altar
 * console at hand reach. This keeps the room-as-interface composition without
 * turning distant architecture into ergonomically ambiguous controls.
 */
export function RotundaStationBays({
  chambers,
  activeId,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
}) {
  const animationRefs = useRef<Array<THREE.Group | null>>([])
  const fieldMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([])

  const poses = useMemo(
    () => chambers.map((_, index) => stationPose(index, chambers.length)),
    [chambers],
  )

  // One shared frame subscription animates every ambient preview. The four bays
  // stay mounted for architectural continuity without registering four separate
  // useFrame callbacks.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    chambers.forEach((chamber, index) => {
      const phaseOffset = index * 1.37
      const pulse = 0.5 + Math.sin(t * 0.72 + phaseOffset) * 0.5
      const active = chamber.id === activeId
      const artifact = animationRefs.current[index]
      const field = fieldMaterialRefs.current[index]

      if (artifact) {
        artifact.rotation.z = Math.sin(t * 0.16 + phaseOffset) * 0.035
        artifact.scale.setScalar(1 + pulse * (active ? 0.04 : 0.015))
      }
      if (field) {
        field.opacity = (active ? 0.13 : 0.045) + pulse * (active ? 0.07 : 0.02)
      }
    })
  })

  return (
    <group raycast={noRaycast}>
      <BayShells chambers={chambers} activeId={activeId} />

      {/* Per-bay layer: text cannot instance, and each preview is a different
          object by design. Everything repeated lives in BayShells above. */}
      {chambers.map((chamber, index) => {
        const active = chamber.id === activeId
        const pose = poses[index]

        return (
          <group
            key={chamber.id}
            position={pose.position}
            rotation={[0, pose.rotationY, 0]}
            raycast={noRaycast}
          >
            <group position={[0, SIGN_Y, SIGN_Z]}>
              <NeonSignLabel
                label={chamber.name}
                accent={chamber.accent}
                active={active}
              />
            </group>

            <group position={[0, 0.2, 0.035]}>
              <StationPreviewArtifact
                kind={chamber.previewArtifact}
                accent={chamber.accent}
                active={active}
                animationRef={(node) => {
                  animationRefs.current[index] = node
                }}
                fieldMaterialRef={(node) => {
                  fieldMaterialRefs.current[index] = node
                }}
              />
            </group>

            <TempleText
              position={[0, -0.37, 0.026]}
              fontSize={0.057}
              color={NEON.text}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.48}
              textAlign="center"
            >
              {chamber.purpose}
            </TempleText>

            <TempleText
              position={[0, -0.58, 0.026]}
              fontSize={0.044}
              color={active ? chamber.accent : NEON.textDim}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              textAlign="center"
            >
              {active ? `ACTIVE · ${stationMeta(chamber)}` : stationMeta(chamber)}
            </TempleText>
          </group>
        )
      })}
    </group>
  )
}
