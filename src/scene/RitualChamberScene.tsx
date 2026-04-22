import { useMemo, useState } from 'react'
import { Text } from '@react-three/drei'

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

function Room() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshLambertMaterial color="#0a0000" />
      </mesh>

      <mesh position={[0, 3.5, 0]}>
        <torusGeometry args={[3, 0.05, 16, 64]} />
        <meshBasicMaterial color="#550000" />
      </mesh>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.2, 48]} />
        <meshBasicMaterial color="#220000" />
      </mesh>
    </>
  )
}

function Altar({ selectedCard }: { selectedCard: CardData | null }) {
  return (
    <group position={[0, 0, -1.0]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#330a0a" />
      </mesh>

      <mesh position={[0, 0.913, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.34, 48]} />
        <meshBasicMaterial color={selectedCard ? '#aa3300' : '#552211'} />
      </mesh>

      {selectedCard ? (
        <>
          <group position={[0, 0.935, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.52, 0.86, 0.03]} />
              <meshStandardMaterial color="#3a1200" emissive="#220600" />
            </mesh>

            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.74]} />
              <meshBasicMaterial color="#1c0904" />
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
            position={[0, 1.2, 0]}
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
          position={[0, 1.2, 0]}
          fontSize={0.1}
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
    const radius = 2.0

    return CARD_NAMES.map((card, index) => {
      const t = -0.8 + (index / (CARD_NAMES.length - 1)) * 1.6
      const x = Math.sin(t) * radius
      const z = -1.8 - Math.cos(t) * radius * 0.4
      const y = 1.22
      const rotY = -t * 0.8

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
            scale={isHovered ? 1.05 : 1}
          >
            <mesh>
              <boxGeometry args={[0.4, 0.7, 0.02]} />
              <meshStandardMaterial
                color={isSelected ? '#3a1200' : '#120606'}
                emissive={isHovered ? '#441100' : isSelected ? '#220600' : '#000000'}
              />
            </mesh>

            <mesh position={[0, 0, 0.011]}>
              <planeGeometry args={[0.34, 0.58]} />
              <meshBasicMaterial color={isSelected ? '#241008' : '#170909'} />
            </mesh>

            <Text
              position={[0, -0.25, 0.02]}
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
      <Room />
      <Altar selectedCard={selected} />
      <CardArc selectedId={selected?.id ?? null} onSelect={handleSelect} />

      <Text
        position={[0, 2.4, -1.6]}
        fontSize={0.13}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        GRIMOIRE XR // CHAMBER ALPHA
      </Text>
    </group>
  )
}
