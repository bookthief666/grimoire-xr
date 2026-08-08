import * as THREE from 'three'
import { useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { TableBar } from './AltarHardware'
import { TABLE_Y } from './shared'

export function SpreadMandala({
  active,
  occupied,
}: {
  active: boolean
  occupied: number
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)
  const lensRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const charge = Math.min(1, occupied / 5)

    if (outerRef.current) {
      outerRef.current.opacity = active
        ? 0.18 + Math.sin(t * 0.8) * 0.045 + charge * 0.08
        : 0.045
    }

    if (innerRef.current) {
      innerRef.current.opacity = active
        ? 0.24 + Math.sin(t * 1.3 + 0.8) * 0.055 + charge * 0.08
        : 0.06
    }

    if (lensRef.current) {
      lensRef.current.opacity = active
        ? 0.13 + Math.sin(t * 1.8) * 0.035 + charge * 0.06
        : 0.035
    }
  })

  if (!active) return null

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.021, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.96, 0.972, 96]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#8a35ff"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.024, 0.02]} rotation={[-Math.PI / 2, 0, Math.PI / 7]}>
        <ringGeometry args={[0.55, 0.562, 80]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#ffcf7c"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.018, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 72]} />
        <meshBasicMaterial
          ref={lensRef}
          color="#210428"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TableBar a={[-0.82, -0.44]} b={[0.82, -0.44]} color="#8a35ff" opacity={0.22} width={0.01} />
      <TableBar a={[-0.82, 0.44]} b={[0.82, 0.44]} color="#8a35ff" opacity={0.22} width={0.01} />
      <TableBar a={[-0.82, -0.44]} b={[0, 0.62]} color="#ffcf7c" opacity={0.26} width={0.012} />
      <TableBar a={[0.82, -0.44]} b={[0, 0.62]} color="#ffcf7c" opacity={0.26} width={0.012} />
      <TableBar a={[0, -0.72]} b={[0, 0.68]} color="#ff3d5a" opacity={0.2} width={0.01} yOffset={0.026} />

      {[
        [-0.82, -0.44, '☽'],
        [0.82, -0.44, '☉'],
        [-0.82, 0.44, '♀'],
        [0.82, 0.44, '♄'],
        [0, 0.68, '✶'],
        [0, -0.72, '☿'],
      ].map(([x, z, glyph], index) => (
        <group key={`${glyph}-${index}`} position={[Number(x), TABLE_Y + 0.046, Number(z)]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.045, 0.058, 18]} />
            <meshBasicMaterial
              color={index < occupied ? '#ffd18a' : '#7b5536'}
              transparent
              opacity={index < occupied ? 0.72 : 0.26}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Text
            position={[0, 0.024, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.038}
            color={index < occupied ? '#fff0c0' : '#7b5536'}
            anchorX="center"
            anchorY="middle"
          >
            {String(glyph)}
          </Text>
        </group>
      ))}

      <Text
        position={[0, TABLE_Y + 0.054, -0.94]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color="#9f744b"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        SPREAD FIELD // CARD CURRENT ACTIVE
      </Text>
    </group>
  )
}

export function SpreadSlot({
  x,
  z,
  label,
  active,
}: {
  x: number
  z: number
  label: string
  active: boolean
}) {
  const fieldRef = useRef<THREE.MeshBasicMaterial>(null)
  const rimRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (fieldRef.current) {
      fieldRef.current.opacity = active
        ? 0.18 + Math.sin(t * 1.25 + x * 2.0 + z) * 0.035
        : 0.045 + Math.sin(t * 0.6 + x) * 0.012
    }

    if (rimRef.current) {
      rimRef.current.opacity = active
        ? 0.68 + Math.sin(t * 1.55 + z) * 0.1
        : 0.16
    }
  })

  const cornerColor = active ? '#ffcf7c' : '#7b5536'

  return (
    <group>
      <mesh position={[x, TABLE_Y + 0.024, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.58]} />
        <meshBasicMaterial
          ref={fieldRef}
          color={active ? '#1a0b08' : '#050303'}
          transparent
          opacity={0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.031, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.155, 0.166, 32]} />
        <meshBasicMaterial
          ref={rimRef}
          color={active ? '#ffcf7c' : '#8a4b18'}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.033, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.235, 0.242, 4]} />
        <meshBasicMaterial
          color={active ? '#9a6bff' : '#4f2a60'}
          transparent
          opacity={active ? 0.32 : 0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sz], index) => (
        <group key={index} position={[x + sx * 0.17, TABLE_Y + 0.048, z + sz * 0.255]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.075, 0.009]} />
            <meshBasicMaterial
              color={cornerColor}
              transparent
              opacity={active ? 0.72 : 0.28}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[0.075, 0.009]} />
            <meshBasicMaterial
              color={cornerColor}
              transparent
              opacity={active ? 0.72 : 0.28}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      <Text
        position={[x, TABLE_Y + 0.046, z + 0.42]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.03}
        color={active ? '#ffd18a' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.44}
      >
        {label}
      </Text>
    </group>
  )
}
