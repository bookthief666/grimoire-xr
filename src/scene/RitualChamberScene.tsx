import { useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

type CardData = {
  id: number
  name: string
}

const CARD_NAMES: CardData[] = [
  { id: 0, name: 'The Spark' },
  { id: 1, name: 'The Veil' },
  { id: 2, name: 'The Chalice' },
  { id: 3, name: 'The Gate' },
  { id: 4, name: 'The Serpent' },
  { id: 5, name: 'The Lamp' },
]

let ritualAudioCtx: AudioContext | null = null

function playRitualSting() {
  if (typeof window === 'undefined') return

  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

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
  color = '#552211',
  opacity = 0.7,
  width = 0.03,
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
    <mesh position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[-Math.PI / 2, 0, angle]}>
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function HexagramSeal() {
  const points = useMemo<[number, number][]>(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3
      return [Math.cos(angle) * 1.02, Math.sin(angle) * 1.02]
    })
  }, [])

  return (
    <group>
      <FloorBar a={points[0]} b={points[2]} color="#8a2d08" opacity={0.85} width={0.035} />
      <FloorBar a={points[2]} b={points[4]} color="#8a2d08" opacity={0.85} width={0.035} />
      <FloorBar a={points[4]} b={points[0]} color="#8a2d08" opacity={0.85} width={0.035} />

      <FloorBar a={points[1]} b={points[3]} color="#8a2d08" opacity={0.85} width={0.035} />
      <FloorBar a={points[3]} b={points[5]} color="#8a2d08" opacity={0.85} width={0.035} />
      <FloorBar a={points[5]} b={points[1]} color="#8a2d08" opacity={0.85} width={0.035} />
    </group>
  )
}

function RadialMarks() {
  const bars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const inner: [number, number] = [Math.cos(angle) * 1.35, Math.sin(angle) * 1.35]
      const outer: [number, number] = [Math.cos(angle) * 1.9, Math.sin(angle) * 1.9]
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
          color="#441100"
          opacity={0.55}
          width={0.025}
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
        <cylinderGeometry args={[0.3, 0.38, 0.36, 18]} />
        <meshStandardMaterial color="#0d0b0b" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 2.4, 18]} />
        <meshStandardMaterial color="#161212" roughness={0.88} metalness={0.08} />
      </mesh>

      <mesh position={[0, 2.84, 0]}>
        <cylinderGeometry args={[0.34, 0.22, 0.18, 18]} />
        <meshStandardMaterial color="#0f0d0d" roughness={0.85} />
      </mesh>

      <mesh position={[0, 2.62, 0]}>
        <torusGeometry args={[0.23, 0.025, 10, 40]} />
        <meshBasicMaterial color="#7a2100" />
      </mesh>

      <mesh position={[0, 1.82, 0.19]}>
        <Text fontSize={0.14} color="#b83812" anchorX="center" anchorY="middle">
          93
        </Text>
      </mesh>
    </group>
  )
}

function RearShrine() {
  return (
    <group position={[0, 0, -4.45]}>
      <mesh position={[0, 1.7, -0.16]}>
        <boxGeometry args={[5.5, 3.9, 0.35]} />
        <meshStandardMaterial color="#0c0707" roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.4, 0.45]}>
        <boxGeometry args={[2.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#080606" roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.9, 0.15]}>
        <boxGeometry args={[1.6, 0.7, 0.7]} />
        <meshStandardMaterial color="#0a0808" roughness={0.93} />
      </mesh>

      <mesh position={[0, 2.25, 0.05]}>
        <torusGeometry args={[0.92, 0.07, 16, 64]} />
        <meshBasicMaterial color="#8f2c06" />
      </mesh>

      <mesh position={[0, 2.25, 0.02]}>
        <circleGeometry args={[0.55, 36]} />
        <meshBasicMaterial color="#3a1200" />
      </mesh>

      <mesh position={[0, 2.25, 0.08]}>
        <ringGeometry args={[0.2, 0.28, 36]} />
        <meshBasicMaterial color="#ff7a22" />
      </mesh>

      <mesh position={[0, 2.95, 0.06]}>
        <coneGeometry args={[0.18, 0.34, 5]} />
        <meshBasicMaterial color="#aa3300" />
      </mesh>

      <mesh position={[0, 2.65, 0.1]}>
        <Text fontSize={0.12} color="#ffb280" anchorX="center" anchorY="middle">
          THELEMA
        </Text>
      </mesh>
    </group>
  )
}

function CeilingCrown() {
  return (
    <group position={[0, 3.4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.15, 0.05, 16, 84]} />
        <meshBasicMaterial color="#4e0e00" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.28, 48]} />
        <meshBasicMaterial color="#270900" transparent opacity={0.9} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI) / 3
        const x = Math.cos(angle) * 1.95
        const z = Math.sin(angle) * 1.95
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.24, 4]} />
            <meshBasicMaterial color="#7d1e00" />
          </mesh>
        )
      })}
    </group>
  )
}

