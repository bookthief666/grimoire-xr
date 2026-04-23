import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { Edges, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../theme/palette'
import type { GrimoireCard, SubjectDossier } from '../types/grimoire'
import { InWorldOraclePanels } from './InWorldOraclePanels'

type ManifestState = {
  card: GrimoireCard
  spawnPosition: [number, number, number]
  spawnRotationY: number
  activationId: number
}

let ritualAudioCtx: AudioContext | null = null

function playRitualSting() {
  if (typeof window === 'undefined') return

  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioCtx) return

  if (!ritualAudioCtx) {
    ritualAudioCtx = new AudioCtx()
  }

  const ctx = ritualAudioCtx

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(110, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.22)

  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.3)
}

function FloorBar({
  a,
  b,
  color = PALETTE.glyphDim,
  opacity = 0.8,
  width = 0.035,
  y = 0.012,
}: {
  a: [number, number]
  b: [number, number]
  color?: string
  opacity?: number
  width?: number
  y?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]}
      rotation={[-Math.PI / 2, 0, angle]}
    >
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function HexagramSeal() {
  const points = useMemo<[number, number][]>(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3
      return [Math.cos(angle) * 1.04, Math.sin(angle) * 1.04]
    })
  }, [])

  return (
    <group>
      <FloorBar a={points[0]} b={points[2]} color={PALETTE.glyph} opacity={0.92} width={0.04} />
      <FloorBar a={points[2]} b={points[4]} color={PALETTE.glyph} opacity={0.92} width={0.04} />
      <FloorBar a={points[4]} b={points[0]} color={PALETTE.glyph} opacity={0.92} width={0.04} />

      <FloorBar a={points[1]} b={points[3]} color={PALETTE.glyph} opacity={0.92} width={0.04} />
      <FloorBar a={points[3]} b={points[5]} color={PALETTE.glyph} opacity={0.92} width={0.04} />
      <FloorBar a={points[5]} b={points[1]} color={PALETTE.glyph} opacity={0.92} width={0.04} />
    </group>
  )
}

function RadialMarks() {
  const bars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const inner: [number, number] = [
        Math.cos(angle) * 1.38,
        Math.sin(angle) * 1.38,
      ]
      const outer: [number, number] = [
        Math.cos(angle) * 2.04,
        Math.sin(angle) * 2.04,
      ]
      return { inner, outer }
    })
  }, [])

  return (
    <>
      {bars.map((bar, i) => (
        <FloorBar
          key={i}
          a={bar.inner}
          b={bar.outer}
          color={PALETTE.glyphDim}
          opacity={0.68}
          width={0.03}
          y={0.011}
        />
      ))}
    </>
  )
}

function Pillar({ x }: { x: number }) {
  return (
    <group position={[x, 0, -3.55]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.36, 12]} />
        <meshLambertMaterial color={PALETTE.massDark} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 2.4, 12]} />
        <meshLambertMaterial color={PALETTE.mass} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 2.84, 0]}>
        <cylinderGeometry args={[0.34, 0.22, 0.18, 12]} />
        <meshLambertMaterial color={PALETTE.massLift} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 2.62, 0]}>
        <torusGeometry args={[0.23, 0.025, 10, 28]} />
        <meshBasicMaterial color={PALETTE.ember} />
      </mesh>

      <mesh position={[0, 1.82, 0.19]}>
        <Text
          fontSize={0.14}
          color={PALETTE.gold}
          anchorX="center"
          anchorY="middle"
        >
          93
        </Text>
      </mesh>
    </group>
  )
}

