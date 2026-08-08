import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GrimoireCard } from '../../types/grimoire'
import { TableBar } from './AltarHardware'
import { TABLE_Y } from './shared'

function isUsableGeneratedCardImageUrl(value: string | undefined): value is string {
  if (!value) return false
  if (value.includes('example.com')) return false
  if (value.includes('grimoirexr.com/images/')) return false

  return (
    value.startsWith('data:image/') ||
    value.startsWith('blob:') ||
    value.startsWith('/api/')
  )
}

function CardFaceArt({ imageUrl }: { imageUrl: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTexture(null)
    setFailed(false)

    const loader = new THREE.TextureLoader()

    loader.load(
      imageUrl,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.flipY = false
        loadedTexture.needsUpdate = true

        setTexture((currentTexture) => {
          currentTexture?.dispose()
          return loadedTexture
        })
      },
      undefined,
      () => {
        if (!cancelled) setFailed(true)
      },
    )

    return () => {
      cancelled = true
    }
  }, [imageUrl])

  if (failed) {
    return (
      <group>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.28, 0.45]} />
          <meshBasicMaterial color="#160807" side={THREE.DoubleSide} />
        </mesh>

        <Text
          position={[0, 0, 0.045]}
          fontSize={0.024}
          color="#ff9a7a"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.22}
        >
          IMAGE ERROR
        </Text>
      </group>
    )
  }

  if (!texture) {
    return (
      <group>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.28, 0.45]} />
          <meshBasicMaterial color="#120806" side={THREE.DoubleSide} />
        </mesh>

        <Text
          position={[0, 0, 0.045]}
          fontSize={0.024}
          color="#d9b5ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.22}
        >
          SEALING IMAGE
        </Text>
      </group>
    )
  }

  return (
    <mesh position={[0, 0, 0.027]}>
      <planeGeometry args={[0.28, 0.45]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.96}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function WorkbenchCard({
  card,
  x,
  z,
  selected,
  onSelect,
  onGenerateImage,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  card: GrimoireCard
  x: number
  z: number
  selected: boolean
  onSelect: () => void
  onGenerateImage: (cardId: number) => Promise<boolean> | void
  onDragStart: (point: THREE.Vector3) => void
  onDragMove: (point: THREE.Vector3) => void
  onDragEnd: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const pointerDownPointRef = useRef<THREE.Vector3 | null>(null)
  const hasMovedRef = useRef(false)
  const cardGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const sigilRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const y = TABLE_Y + (selected || hovered ? 0.13 : 0.07)
  const cardGlowOpacity = selected ? 0.34 : hovered ? 0.22 : 0.085
  const cardGlowScale = selected ? 1.18 : hovered ? 1.1 : 1
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 2.4 + card.id * 0.73) * 0.5

    if (cardGlowMaterialRef.current) {
      cardGlowMaterialRef.current.opacity = cardGlowOpacity + pulse * (selected ? 0.09 : hovered ? 0.045 : 0.015)
    }

    if (sigilRingMaterialRef.current) {
      sigilRingMaterialRef.current.opacity = selected
        ? 0.82 + pulse * 0.16
        : hovered
          ? 0.58 + pulse * 0.12
          : 0.38 + pulse * 0.06
    }
  })

  return (
    <group
      position={[x, y, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={hovered ? 1.06 : 1}
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

        const startPoint = event.point.clone()
        pointerDownPointRef.current = startPoint
        hasMovedRef.current = false

        target.setPointerCapture?.(event.pointerId)
        onDragStart(startPoint)
      }}
      onPointerMove={(event) => {
        if (!pointerDownPointRef.current) return

        event.stopPropagation()

        const moved = pointerDownPointRef.current.distanceTo(event.point)

        if (moved > 0.025) {
          hasMovedRef.current = true
          onDragMove(event.point.clone())
        }
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)

        const moved = pointerDownPointRef.current
          ? pointerDownPointRef.current.distanceTo(event.point)
          : 0
        const wasDrag = moved > 0.18

        pointerDownPointRef.current = null
        hasMovedRef.current = false
        onDragEnd()

        if (wasDrag) return

        onSelect()

        if (
          card.artPrompt &&
          card.imageStatus !== 'ready' &&
          card.imageStatus !== 'generating'
        ) {
          console.info('[GRIMOIRE] Requesting ComfyUI image for card', {
            id: card.id,
            name: card.name,
            imageStatus: card.imageStatus,
            hasOnGenerateImage: typeof onGenerateImage,
          })

          const maybePromise = onGenerateImage(card.id)

          if (maybePromise && typeof maybePromise.then === 'function') {
            void maybePromise
              .then((ok) => {
                console.info('[GRIMOIRE] onGenerateImage resolved', {
                  id: card.id,
                  name: card.name,
                  ok,
                })
              })
              .catch((error) => {
                console.error('[GRIMOIRE] onGenerateImage rejected', error)
              })
          }
        }
      }}
      onPointerCancel={(event) => {
        event.stopPropagation()
        pointerDownPointRef.current = null
        hasMovedRef.current = false
        onDragEnd()
      }}
    >
      <mesh position={[0, 0, -0.018]} scale={cardGlowScale}>
        <planeGeometry args={[0.46, 0.68]} />
        <meshBasicMaterial
          ref={cardGlowMaterialRef}
          color={selected ? '#ffcf7c' : '#8a35ff'}
          transparent
          opacity={cardGlowOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[0.34, 0.54, 0.025]} />
        <meshStandardMaterial
          color={selected ? '#2a1208' : '#160909'}
          emissive={selected ? '#6a2a08' : hovered ? '#3a1608' : '#210c06'}
          emissiveIntensity={selected ? 0.82 : hovered ? 0.52 : 0.36}
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.28, 0.45]} />
        <meshBasicMaterial color={selected ? '#301408' : '#0b0605'} />
      </mesh>


      {isUsableGeneratedCardImageUrl(card.imageUrl) ? <CardFaceArt imageUrl={card.imageUrl} /> : null}

      <mesh position={[0, 0.12, 0.025]}>
        <ringGeometry args={[0.045, 0.062, 18]} />
        <meshBasicMaterial
          ref={sigilRingMaterialRef}
          color={selected ? '#ffcf7c' : hovered ? '#d99b58' : '#9a5a18'}
          transparent
          opacity={selected ? 0.95 : hovered ? 0.72 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, -0.17, 0.035]}
        fontSize={0.032}
        color={selected ? '#fff1c6' : '#d8aa72'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.24}
      >
        {card.name}
      </Text>

      <Text
        position={[0, 0.2, 0.036]}
        fontSize={0.022}
        color={card.artPrompt ? '#d9b5ff' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.26}
      >
        {card.imageStatus === 'ready' ? 'IMAGE SEALED' : card.artPrompt ? 'ART SEED' : 'NO IMAGE'}
      </Text>
    </group>
  )
}