function Embers() {
  const emberRefs = useRef<(Mesh | null)[]>([])

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

    emberRefs.current.forEach((mesh, i) => {
      const d = emberData[i]
      if (!mesh) return

      mesh.position.y += d.drift * delta
      mesh.position.x += Math.sin(t * d.sway + d.phase) * 0.0009
      mesh.position.z += Math.cos(t * d.sway + d.phase) * 0.0006

      if (mesh.position.y > 3.4) {
        mesh.position.y = 0.15
      }

      const pulse = 0.45 + Math.sin(t * 2.4 + d.phase) * 0.18
      mesh.scale.setScalar(d.size * (1 + pulse))
    })
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
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#ff9a3d' : '#a82200'} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function TempleFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshLambertMaterial color="#090000" />
      </mesh>

      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.45, 2.62, 64]} />
        <meshBasicMaterial color="#2a0900" />
      </mesh>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.98, 2.03, 64]} />
        <meshBasicMaterial color="#672100" />
      </mesh>

      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.32, 64]} />
        <meshBasicMaterial color="#5b1600" />
      </mesh>

      <HexagramSeal />
      <RadialMarks />
    </group>
  )
}

function Altar({ selectedCard }: { selectedCard: CardData | null }) {
  return (
    <group position={[0, 0, -1.0]}>
      <mesh position={[0, 0.16, 0.16]}>
        <boxGeometry args={[1.5, 0.12, 0.95]} />
        <meshStandardMaterial color="#080707" roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.2, 0.72, 0.6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.82} metalness={0.12} />
      </mesh>

      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#260c05" />
      </mesh>

      <mesh position={[0, 0.913, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.37, 48]} />
        <meshBasicMaterial color={selectedCard ? '#cf4a14' : '#5a2410'} />
      </mesh>

      <mesh position={[0, 1.28, -0.09]}>
        <torusGeometry args={[0.24, 0.02, 10, 40]} />
        <meshBasicMaterial color="#662100" />
      </mesh>

      {selectedCard ? (
        <>
          <group position={[0, 0.94, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.52, 0.86, 0.03]} />
              <meshStandardMaterial color="#3a1200" emissive="#2a0700" />
            </mesh>

            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.74]} />
              <meshBasicMaterial color="#1b0904" />
            </mesh>

            <mesh position={[0, 0.26, 0.019]}>
              <ringGeometry args={[0.07, 0.11, 24]} />
              <meshBasicMaterial color="#8f2c06" />
            </mesh>

            <Text
              position={[0, -0.3, 0.03]}
              fontSize={0.05}
              maxWidth={0.34}
              color="#ffddaa"
              anchorX="center"
              anchorY="middle"
            >
              {selectedCard.name}
            </Text>
          </group>

          <Text
            position={[0, 1.22, 0]}
            fontSize={0.085}
            color="#ffcc88"
            anchorX="center"
            anchorY="middle"
          >
            {selectedCard.name}
          </Text>
        </>
      ) : (
        <Text
          position={[0, 1.22, 0]}
          fontSize={0.095}
          color="#ffcc88"
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
  onSelect,
  selectedId,
}: {
  onSelect: (c: CardData) => void
  selectedId: number | null
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const cards = useMemo(() => {
    const radius = 2.08

    return CARD_NAMES.map((card, index) => {
      const t = -0.8 + (index / (CARD_NAMES.length - 1)) * 1.6
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
  }, [])

  return (
    <group>
      {cards.map((card) => {
        const isSelected = card.id === selectedId
        const isHovered = card.id === hoveredId

        return (
          <group
            key={card.id}
            position={card.position}
            rotation={[0, card.rotY, 0]}
            onClick={() => onSelect(card)}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(card.id)
            }}
            onPointerOut={() => setHoveredId(null)}
            scale={isHovered ? 1.06 : 1}
          >
            <mesh>
              <boxGeometry args={[0.42, 0.72, 0.025]} />
              <meshStandardMaterial
                color={isSelected ? '#3a1200' : '#120606'}
                emissive={isHovered ? '#551400' : isSelected ? '#260700' : '#000000'}
              />
            </mesh>

            <mesh position={[0, 0, 0.014]}>
              <planeGeometry args={[0.35, 0.59]} />
              <meshBasicMaterial color={isSelected ? '#241008' : '#160808'} />
            </mesh>

            <mesh position={[0, 0.22, 0.015]}>
              <ringGeometry args={[0.045, 0.07, 20]} />
              <meshBasicMaterial color={isSelected ? '#aa3300' : '#662100'} />
            </mesh>

            <Text
              position={[0, -0.26, 0.026]}
              fontSize={0.04}
              maxWidth={0.28}
              color={isSelected ? '#ffddaa' : '#ff8888'}
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

export function RitualChamberScene() {
  const [selected, setSelected] = useState<CardData | null>(null)

  const handleSelect = (card: CardData) => {
    playRitualSting()
    setSelected(card)
  }

  return (
    <group>
      <TempleFloor />
      <RearShrine />
      <Pillar x={-2.1} />
      <Pillar x={2.1} />
      <CeilingCrown />
      <Embers />
      <Altar selectedCard={selected} />
      <CardArc selectedId={selected?.id ?? null} onSelect={handleSelect} />

      <Text
        position={[0, 3.05, -2.55]}
        fontSize={0.12}
        color="#ff5d33"
        anchorX="center"
        anchorY="middle"
      >
        DO WHAT THOU WILT
      </Text>

      <Text
        position={[0, 2.78, -2.58]}
        fontSize={0.08}
        color="#d1714a"
        anchorX="center"
        anchorY="middle"
      >
        GRIMOIRE XR // TEMPLE CHAMBER
      </Text>
    </group>
  )
}