function RearShrine({
  ritualImpulseRef,
}: {
  ritualImpulseRef: MutableRefObject<number>
}) {
  const outerRingRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerDiskRef = useRef<THREE.MeshBasicMaterial>(null)
  const centerRingRef = useRef<THREE.MeshBasicMaterial>(null)

  const outerBase = useRef(new THREE.Color(PALETTE.ember))
  const outerPulse = useRef(new THREE.Color(PALETTE.gold))

  const diskBase = useRef(new THREE.Color(PALETTE.bloodDim))
  const diskPulse = useRef(new THREE.Color(PALETTE.blood))

  const centerBase = useRef(new THREE.Color(PALETTE.emberBright))
  const centerPulse = useRef(new THREE.Color(PALETTE.sacred))

  const tempOuter = useRef(new THREE.Color())
  const tempDisk = useRef(new THREE.Color())
  const tempCenter = useRef(new THREE.Color())

  useFrame((_, delta) => {
    const impulse = ritualImpulseRef.current

    if (outerRingRef.current) {
      tempOuter.current.copy(outerBase.current).lerp(outerPulse.current, impulse * 0.92)
      outerRingRef.current.color.lerp(tempOuter.current, delta * 7)
    }

    if (innerDiskRef.current) {
      tempDisk.current.copy(diskBase.current).lerp(diskPulse.current, impulse * 0.55)
      innerDiskRef.current.color.lerp(tempDisk.current, delta * 5)
    }

    if (centerRingRef.current) {
      tempCenter.current.copy(centerBase.current).lerp(centerPulse.current, impulse)
      centerRingRef.current.color.lerp(tempCenter.current, delta * 7.5)
    }
  })

  return (
    <group position={[0, 0, -4.45]}>
      <mesh position={[0, 1.7, -0.16]}>
        <boxGeometry args={[5.5, 3.9, 0.35]} />
        <meshLambertMaterial color={PALETTE.massDark} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.4, 0.45]}>
        <boxGeometry args={[2.2, 0.3, 1.2]} />
        <meshLambertMaterial color={PALETTE.massDark} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.9, 0.15]}>
        <boxGeometry args={[1.6, 0.7, 0.7]} />
        <meshLambertMaterial color={PALETTE.mass} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 2.25, 0.05]}>
        <torusGeometry args={[0.92, 0.07, 12, 36]} />
        <meshBasicMaterial ref={outerRingRef} color={PALETTE.ember} />
      </mesh>

      <mesh position={[0, 2.25, 0.02]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial ref={innerDiskRef} color={PALETTE.bloodDim} />
      </mesh>

      <mesh position={[0, 2.25, 0.08]}>
        <ringGeometry args={[0.2, 0.28, 24]} />
        <meshBasicMaterial ref={centerRingRef} color={PALETTE.emberBright} />
      </mesh>

      <mesh position={[0, 2.95, 0.06]}>
        <coneGeometry args={[0.18, 0.34, 4]} />
        <meshBasicMaterial color={PALETTE.ember} />
      </mesh>

      <mesh position={[0, 2.65, 0.1]}>
        <Text
          fontSize={0.12}
          color={PALETTE.sacred}
          anchorX="center"
          anchorY="middle"
        >
          THELEMA
        </Text>
      </mesh>
    </group>
  )
}

function CeilingCrown({
  ritualImpulseRef,
}: {
  ritualImpulseRef: MutableRefObject<number>
}) {
  const outerTorusRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRingRef = useRef<THREE.MeshBasicMaterial>(null)

  const torusBase = useRef(new THREE.Color(PALETTE.bloodDim))
  const torusPulse = useRef(new THREE.Color(PALETTE.emberBright))

  const ringBase = useRef(new THREE.Color(PALETTE.outlineDark))
  const ringPulse = useRef(new THREE.Color(PALETTE.ember))

  const tempTorus = useRef(new THREE.Color())
  const tempRing = useRef(new THREE.Color())

  useFrame((_, delta) => {
    const impulse = ritualImpulseRef.current

    if (outerTorusRef.current) {
      tempTorus.current.copy(torusBase.current).lerp(torusPulse.current, impulse * 0.65)
      outerTorusRef.current.color.lerp(tempTorus.current, delta * 5)
    }

    if (innerRingRef.current) {
      tempRing.current.copy(ringBase.current).lerp(ringPulse.current, impulse * 0.75)
      innerRingRef.current.color.lerp(tempRing.current, delta * 5)
    }
  })

  return (
    <group position={[0, 3.4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.15, 0.05, 12, 48]} />
        <meshBasicMaterial ref={outerTorusRef} color={PALETTE.bloodDim} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.28, 32]} />
        <meshBasicMaterial
          ref={innerRingRef}
          color={PALETTE.outlineDark}
          transparent
          opacity={0.95}
        />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI) / 3
        const x = Math.cos(angle) * 1.95
        const z = Math.sin(angle) * 1.95
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.24, 4]} />
            <meshBasicMaterial color={PALETTE.ember} />
          </mesh>
        )
      })}
    </group>
  )
}