export function DeckTray({
  count,
  active,
}: {
  count: number
  active: boolean
}) {
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)
  const stackRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (haloRef.current) {
      haloRef.current.opacity = active
        ? 0.26 + Math.sin(t * 1.4) * 0.08
        : 0.09 + Math.sin(t * 0.7) * 0.025
    }

    if (innerRef.current) {
      innerRef.current.opacity = active
        ? 0.42 + Math.sin(t * 2.1) * 0.12
        : 0.18
    }

    if (stackRef.current) {
      stackRef.current.position.y = TABLE_Y + 0.07 + Math.sin(t * 0.9) * (active ? 0.012 : 0.004)
      stackRef.current.rotation.z = Math.sin(t * 0.45) * (active ? 0.025 : 0.008)
    }
  })

  return (
    <group>
      <mesh position={[-1.2, TABLE_Y + 0.018, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.43, 48]} />
        <meshBasicMaterial
          ref={haloRef}
          color={active ? '#8a35ff' : '#7b5536'}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-1.2, TABLE_Y + 0.021, -0.04]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <ringGeometry args={[0.24, 0.27, 40]} />
        <meshBasicMaterial
          ref={innerRef}
          color={active ? '#ffcf7c' : '#9a5a18'}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const inner = 0.31
        const outer = i % 3 === 0 ? 0.43 : 0.39

        return (
          <TableBar
            key={i}
            a={[-1.2 + Math.cos(angle) * inner, -0.04 + Math.sin(angle) * inner]}
            b={[-1.2 + Math.cos(angle) * outer, -0.04 + Math.sin(angle) * outer]}
            color={i % 3 === 0 ? '#ffcf7c' : '#8a35ff'}
            opacity={active ? 0.38 : 0.14}
            width={i % 3 === 0 ? 0.012 : 0.007}
          />
        )
      })}

      <group ref={stackRef}>
        {Array.from({ length: active ? 9 : 5 }, (_, i) => (
          <mesh
            key={i}
            position={[
              -1.2 + i * 0.006,
              TABLE_Y + 0.055 + i * 0.008,
              -0.04 - i * 0.004,
            ]}
            rotation={[-Math.PI / 2, 0, -0.08 + i * 0.012]}
          >
            <boxGeometry args={[0.46, 0.68, 0.018]} />
            <meshStandardMaterial
              color={active ? '#180907' : '#100706'}
              emissive={active ? '#3a1608' : '#140807'}
              emissiveIntensity={active ? 0.58 : 0.22}
              roughness={0.44}
              metalness={0.44}
            />
          </mesh>
        ))}

        <mesh position={[-1.2, TABLE_Y + 0.146, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.54]} />
          <meshBasicMaterial
            color={active ? '#2a1208' : '#090505'}
            transparent
            opacity={active ? 0.9 : 0.72}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[-1.2, TABLE_Y + 0.15, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.055, 0.078, 20]} />
          <meshBasicMaterial
            color={active ? '#ffcf7c' : '#7b5536'}
            transparent
            opacity={active ? 0.86 : 0.34}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text
          position={[-1.2, TABLE_Y + 0.158, 0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.034}
          color={active ? '#ffd18a' : '#8b6a45'}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.34}
        >
          {active ? `${count} ONLINE` : 'UNFORGED'}
        </Text>
      </group>

      <Text
        position={[-1.2, TABLE_Y + 0.09, 0.44]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color={active ? '#d9b5ff' : '#9a6b48'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        ARCANA MATRIX
      </Text>

      <Text
        position={[-1.2, TABLE_Y + 0.066, -0.52]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.026}
        color={active ? '#9f744b' : '#5f4932'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        DECK MEMORY // SPREAD SOURCE
      </Text>
    </group>
  )
}
