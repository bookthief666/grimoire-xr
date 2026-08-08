import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { GrimoireCard } from '../../types/grimoire'
import { shortText } from './shared'

export function ImagePipelineStatus({
  cards,
  selectedCardId,
  archiveMessage,
}: {
  cards: GrimoireCard[]
  selectedCardId: number | null
  archiveMessage: string | null
}) {
  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ??
    cards.find((card) => card.imageStatus === 'generating') ??
    cards.find((card) => card.imageStatus === 'error') ??
    cards.find((card) => card.imageStatus === 'ready') ??
    cards[0] ??
    null

  const readyCount = cards.filter((card) => card.imageStatus === 'ready').length
  const generatingCount = cards.filter((card) => card.imageStatus === 'generating').length
  const errorCount = cards.filter((card) => card.imageStatus === 'error').length

  const status = selectedCard?.imageStatus ?? 'none'
  const hasImage = Boolean(selectedCard?.imageUrl)
  const hasPrompt = Boolean(selectedCard?.artPrompt)

  const statusColor =
    status === 'ready'
      ? '#9fffb7'
      : status === 'generating'
        ? '#ffd18a'
        : status === 'error'
          ? '#ff7a7a'
          : '#bfa788'

  const engineLine = archiveMessage
    ? shortText(archiveMessage, 58)
    : 'Awaiting image operation.'

  return (
    <group position={[1.16, 1.04, 0.14]} scale={0.82}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[1.56, 0.86]} />
        <meshStandardMaterial
          color="#080404"
          emissive="#1f0a05"
          emissiveIntensity={0.32}
          transparent
          opacity={0.86}
          roughness={0.36}
          metalness={0.46}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[1.66, 0.96]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.34, 0.04]}
        fontSize={0.042}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.36}
      >
        IMAGE PIPELINE
      </Text>

      <Text
        position={[-0.68, 0.20, 0.04]}
        fontSize={0.031}
        color="#d8bf9b"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`CARD: ${selectedCard ? shortText(selectedCard.name, 34) : 'NONE'}`}
      </Text>

      <Text
        position={[-0.68, 0.08, 0.04]}
        fontSize={0.031}
        color={statusColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`STATUS: ${status.toUpperCase()}${hasImage ? ' / IMAGE URL' : ''}`}
      </Text>

      <Text
        position={[-0.68, -0.04, 0.04]}
        fontSize={0.031}
        color={hasPrompt ? '#9fffb7' : '#ff7a7a'}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`ART SEED: ${hasPrompt ? 'YES' : 'NO'}`}
      </Text>

      <Text
        position={[-0.68, -0.16, 0.04]}
        fontSize={0.031}
        color="#d8bf9b"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`READY: ${readyCount}/${cards.length}   GENERATING: ${generatingCount}   ERRORS: ${errorCount}`}
      </Text>

      <Text
        position={[-0.68, -0.31, 0.04]}
        fontSize={0.027}
        color="#bfa788"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.34}
      >
        {`ENGINE: ${engineLine}`}
      </Text>
    </group>
  )
}