function Embers({
  ritualImpulseRef,
}: {
  ritualImpulseRef: MutableRefObject<number>
}) {
  const emberRefs = useRef<(THREE.Mesh | null)[]>([])

  const emberData = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      x: (Math.random() - 0.5) * 5.2,
      y: 0.15 + Math.random() * 2.8,
      z: -0.6 - Math.random() * 4.4,
      size: 0.012 + Math.random() * 0.03,
      drift: 0.08 + Math.random() * 0.1,
      sway: 0.15 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2 + i,
    }))
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    for (let i = 0; i < emberRefs.current.length; i += 1) {
      const mesh = emberRefs.current[i]
      const d = emberData[i]

      if (!mesh) continue

      const speedBoost = 1 + impulse * 0.55
      mesh.position.y += d.drift * delta * speedBoost
      mesh.position.x += Math.sin(t * d.sway + d.phase) * 0.0009 * (1 + impulse * 0.8)
      mesh.position.z += Math.cos(t * d.sway + d.phase) * 0.0006 * (1 + impulse * 0.5)

      if (mesh.position.y > 3.4) {
        mesh.position.y = 0.15
      }

      const pulse = 0.45 + Math.sin(t * 2.4 + d.phase) * 0.18 + impulse * 0.24
      const scale = d.size * (1 + pulse)
      mesh.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {emberData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            emberRefs.current[i] = el
          }}
          position={[d.x, d.y, d.z]}
        >
          <sphereGeometry args={[d.size, 5, 5]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? PALETTE.emberBright : PALETTE.blood}
            transparent
            opacity={0.58}
          />
        </mesh>
      ))}
    </group>
  )
}

function TempleFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshLambertMaterial color={PALETTE.floor} flatShading />
      </mesh>

      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.45, 2.62, 48]} />
        <meshBasicMaterial color={PALETTE.floorOuter} />
      </mesh>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.98, 2.03, 48]} />
        <meshBasicMaterial color={PALETTE.floorMid} />
      </mesh>

      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.32, 48]} />
        <meshBasicMaterial color={PALETTE.floorInner} />
      </mesh>

      <HexagramSeal />
      <RadialMarks />
    </group>
  )
}

