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
    </>
  )
}

function Altar({ selectedName }: { selectedName: string | null }) {
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

      <Text
        position={[0, 1.2, 0]}
        fontSize={0.1}
        color="#ffcc88"
        anchorX="center"
        anchorY="middle"
      >
        {selectedName ?? 'Awaiting Selection'}
      </Text>
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
      const z = -1.5 - Math.cos(t) * radius * 0.4
      const y = 1.2
      const rotY = -t * 0.8
      return { ...card, position: [x, y, z] as [number, number, number], rotY }
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
                emissive={isHovered ? '#441100' : '#000000'}
              />
            </mesh>

            <Text
              position={[0, -0.25, 0.02]}
              fontSize={0.04}
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

  return (
    <group>
      <Room />
      <Altar selectedName={selected?.name ?? null} />
      <CardArc selectedId={selected?.id ?? null} onSelect={setSelected} />

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
