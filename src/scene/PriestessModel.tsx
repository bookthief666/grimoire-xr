import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const PRIESTESS_MODEL_PATH = '/models/obsidian-veil-priestess.glb'

export function PriestessModel() {
  const auraRingRef = useRef<THREE.Mesh>(null)
  const auraDiscRef = useRef<THREE.Mesh>(null)
  const gltf = useGLTF(PRIESTESS_MODEL_PATH)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  const priestessMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#08050a',
        emissive: '#4d0018',
        emissiveIntensity: 0.38,
        metalness: 0.58,
        roughness: 0.34,
        envMapIntensity: 0.72,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (auraRingRef.current) {
      auraRingRef.current.rotation.z = t * 0.035
      const material = auraRingRef.current.material
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = 0.16 + Math.sin(t * 0.9) * 0.035
      }
    }

    if (auraDiscRef.current) {
      const material = auraDiscRef.current.material
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = 0.045 + Math.sin(t * 0.65) * 0.015
      }
    }
  })

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return

      object.castShadow = false
      object.receiveShadow = false
      object.frustumCulled = true
      object.material = priestessMaterial
    })

    return () => {
      priestessMaterial.dispose()
    }
  }, [scene, priestessMaterial])

  return (
    <group
      name="ObsidianVeilPriestess"
      position={[0, -0.08, -1.72]}
      rotation={[0, 0, 0]}
      scale={0.96}
    >
      <mesh
        name="PriestessAuraDisc"
        ref={auraDiscRef}
        position={[0, 0.92, -0.16]}
        renderOrder={10}
      >
        <circleGeometry args={[0.82, 96]} />
        <meshBasicMaterial
          color="#ff003c"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        name="PriestessAuraRing"
        ref={auraRingRef}
        position={[0, 0.92, -0.15]}
        renderOrder={11}
      >
        <ringGeometry args={[0.76, 0.8, 128]} />
        <meshBasicMaterial
          color="#ff1a3d"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(PRIESTESS_MODEL_PATH)