function Altar({
  manifest,
  ritualImpulseRef,
  onLanding,
}: {
  manifest: ManifestState | null
  ritualImpulseRef: MutableRefObject<number>
  onLanding: (activationId: number) => void
}) {
  const manifestedCardRef = useRef<THREE.Group>(null)
  const altarRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const altarHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const landedActivationIdRef = useRef<number | null>(null)

  const dormantRingColor = useRef(new THREE.Color(PALETTE.glyphDim))
  const restingRingColor = useRef(new THREE.Color(PALETTE.ember))
  const flareRingColor = useRef(new THREE.Color(PALETTE.gold))

  const dormantHaloColor = useRef(new THREE.Color(PALETTE.goldDim))
  const restingHaloColor = useRef(new THREE.Color(PALETTE.ember))
  const flareHaloColor = useRef(new THREE.Color(PALETTE.sacred))

  const tempRing = useRef(new THREE.Color())
  const tempHalo = useRef(new THREE.Color())

  useEffect(() => {
    if (!manifest || !manifestedCardRef.current) return

    const localSpawnX = manifest.spawnPosition[0]
    const localSpawnY = manifest.spawnPosition[1]
    const localSpawnZ = manifest.spawnPosition[2] + 1

    manifestedCardRef.current.position.set(localSpawnX, localSpawnY, localSpawnZ)
    manifestedCardRef.current.rotation.set(0, manifest.spawnRotationY, 0)
    manifestedCardRef.current.scale.set(0.82, 0.82, 0.82)

    landedActivationIdRef.current = null

    if (altarRingMaterialRef.current) {
      altarRingMaterialRef.current.color.copy(flareRingColor.current)
    }

    if (altarHaloMaterialRef.current) {
      altarHaloMaterialRef.current.color.copy(flareHaloColor.current)
    }
  }, [manifest])

  useFrame((_, delta) => {
    const impulse = ritualImpulseRef.current

    if (manifest && manifestedCardRef.current) {
      const card = manifestedCardRef.current

      card.position.x = THREE.MathUtils.lerp(card.position.x, 0, delta * 4.2)
      card.position.y = THREE.MathUtils.lerp(card.position.y, 0.94, delta * 4.4)
      card.position.z = THREE.MathUtils.lerp(card.position.z, 0, delta * 4.6)

      card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, -Math.PI / 2, delta * 4.2)
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, 0, delta * 4.2)
      card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, 0, delta * 4.2)

      card.scale.x = THREE.MathUtils.lerp(card.scale.x, 1, delta * 4.2)
      card.scale.y = THREE.MathUtils.lerp(card.scale.y, 1, delta * 4.2)
      card.scale.z = THREE.MathUtils.lerp(card.scale.z, 1, delta * 4.2)

      const closeEnough =
        Math.abs(card.position.x) < 0.02 &&
        Math.abs(card.position.y - 0.94) < 0.02 &&
        Math.abs(card.position.z) < 0.02 &&
        Math.abs(card.rotation.x + Math.PI / 2) < 0.03

      if (
        closeEnough &&
        landedActivationIdRef.current !== manifest.activationId
      ) {
        landedActivationIdRef.current = manifest.activationId
        onLanding(manifest.activationId)
      }
    }

    if (altarRingMaterialRef.current) {
      tempRing.current
        .copy(manifest ? restingRingColor.current : dormantRingColor.current)
        .lerp(flareRingColor.current, impulse * 0.95)

      altarRingMaterialRef.current.color.lerp(tempRing.current, delta * 7)
    }

    if (altarHaloMaterialRef.current) {
      tempHalo.current
        .copy(manifest ? restingHaloColor.current : dormantHaloColor.current)
        .lerp(flareHaloColor.current, impulse * 0.95)

      altarHaloMaterialRef.current.color.lerp(tempHalo.current, delta * 6)
    }
  })

  return (
    <group position={[0, 0, -1.0]}>
      <mesh position={[0, 0.16, 0.16]}>
        <boxGeometry args={[1.5, 0.12, 0.95]} />
        <meshLambertMaterial color={PALETTE.massDark} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.2, 0.72, 0.6]} />
        <meshLambertMaterial color={PALETTE.mass} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color={PALETTE.cardFace} />
      </mesh>

      <mesh position={[0, 0.913, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.37, 36]} />
        <meshBasicMaterial
          ref={altarRingMaterialRef}
          color={manifest ? PALETTE.ember : PALETTE.glyphDim}
        />
      </mesh>

      <mesh position={[0, 1.28, -0.09]}>
        <torusGeometry args={[0.24, 0.02, 10, 28]} />
        <meshBasicMaterial ref={altarHaloMaterialRef} color={PALETTE.goldDim} />
      </mesh>

      {manifest ? (
        <>
          <group ref={manifestedCardRef}>
            <mesh>
              <boxGeometry args={[0.52, 0.86, 0.03]} />
              <meshLambertMaterial color={PALETTE.cardBody} flatShading />
              <Edges color={PALETTE.outlineHot} />
            </mesh>

            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.74]} />
              <meshBasicMaterial color={PALETTE.cardFace} />
            </mesh>

            <mesh position={[0, 0.26, 0.019]}>
              <ringGeometry args={[0.07, 0.11, 20]} />
              <meshBasicMaterial color={PALETTE.gold} />
            </mesh>

            <Text
              position={[0, -0.3, 0.03]}
              fontSize={0.05}
              maxWidth={0.34}
              color={PALETTE.textPrimary}
              anchorX="center"
              anchorY="middle"
            >
              {manifest.card.name}
            </Text>
          </group>

          <Text
            position={[0, 1.22, 0]}
            fontSize={0.075}
            color={PALETTE.textPrimary}
            anchorX="center"
            anchorY="middle"
          >
            {manifest.card.name}
          </Text>
        </>
      ) : (
        <Text
          position={[0, 1.18, 0]}
          fontSize={0.068}
          color={PALETTE.textIdle}
          anchorX="center"
          anchorY="middle"
        >
          Awaiting Selection
        </Text>
      )}
    </group>
  )
}

