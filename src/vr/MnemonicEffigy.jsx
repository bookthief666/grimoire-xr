import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
} from 'three';

const FAMILY_COLORS = Object.freeze({
  classical: '#f0c36a',
  esoteric: '#ff2a55',
  ancient: '#c9923f',
  modern: '#38e6d1',
  surreal: '#b072ff',
  'east-asian': '#f4ead5',
  experimental: '#ff315f',
  uncategorized: '#d8c486',
});

const ATMOSPHERE_COLORS = Object.freeze({
  adaptive: '#38e6d1',
  vivid: '#ff315f',
  balanced: '#f0c36a',
  veiled: '#8e73b8',
  off: '#776d65',
});

const createRandom = seed => {
  let value = (Number(seed) || 1) >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
};

const buildLineGeometry = parameters => {
  const random = createRandom(parameters.seed);
  const positions = [];
  const colors = [];
  const primary = new Color(FAMILY_COLORS[parameters.aestheticFamilyId] || FAMILY_COLORS.uncategorized);
  const secondary = new Color(ATMOSPHERE_COLORS[parameters.atmosphereMode] || ATMOSPHERE_COLORS.adaptive);
  const addSegment = (start, end, color = primary) => {
    positions.push(...start, ...end);
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  };

  const vertices = Array.from({ length: parameters.lineCount }, (_, index) => {
    const angle = parameters.phase + (index / parameters.lineCount) * Math.PI * 2;
    const radius = 0.48 + random() * 0.42;
    return [
      Math.cos(angle) * radius * parameters.axisScale[0] + parameters.asymmetry * Math.sin(angle * 3),
      (random() - 0.5) * 0.92 * parameters.axisScale[1],
      Math.sin(angle) * radius * parameters.axisScale[2],
    ];
  });
  vertices.forEach((vertex, index) => {
    const skip = 2 + Math.floor(random() * Math.max(2, parameters.lineCount - 3));
    addSegment(vertex, vertices[(index + skip) % vertices.length], index % 3 ? primary : secondary);
  });

  const ringCount = Math.min(4, 1 + parameters.inscriptionLayers);
  for (let ring = 0; ring < ringCount; ring += 1) {
    const segments = 28;
    const radius = 0.72 + ring * 0.13;
    for (let index = 0; index < segments; index += 1) {
      const startAngle = (index / segments) * Math.PI * 2;
      const endAngle = ((index + 1) / segments) * Math.PI * 2;
      const tilt = parameters.orbitInclination + (ring - 1) * 0.18;
      const point = angle => [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.sin(tilt),
        Math.sin(angle) * radius * Math.cos(tilt),
      ];
      addSegment(point(startAngle), point(endAngle), ring % 2 ? secondary : primary);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
};

export default function MnemonicEffigy({ parameters, active = false, busy = false }) {
  const root = useRef();
  const core = useRef();
  const inscriptions = useRef();
  const dummy = useMemo(() => new Object3D(), []);
  const lineGeometry = useMemo(() => buildLineGeometry(parameters), [parameters]);
  const familyColor = FAMILY_COLORS[parameters.aestheticFamilyId] || FAMILY_COLORS.uncategorized;
  const atmosphereColor = ATMOSPHERE_COLORS[parameters.atmosphereMode] || ATMOSPHERE_COLORS.adaptive;

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  useEffect(() => {
    if (!inscriptions.current) return;
    const total = parameters.inscriptionLayers * 7;
    for (let index = 0; index < total; index += 1) {
      const layer = Math.floor(index / 7);
      const angle = (index % 7) / 7 * Math.PI * 2 + parameters.phase + layer * 0.22;
      const radius = 0.9 + layer * 0.12;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle * 2) * 0.08, Math.sin(angle) * radius);
      dummy.rotation.set(parameters.orbitInclination, -angle, angle * 0.35);
      dummy.scale.set(0.8 + layer * 0.15, 1, 1);
      dummy.updateMatrix();
      inscriptions.current.setMatrixAt(index, dummy.matrix);
      inscriptions.current.setColorAt(index, new Color(index % 2 ? atmosphereColor : familyColor));
    }
    inscriptions.current.instanceMatrix.needsUpdate = true;
    if (inscriptions.current.instanceColor) inscriptions.current.instanceColor.needsUpdate = true;
  }, [atmosphereColor, dummy, familyColor, parameters]);

  useFrame((state, delta) => {
    if (!root.current || !core.current) return;
    const time = state.clock.elapsedTime;
    root.current.rotation.y += delta * (busy ? 0.72 : active ? 0.24 : 0.1);
    root.current.rotation.z = Math.sin(time * 0.18 + parameters.phase) * 0.08;
    const pulse = 1 + Math.sin(time * (1.05 + parameters.erosLevel * 0.22) + parameters.phase)
      * parameters.pulseAmplitude;
    core.current.scale.set(
      parameters.axisScale[0] * pulse,
      parameters.axisScale[1] * pulse,
      parameters.axisScale[2] * pulse,
    );
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      Math.sin(time * 0.72 + parameters.phase) * 0.06,
      4,
      delta,
    );
  });

  return (
    <group ref={root}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={active ? 0.95 : 0.72}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <mesh ref={core} rotation={[parameters.orbitInclination, parameters.phase, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.62, parameters.coreSides, 1, false]} />
        <meshStandardMaterial
          color={familyColor}
          emissive={familyColor}
          emissiveIntensity={busy ? 2.4 : active ? 1.5 : 0.8}
          transparent
          opacity={0.7}
          metalness={0.38}
          roughness={0.35}
          flatShading
        />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[0.48, 12, 8]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={busy ? 0.12 : 0.055}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh
        ref={inscriptions}
        args={[null, null, Math.max(7, parameters.inscriptionLayers * 7)]}
      >
        <boxGeometry args={[0.08, 0.018, 0.025]} />
        <meshBasicMaterial vertexColors transparent opacity={0.82} />
      </instancedMesh>
    </group>
  );
}
