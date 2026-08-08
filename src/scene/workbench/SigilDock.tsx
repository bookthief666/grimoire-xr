import * as THREE from 'three'
import { useState } from 'react'
import { Text } from '@react-three/drei'
import { FloatingMenuButton } from './WorkbenchControls'
import { TABLE_Y, formatArchiveTime } from './shared'
import type { WorkbenchMode } from './shared'

function FloatingSigilButton({
  sigil,
  label,
  x,
  y = TABLE_Y + 0.42,
  z = 0.92,
  active = false,
  disabled = false,
  danger = false,
  onClick,
}: {
  sigil: string
  label: string
  x: number
  y?: number
  z?: number
  active?: boolean
  disabled?: boolean
  danger?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const armed = !disabled && (hovered || active)
  const accent = danger ? '#ff3d5a' : active ? '#f8f3df' : '#d8e8ff'
  const plaque = danger ? '#210609' : '#05070b'
  const glyphColor = disabled ? '#5e5048' : '#f8f3df'

  const trigger = () => {
    if (!disabled) onClick()
  }

  return (
    <group
      position={[x, y, z]}
      scale={armed ? 1.055 : 1}
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

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        trigger()
      }}
    >
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[0.38, 0.38]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.24, 0.128]} />
        <meshBasicMaterial
          color={plaque}
          transparent
          opacity={disabled ? 0.18 : armed ? 0.74 : 0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.074, 0.01]}>
        <planeGeometry args={[0.29, 0.008]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.54 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -0.074, 0.01]}>
        <planeGeometry args={[0.23, 0.006]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.06 : armed ? 0.34 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-0.148, 0, 0.012]}>
        <planeGeometry args={[0.01, 0.12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.46 : 0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.148, 0, 0.012]}>
        <planeGeometry args={[0.01, 0.12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.46 : 0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.34, 0.19]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.012 : armed ? 0.105 : 0.032}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.004, 0.045]}
        fontSize={0.076}
        color={glyphColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={disabled ? 0.42 : 0.95}
        maxWidth={0.18}
      >
        {sigil}
      </Text>

      {armed ? (
        <Text
          position={[0, -0.138, 0.044]}
          fontSize={0.018}
          color={accent}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.72}
          maxWidth={0.42}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}
    </group>
  )
}


export function FloatingArchiveMenu({
  hasSavedRitual,
  lastSavedAt,
  archiveMessage,
  onSaveRitual,
  onLoadArchive,
  onClearArchive,
}: {
  hasSavedRitual: boolean
  lastSavedAt: string | null
  archiveMessage: string | null
  onSaveRitual: () => boolean
  onLoadArchive: () => boolean
  onClearArchive: () => void
}) {
  return (
    <group position={[-1.05, 0.98, 0.08]} scale={0.98}>
      <mesh>
        <planeGeometry args={[1.48, 1.02]} />
        <meshStandardMaterial
          color="#090404"
          emissive="#1d0907"
          emissiveIntensity={0.36}
          transparent
          opacity={0.9}
          roughness={0.32}
          metalness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.62, 1.15]} />
        <meshBasicMaterial
          color={hasSavedRitual ? '#8a35ff' : '#b8860b'}
          transparent
          opacity={hasSavedRitual ? 0.12 : 0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.39, 0.05]}
        fontSize={0.045}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.1}
      >
        RITUAL ARCHIVE
      </Text>

      <Text
        position={[0, 0.26, 0.05]}
        fontSize={0.028}
        color={hasSavedRitual ? '#d9b5ff' : '#9f744b'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.18}
      >
        {hasSavedRitual ? 'LOCAL MEMORY SEALED' : 'NO RITUAL SEALED'}
      </Text>

      <Text
        position={[0, 0.13, 0.05]}
        fontSize={0.026}
        color="#bfa788"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.18}
      >
        {formatArchiveTime(lastSavedAt)}
      </Text>

      <FloatingMenuButton
        label="SEAL CURRENT"
        x={-0.42}
        y={-0.08}
        width={0.5}
        onClick={() => {
          onSaveRitual()
        }}
      />

      <FloatingMenuButton
        label="LOAD LAST"
        x={0.18}
        y={-0.08}
        width={0.5}
        disabled={!hasSavedRitual}
        onClick={() => {
          onLoadArchive()
        }}
      />

      <FloatingMenuButton
        label="CLEAR SEAL"
        x={-0.12}
        y={-0.31}
        width={0.62}
        disabled={!hasSavedRitual}
        onClick={onClearArchive}
      />

      <Text
        position={[0, -0.48, 0.05]}
        fontSize={0.026}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {archiveMessage ?? 'Deck, selection, and ritual configuration persist locally.'}
      </Text>
    </group>
  )
}

