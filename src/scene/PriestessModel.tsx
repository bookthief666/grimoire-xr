import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const PRIESTESS_MODEL_PATH = '/models/obsidian-veil-priestess.glb'

export function PriestessModel() {
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
      position={[0, -0.04, -3.05]}
      rotation={[0, Math.PI, 0]}
      scale={1.08}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(PRIESTESS_MODEL_PATH)
