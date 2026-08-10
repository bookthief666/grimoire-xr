import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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

function MonasConstructionPreview({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.12, 0]} raycast={noRaycast}>
        <ringGeometry args={[0.17, 0.185, 36]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0, 0.12, 0.006]} raycast={noRaycast}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI]} raycast={noRaycast}>
        <torusGeometry args={[0.14, 0.012, 5, 28, Math.PI]} />
        <meshBasicMaterial color="#d8f6ff" />
      </mesh>
      <mesh position={[0, -0.11, 0]} raycast={noRaycast}>
        <planeGeometry args={[0.018, 0.28]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0, -0.16, 0.002]} raycast={noRaycast}>
        <planeGeometry args={[0.26, 0.018]} />
        <meshBasicMaterial color={accent} />
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
  phaseOffset,
}: {
  kind: ChamberPreviewArtifact
  accent: string
  active: boolean
  phaseOffset: number
}) {
  const artifactRef = useRef<THREE.Group>(null)
  const fieldRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 0.72 + phaseOffset) * 0.5
    if (artifactRef.current) {
      artifactRef.current.rotation.z = Math.sin(t * 0.16 + phaseOffset) * 0.035
      artifactRef.current.scale.setScalar(1 + pulse * (active ? 0.04 : 0.015))
    }
    if (fieldRef.current) {
      fieldRef.current.opacity = (active ? 0.13 : 0.045) + pulse * (active ? 0.07 : 0.02)
    }
  })

  return (
    <group ref={artifactRef} raycast={noRaycast}>
      <mesh position={[0, 0, -0.025]} raycast={noRaycast}>
        <circleGeometry args={[0.47, 36]} />
        <meshBasicMaterial color="#030710" />
      </mesh>
      <mesh position={[0, 0, -0.035]} raycast={noRaycast}>
        <ringGeometry args={[0.42, 0.5, 40]} />
        <meshBasicMaterial
          ref={fieldRef}
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