function CardArc({
  cards,
  onSelect,
  selectedId,
}: {
  cards: GrimoireCard[]
  onSelect: (
    card: GrimoireCard,
    position: [number, number, number],
    rotY: number,
  ) => void
  selectedId: number | null
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const cardSlots = useMemo(() => {
    if (cards.length === 0) return []
    const radius = 2.08

    return cards.map((card, index) => {
      const t = -0.8 + (index / Math.max(cards.length - 1, 1)) * 1.6
      const x = Math.sin(t) * radius
      const z = -2.02 - Math.cos(t) * radius * 0.32
      const y = 1.33
      const rotY = -t * 0.82

      return {
        ...card,
        position: [x, y, z] as [number, number, number],
        rotY,
      }
    })
  }, [cards])

  return (
    <group>
      {cardSlots.map((card) => {
        const isSelected = card.id === selectedId
        const isHovered = card.id === hoveredId

        return (
          <group
            key={card.id}
            position={card.position}
            rotation={[0, card.rotY, 0]}
            onClick={() => onSelect(card, card.position, card.rotY)}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(card.id)
            }}
            onPointerOut={() => setHoveredId(null)}
            scale={isHovered ? 1.06 : 1}
          >
            <mesh>
              <boxGeometry args={[0.42, 0.72, 0.025]} />
              <meshLambertMaterial
                color={isSelected ? PALETTE.cardBody : PALETTE.cardBodyDim}
                flatShading
              />
              <Edges color={isHovered ? PALETTE.outlineHot : PALETTE.outlineDark} />
            </mesh>

            <mesh position={[0, 0, 0.014]}>
              <planeGeometry args={[0.35, 0.59]} />
              <meshBasicMaterial color={isSelected ? PALETTE.cardFace : PALETTE.massDark} />
            </mesh>

            <mesh position={[0, 0.22, 0.015]}>
              <ringGeometry args={[0.045, 0.07, 16]} />
              <meshBasicMaterial color={isSelected ? PALETTE.gold : PALETTE.goldDim} />
            </mesh>

            <Text
              position={[0, -0.26, 0.026]}
              fontSize={0.04}
              maxWidth={0.28}
              color={isSelected ? PALETTE.textPrimary : PALETTE.textSecondary}
              anchorX="center"
              anchorY="middle"
            >
              {card.name}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

export function RitualChamberScene({
  cards,
  selectedCardId,
  altarCard,
  focusedCard = null,
  dossier = null,
  showInWorldPanels = true,
  onCardActivate,
  onAltarLanding,
}: {
  cards: GrimoireCard[]
  selectedCardId: number | null
  altarCard: GrimoireCard | null
  focusedCard?: GrimoireCard | null
  dossier?: SubjectDossier | null
  showInWorldPanels?: boolean
  onCardActivate: (card: GrimoireCard) => void
  onAltarLanding: () => void
}) {
  const [manifest, setManifest] = useState<ManifestState | null>(null)
  const activationCounterRef = useRef(0)
  const ritualImpulseRef = useRef(0)

  useEffect(() => {
    if (!altarCard) {
      setManifest(null)
    }
  }, [altarCard])

  useFrame((_, delta) => {
    ritualImpulseRef.current = THREE.MathUtils.lerp(
      ritualImpulseRef.current,
      0,
      delta * 2.35,
    )
  })

  const handleSelect = (
    card: GrimoireCard,
    position: [number, number, number],
    rotY: number,
  ) => {
    playRitualSting()
    activationCounterRef.current += 1
    onCardActivate(card)

    setManifest({
      card,
      spawnPosition: position,
      spawnRotationY: rotY,
      activationId: activationCounterRef.current,
    })
  }

  const handleLanding = (_activationId: number) => {
    ritualImpulseRef.current = 1
    onAltarLanding()
  }

  const shouldShowOraclePanels =
    showInWorldPanels && (Boolean(dossier) || Boolean(focusedCard))

  return (
    <group>
      <TempleFloor />
      <RearShrine ritualImpulseRef={ritualImpulseRef} />
      <Pillar x={-2.1} />
      <Pillar x={2.1} />
      <CeilingCrown ritualImpulseRef={ritualImpulseRef} />
      <Embers ritualImpulseRef={ritualImpulseRef} />
      <Altar
        manifest={manifest}
        ritualImpulseRef={ritualImpulseRef}
        onLanding={handleLanding}
      />
      <CardArc
        cards={cards}
        selectedId={selectedCardId}
        onSelect={handleSelect}
      />

      {shouldShowOraclePanels ? (
        <InWorldOraclePanels dossier={dossier ?? null} focusedCard={focusedCard ?? null} />
      ) : null}

      <Text
        position={[0, 3.05, -2.55]}
        fontSize={0.12}
        color={PALETTE.gold}
        anchorX="center"
        anchorY="middle"
      >
        DO WHAT THOU WILT
      </Text>

      <Text
        position={[0, 2.78, -2.58]}
        fontSize={0.08}
        color={PALETTE.textSecondary}
        anchorX="center"
        anchorY="middle"
      >
        GRIMOIRE XR // TEMPLE CHAMBER
      </Text>
    </group>
  )
}