export function FloatingSigilDock({
  menuMode,
  oracleLoading,
  canConsult,
  hasOracleReading,
  hasSavedRitual,
  onToggleForge,
  onToggleSpread,
  onToggleArchive,
  onConsultOracle,
  onClearOracle,
  onReset,
}: {
  menuMode: WorkbenchMode
  oracleLoading: boolean
  canConsult: boolean
  hasOracleReading: boolean
  hasSavedRitual: boolean
  onToggleForge: () => void
  onToggleSpread: () => void
  onToggleArchive: () => void
  onConsultOracle: () => void
  onClearOracle: () => void
  onReset: () => void
}) {
  const sideDock = menuMode === 'spread' || menuMode === 'forge' || menuMode === 'archive'
  const spreadDockDrop = menuMode === 'spread' ? 0.46 : 0

  const dockPlanePosition: [number, number, number] = sideDock
    ? [1.54, TABLE_Y + 0.2 - spreadDockDrop, 0.22]
    : [0, TABLE_Y + 0.42, 0.94]

  const dockPlaneSize: [number, number] = sideDock ? [0.42, 2.12] : [2.38, 0.34]

  const sigilPosition = (
    normalX: number,
    sideIndex: number,
  ): { x: number; y: number; z: number } => {
    if (!sideDock) {
      return { x: normalX, y: TABLE_Y + 0.42, z: 0.92 }
    }

    return {
      x: 1.54,
      y: TABLE_Y + 0.82 - spreadDockDrop - sideIndex * 0.26,
      z: 0.22,
    }
  }

  const config = sigilPosition(-0.78, 0)
  const spread = sigilPosition(-0.47, 1)
  const oracle = sigilPosition(-0.16, 2)
  const archive = sigilPosition(0.16, 3)
  const clear = sigilPosition(0.47, 4)
  const reset = sigilPosition(0.78, 5)

  return (
    <group>
      <mesh position={dockPlanePosition} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={dockPlaneSize} />
        <meshBasicMaterial
          color="#050202"
          transparent
          opacity={sideDock ? 0.12 : 0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <FloatingSigilButton
        sigil="✶"
        label={menuMode === 'forge' ? 'Seal Forge' : 'Configure Forge'}
        x={config.x}
        y={config.y}
        z={config.z}
        active={menuMode === 'forge'}
        onClick={onToggleForge}
      />

      {menuMode !== 'forge' ? (
        <>
          <FloatingSigilButton
            sigil="⌬"
            label={menuMode === 'spread' ? 'Seal Spread Field' : 'Reveal Spread Field'}
            x={spread.x}
            y={spread.y}
            z={spread.z}
            active={menuMode === 'spread'}
            onClick={onToggleSpread}
          />

          <FloatingSigilButton
            sigil={oracleLoading ? '…' : '☉'}
            label={oracleLoading ? 'Oracle Awakening' : 'Invoke Oracle'}
            x={oracle.x}
            y={oracle.y}
            z={oracle.z}
            active={oracleLoading}
            disabled={!canConsult}
            onClick={onConsultOracle}
          />

          <FloatingSigilButton
            sigil={hasSavedRitual ? '◈' : '◇'}
            label={menuMode === 'archive' ? 'Seal Archive Tablet' : 'Open Archive Tablet'}
            x={archive.x}
            y={archive.y}
            z={archive.z}
            active={menuMode === 'archive' || hasSavedRitual}
            onClick={onToggleArchive}
          />

          <FloatingSigilButton
            sigil="✕"
            label="Clear Oracle Tablet"
            x={clear.x}
            y={clear.y}
            z={clear.z}
            disabled={!hasOracleReading}
            onClick={onClearOracle}
          />

          <FloatingSigilButton
            sigil="↺"
            label="Banish Ritual"
            x={reset.x}
            y={reset.y}
            z={reset.z}
            danger
            onClick={onReset}
          />
        </>
      ) : null}
    </group>
  )
}
