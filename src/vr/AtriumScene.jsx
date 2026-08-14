import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Line, OrbitControls, Stars, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Matrix4,
  MathUtils,
  NearestFilter,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import vt323Font from '@fontsource/vt323/files/vt323-latin-400-normal.woff?url';
import pixelFont from '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff?url';
import {
  PLANETARY_STATIONS,
  VR_PALETTE,
  buildStationPose,
  buildSealPoints,
  truncateForPanel,
} from './vrContent.js';
import SpatialRitualComposer from './SpatialRitualComposer.jsx';
import WristGrimoire from './WristGrimoire.jsx';
import MnemonicEffigy from './MnemonicEffigy.jsx';
import { buildEffigyParameters } from './spatialRitualModel.js';

const pulsePointer = (event, intensity = 0.32, milliseconds = 32) => {
  const gamepad = event?.pointerState?.inputSource?.gamepad
    || event?.nativeEvent?.inputSource?.gamepad;
  const actuator = gamepad?.hapticActuators?.[0];
  if (actuator?.pulse) {
    void actuator.pulse(intensity, milliseconds)?.catch?.(() => {});
    return;
  }
  if (gamepad?.vibrationActuator?.playEffect) {
    void gamepad.vibrationActuator.playEffect('dual-rumble', {
      duration: milliseconds,
      strongMagnitude: intensity,
      weakMagnitude: intensity * 0.6,
    })?.catch?.(() => {});
  }
};

const SacredText = memo(({ children, pixel = false, ...props }) => (
  <Text
    font={pixel ? pixelFont : vt323Font}
    color={VR_PALETTE.bone}
    material-side={DoubleSide}
    {...props}
  >
    {children}
  </Text>
));
SacredText.displayName = 'SacredText';

const mergeBoxes = specifications => {
  const geometries = specifications.map(({ size, position }) => {
    const geometry = new BoxGeometry(...size);
    geometry.translate(...position);
    return geometry;
  });
  const merged = mergeGeometries(geometries, false);
  geometries.forEach(geometry => geometry.dispose());
  return merged;
};

// One draw call per portal gives the courts a chunky 8/16-bit silhouette
// without spending the Quest frame budget on dozens of decorative blocks.
const PIXEL_PORTAL_GEOMETRY = mergeBoxes([
  { size: [2.42, 0.2, 0.72], position: [0, 0.1, 0] },
  { size: [0.34, 2.26, 0.38], position: [-0.86, 1.23, 0] },
  { size: [0.34, 2.26, 0.38], position: [0.86, 1.23, 0] },
  { size: [0.5, 0.2, 0.5], position: [-0.86, 2.37, 0] },
  { size: [0.5, 0.2, 0.5], position: [0.86, 2.37, 0] },
  { size: [2.3, 0.3, 0.42], position: [0, 2.58, 0] },
  { size: [1.68, 0.2, 0.36], position: [0, 2.83, 0] },
  { size: [1.06, 0.2, 0.32], position: [0, 3.04, 0] },
  { size: [0.42, 0.2, 0.28], position: [0, 3.25, 0] },
]);

const PIXEL_PORTAL_TRIM_GEOMETRY = mergeBoxes([
  { size: [0.075, 2.22, 0.045], position: [-0.86, 1.23, 0.215] },
  { size: [0.075, 2.22, 0.045], position: [0.86, 1.23, 0.215] },
  { size: [2.28, 0.075, 0.045], position: [0, 2.58, 0.235] },
  { size: [1.66, 0.055, 0.04], position: [0, 2.83, 0.205] },
  { size: [1.04, 0.055, 0.04], position: [0, 3.04, 0.185] },
]);

const PIXEL_PORTAL_PANEL_GEOMETRY = new BoxGeometry(1.42, 1.58, 0.04);
PIXEL_PORTAL_PANEL_GEOMETRY.translate(0, 1.43, 0.02);

const TEMPLE_STONE_GEOMETRY = mergeBoxes([
  { size: [13.2, 4.8, 0.46], position: [0, 2.26, -6.45] },
  { size: [0.5, 4.5, 8.7], position: [-6.34, 2.12, -2.2] },
  { size: [0.5, 4.5, 8.7], position: [6.34, 2.12, -2.2] },
  { size: [13.1, 0.5, 0.84], position: [0, 4.62, -6.22] },
  { size: [0.74, 4.25, 0.74], position: [-5.24, 2.08, -5.93] },
  { size: [0.74, 4.25, 0.74], position: [5.24, 2.08, -5.93] },
  { size: [0.62, 3.65, 0.62], position: [-5.86, 1.8, 0.85] },
  { size: [0.62, 3.65, 0.62], position: [5.86, 1.8, 0.85] },
]);

const TEMPLE_BRASS_GEOMETRY = mergeBoxes([
  { size: [12.72, 0.12, 0.14], position: [0, 0.38, -6.18] },
  { size: [12.72, 0.12, 0.14], position: [0, 4.12, -6.18] },
  { size: [0.14, 3.78, 0.14], position: [-5.74, 2.24, -6.17] },
  { size: [0.14, 3.78, 0.14], position: [5.74, 2.24, -6.17] },
  { size: [0.12, 0.08, 9.2], position: [-5.76, 0.03, -1.72] },
  { size: [0.12, 0.08, 9.2], position: [5.76, 0.03, -1.72] },
]);

const PIXEL_GUARDIAN_GEOMETRY = mergeBoxes([
  { size: [0.9, 0.2, 0.78], position: [0, 0.1, 0] },
  { size: [0.22, 0.82, 0.28], position: [-0.2, 0.58, 0] },
  { size: [0.22, 0.82, 0.28], position: [0.2, 0.58, 0] },
  { size: [0.64, 0.9, 0.38], position: [0, 1.35, 0] },
  { size: [0.18, 0.88, 0.22], position: [-0.43, 1.34, 0] },
  { size: [0.18, 0.88, 0.22], position: [0.43, 1.34, 0] },
  { size: [0.44, 0.44, 0.44], position: [0, 2.04, 0] },
  { size: [0.68, 0.16, 0.5], position: [0, 2.32, 0] },
  { size: [0.16, 0.26, 0.16], position: [-0.25, 2.5, 0] },
  { size: [0.16, 0.26, 0.16], position: [0.25, 2.5, 0] },
]);

const createPixelFloorTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#050203';
  context.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      context.fillStyle = (x + y) % 2 ? '#0a0406' : '#110609';
      context.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
    }
  }
  context.strokeStyle = '#260810';
  context.lineWidth = 2;
  context.strokeRect(1, 1, 126, 126);
  context.strokeStyle = '#51101d';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(64, 0);
  context.lineTo(128, 64);
  context.lineTo(64, 128);
  context.lineTo(0, 64);
  context.closePath();
  context.stroke();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
};

const GlowRing = ({ color, radius, tube = 0.018, opacity = 0.75, ...props }) => (
  <mesh {...props}>
    <torusGeometry args={[radius, tube, 6, 64]} />
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      blending={AdditiveBlending}
      depthWrite={false}
    />
  </mesh>
);

const buildHeptagram = (radius, step, offset = 0) => {
  const vertices = Array.from({ length: 7 }, (_, index) => {
    const angle = offset + (index / 7) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });
  const points = [];
  let index = 0;
  for (let turn = 0; turn < 7; turn += 1) {
    points.push(vertices[index]);
    index = (index + step) % 7;
  }
  points.push(points[0]);
  return points;
};

const BABALON_HEPTAGRAM = buildHeptagram(1.34, 3, Math.PI / 2);
const BABALON_COUNTERSTAR = buildHeptagram(0.68, 2, Math.PI / 2);
const BABALON_ELECTRODES = Array.from({ length: 7 }, (_, index) => {
  const angle = Math.PI / 2 + (index / 7) * Math.PI * 2;
  return [Math.cos(angle) * 1.51, Math.sin(angle) * 1.51, 0.02];
});

const createElectricWireGeometry = () => {
  const positions = [];
  const colors = [];
  const appendSegment = (start, end, color) => {
    positions.push(...start, ...end);
    const rgb = new Color(color);
    colors.push(rgb.r, rgb.g, rgb.b, rgb.r, rgb.g, rgb.b);
  };
  const appendPath = (path, offset, color) => {
    for (let index = 0; index < path.length - 1; index += 1) {
      appendSegment(
        [path[index][0] + offset[0], path[index][1] + offset[1], offset[2]],
        [path[index + 1][0] + offset[0], path[index + 1][1] + offset[1], offset[2]],
        color,
      );
    }
  };
  appendPath(BABALON_HEPTAGRAM, [0.035, 0.018, -0.012], VR_PALETTE.magenta);
  appendPath(BABALON_HEPTAGRAM, [-0.035, -0.018, 0.012], VR_PALETTE.teal);
  for (let index = 0; index < 56; index += 1) {
    const start = (index / 56) * Math.PI * 2;
    const end = ((index + 1) / 56) * Math.PI * 2;
    appendSegment(
      [Math.cos(start) * 1.65, Math.sin(start) * 1.65, 0],
      [Math.cos(end) * 1.65, Math.sin(end) * 1.65, 0],
      index % 7 === 0 ? VR_PALETTE.bone : VR_PALETTE.blood,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
};

const ELECTRIC_BABALON_WIRE = createElectricWireGeometry();

const createSeededRandom = seed => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const ElectricBabalonCrown = ({ tier, busy, awakened, completedCount }) => {
  const root = useRef();
  const primary = useRef();
  const counter = useRef();
  const interference = useRef();
  const electrodes = useRef();
  const light = useRef();
  const strength = (awakened ? 0.88 : 0.68) + (completedCount / 7) * 0.22;

  useEffect(() => {
    if (!electrodes.current) return;
    const dummy = new Object3D();
    BABALON_ELECTRODES.forEach((position, index) => {
      dummy.position.set(...position);
      dummy.rotation.set(0, 0, (index / 7) * Math.PI * 2);
      dummy.scale.setScalar(index % 2 ? 0.82 : 1);
      dummy.updateMatrix();
      electrodes.current.setMatrixAt(index, dummy.matrix);
    });
    electrodes.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const surge = Math.max(0, Math.sin(time * 2.7) ** 18);
    const glitch = Math.sin(time * 19.3) > 0.94 ? Math.sin(time * 71) * 0.055 : 0;
    if (root.current) {
      root.current.position.y = 4.34 + Math.sin(time * 0.72) * 0.055;
      root.current.position.x = glitch * 0.22;
      root.current.scale.setScalar(strength);
    }
    if (primary.current) {
      primary.current.rotation.z += delta * (busy ? 0.72 : 0.2);
      primary.current.scale.setScalar(1 + surge * 0.085);
    }
    if (counter.current) {
      counter.current.rotation.z -= delta * (busy ? 1.18 : 0.38);
      counter.current.scale.setScalar(1 - surge * 0.04);
    }
    if (interference.current) {
      interference.current.position.x = glitch;
      interference.current.position.y = -glitch * 0.4;
      interference.current.rotation.z = Math.sin(time * 0.31) * 0.025;
    }
    if (electrodes.current) electrodes.current.rotation.z -= delta * 0.11;
    if (light.current) {
      light.current.intensity = (tier * 0.85 + (busy ? 2.8 : 0.8) + surge * 3.5) * strength;
    }
  });

  if (tier <= 0) return null;
  return (
    <group ref={root} position={[0, 4.34, -0.55]} rotation={[-Math.PI * 0.34, 0, 0]}>
      <group ref={primary}>
        <Line
          points={BABALON_HEPTAGRAM}
          color={VR_PALETTE.gold}
          lineWidth={tier >= 3 ? 3.8 : 2.7}
          transparent
          opacity={0.88}
        />
        <GlowRing color={VR_PALETTE.blood} radius={1.76} tube={0.025} opacity={0.36 + tier * 0.08} />
      </group>
      <group ref={counter}>
        <Line
          points={BABALON_COUNTERSTAR}
          color={VR_PALETTE.bone}
          lineWidth={tier >= 3 ? 2.5 : 1.8}
          transparent
          opacity={0.76}
        />
      </group>
      <lineSegments ref={interference} geometry={ELECTRIC_BABALON_WIRE}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={tier >= 3 ? 0.78 : 0.52}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      <instancedMesh ref={electrodes} args={[null, null, 7]}>
        <octahedronGeometry args={[0.085, 0]} />
        <meshBasicMaterial
          color={VR_PALETTE.bone}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
      <pointLight ref={light} position={[0, 0, 0.5]} color={VR_PALETTE.blood} intensity={2} distance={7} decay={2} />
    </group>
  );
};

const AstralWeather = ({ tier, busy }) => {
  const points = useRef();
  const material = useRef();
  const count = tier === 1 ? 72 : tier === 2 ? 132 : 216;
  const field = useMemo(() => {
    const random = createSeededRandom(0x93bab156 + count);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const palette = [
      VR_PALETTE.blood,
      VR_PALETTE.gold,
      VR_PALETTE.magenta,
      VR_PALETTE.teal,
      VR_PALETTE.bone,
    ].map(value => new Color(value));
    for (let index = 0; index < count; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.55 + random() * 5.15;
      const x = Math.cos(angle) * radius;
      positions[index * 3] = x;
      positions[index * 3 + 1] = 0.12 + random() * 4.45;
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.72 - 0.65;
      baseX[index] = x;
      speeds[index] = 0.09 + random() * 0.3;
      phases[index] = random() * Math.PI * 2;
      const color = palette[Math.floor(random() * palette.length)];
      color.toArray(colors, index * 3);
    }
    const geometry = new BufferGeometry();
    const position = new Float32BufferAttribute(positions, 3);
    position.setUsage(DynamicDrawUsage);
    geometry.setAttribute('position', position);
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return { geometry, baseX, speeds, phases };
  }, [count]);

  useEffect(() => () => field.geometry.dispose(), [field]);

  useFrame((state, delta) => {
    const attribute = field.geometry.getAttribute('position');
    const time = state.clock.elapsedTime;
    const speedScale = busy ? 2.15 : 1;
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      attribute.array[offset] = field.baseX[index] + Math.sin(time * 0.42 + field.phases[index]) * 0.11;
      attribute.array[offset + 1] += delta * field.speeds[index] * speedScale;
      if (attribute.array[offset + 1] > 4.68) attribute.array[offset + 1] = 0.08;
    }
    attribute.needsUpdate = true;
    if (points.current) points.current.rotation.y = Math.sin(time * 0.11) * 0.09;
    if (material.current) {
      material.current.opacity = 0.48 + tier * 0.1 + Math.sin(time * 1.4) * 0.055;
    }
  });

  return (
    <points ref={points} geometry={field.geometry} frustumCulled={false}>
      <pointsMaterial
        ref={material}
        vertexColors
        size={tier >= 3 ? 0.07 : 0.055}
        sizeAttenuation
        transparent
        opacity={0.65}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};

const GlitchFragments = ({ tier, busy }) => {
  const instances = useRef();
  const dummy = useMemo(() => new Object3D(), []);
  const lastTick = useRef(-1);
  const count = tier === 1 ? 6 : tier === 2 ? 14 : 24;
  const fragments = useMemo(() => {
    const random = createSeededRandom(0xbab00156 + count);
    return Array.from({ length: count }, (_, index) => {
      let x = -5.5 + random() * 11;
      if (Math.abs(x) < 2.15) x += x < 0 ? -2.1 : 2.1;
      return {
        x,
        y: 0.75 + random() * 3.45,
        z: -5.85 + random() * 6.4,
        width: 0.035 + random() * 0.14,
        height: 0.08 + random() * 0.48,
        phase: random() * Math.PI * 2,
        frequency: 3.5 + random() * 8,
        color: index % 4 === 0 ? VR_PALETTE.gold : index % 3 === 0 ? VR_PALETTE.teal : VR_PALETTE.blood,
      };
    });
  }, [count]);

  useEffect(() => {
    if (!instances.current) return;
    instances.current.instanceMatrix.setUsage(DynamicDrawUsage);
    fragments.forEach((fragment, index) => {
      instances.current.setColorAt(index, new Color(fragment.color));
    });
    if (instances.current.instanceColor) instances.current.instanceColor.needsUpdate = true;
  }, [fragments]);

  useFrame(state => {
    if (!instances.current) return;
    const time = state.clock.elapsedTime;
    const tick = Math.floor(time * (busy ? 18 : 9));
    if (tick === lastTick.current) return;
    lastTick.current = tick;
    fragments.forEach((fragment, index) => {
      const signal = Math.sin(time * fragment.frequency + fragment.phase);
      const visible = signal > (busy ? -0.05 : 0.42) ? 1 : 0.025;
      const jump = signal > 0.92 ? Math.sin(time * 67 + index) * 0.14 : 0;
      dummy.position.set(fragment.x + jump, fragment.y, fragment.z);
      dummy.rotation.set(0, index % 2 ? 0 : Math.PI / 2, index % 3 ? 0 : Math.PI / 2);
      dummy.scale.set(fragment.width * visible, fragment.height * visible, 0.024 * visible);
      dummy.updateMatrix();
      instances.current.setMatrixAt(index, dummy.matrix);
    });
    instances.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instances} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={tier >= 3 ? 0.76 : 0.56}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

const AltarVoltage = ({ tier, busy, awakened }) => {
  const beam = useRef();
  const material = useRef();
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (beam.current) {
      beam.current.rotation.y += delta * (busy ? 1.3 : 0.24);
      beam.current.scale.x = 1 + Math.sin(time * 2.4) * 0.18;
      beam.current.scale.z = 1 + Math.cos(time * 2.1) * 0.18;
    }
    if (material.current) {
      material.current.opacity = (awakened ? 0.055 : 0.022)
        + tier * 0.012
        + (busy ? 0.08 : Math.max(0, Math.sin(time * 2.7)) * 0.018);
    }
  });
  return (
    <mesh ref={beam} position={[0, 2.45, -0.03]}>
      <cylinderGeometry args={[0.045, 0.22, 3.4, 7, 1, true]} />
      <meshBasicMaterial
        ref={material}
        color={busy ? VR_PALETTE.bone : VR_PALETTE.blood}
        transparent
        opacity={0.08}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};

const PlanetaryArchitecture = ({ activeStationId, completedCourtIds }) => {
  const bodies = useRef();
  const trims = useRef();
  const panels = useRef();
  useEffect(() => {
    if (!bodies.current || !trims.current || !panels.current) return;
    const dummy = new Object3D();
    PLANETARY_STATIONS.forEach((station, index) => {
      const pose = buildStationPose(index);
      const selected = station.id === activeStationId;
      const completed = completedCourtIds.includes(station.id);
      const baseScale = 0.9 - (Math.abs(index - 3) / 3) * 0.08;
      dummy.position.set(...pose.position);
      dummy.rotation.set(...pose.rotation);
      dummy.scale.setScalar(baseScale);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(index, dummy.matrix);
      trims.current.setMatrixAt(index, dummy.matrix);
      panels.current.setMatrixAt(index, dummy.matrix);
      bodies.current.setColorAt(index, new Color(selected ? '#321019' : '#120608'));
      const trimColor = new Color(completed ? VR_PALETTE.gold : station.color);
      if (!selected && !completed) trimColor.multiplyScalar(0.58);
      trims.current.setColorAt(index, trimColor);
      panels.current.setColorAt(index, new Color('#020102'));
    });
    [bodies.current, trims.current, panels.current].forEach(mesh => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [activeStationId, completedCourtIds]);
  return (
    <group>
      <instancedMesh ref={bodies} args={[PIXEL_PORTAL_GEOMETRY, null, PLANETARY_STATIONS.length]}>
        <meshStandardMaterial vertexColors emissive={VR_PALETTE.blood} emissiveIntensity={0.025} metalness={0.34} roughness={0.76} flatShading />
      </instancedMesh>
      <instancedMesh ref={trims} args={[PIXEL_PORTAL_TRIM_GEOMETRY, null, PLANETARY_STATIONS.length]}>
        <meshBasicMaterial vertexColors />
      </instancedMesh>
      <instancedMesh ref={panels} args={[PIXEL_PORTAL_PANEL_GEOMETRY, null, PLANETARY_STATIONS.length]}>
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
};

const MnemonicSeal = ({ seed, color = VR_PALETTE.gold, scale = 1, active = false }) => {
  const group = useRef();
  const points = useMemo(() => buildSealPoints(seed), [seed]);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * (active ? 0.18 : 0.035);
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.3) * (active ? 0.035 : 0.012);
    group.current.scale.setScalar(scale * breath);
  });
  return (
    <group ref={group}>
      <GlowRing color={color} radius={0.98} opacity={active ? 0.9 : 0.48} />
      <GlowRing color={color} radius={0.76} tube={0.01} opacity={0.32} />
      <Line
        points={points}
        color={color}
        lineWidth={active ? 2.1 : 1.1}
        transparent
        opacity={active ? 0.95 : 0.56}
      />
      <mesh>
        <circleGeometry args={[1.12, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.045 : 0.018}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const PlanetaryGate = memo(({ station, index, selected, completed, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const group = useRef();
  const { position, rotation } = buildStationPose(index);
  const baseScale = 0.9 - (Math.abs(index - 3) / 3) * 0.08;

  useFrame((state, delta) => {
    if (!group.current) return;
    const target = baseScale * (selected ? 1.05 : hovered ? 1.025 : 1);
    const next = MathUtils.damp(group.current.scale.x, target, 7, delta);
    group.current.scale.setScalar(next);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.025;
  });

  const select = event => {
    event.stopPropagation();
    pulsePointer(event, selected ? 0.18 : 0.3, 28);
    onSelect(station.id);
  };

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
    >
      <SacredText
        position={[0, 2.04, 0.05]}
        fontSize={0.31}
        color={station.color}
        anchorX="center"
        anchorY="middle"
      >
        {station.glyph}
      </SacredText>
      <SacredText
        pixel
        position={[0, 1.49, 0.055]}
        fontSize={0.057}
        color={completed ? VR_PALETTE.gold : station.color}
        maxWidth={1.45}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {`${station.planet}\n${station.title}`}
      </SacredText>
      {selected && (
        <>
          <GlowRing
            color={station.color}
            radius={1.14}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.22, 0]}
            opacity={0.68}
          />
          <pointLight position={[0, 1.45, 0.7]} color={station.color} intensity={2.8} distance={3.1} decay={2} />
        </>
      )}
      {completed && (
        <group position={[0, 3.25, 0.16]}>
          <mesh>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial
              color={VR_PALETTE.gold}
              transparent
              opacity={0.82}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
      <mesh
        position={[0, 1.58, 0.22]}
        onPointerUp={select}
        onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        pointerEventsType={{ deny: 'grab' }}
      >
        <boxGeometry args={[2.65, 3.65, 0.9]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
});
PlanetaryGate.displayName = 'PlanetaryGate';

const RitualAltar = ({ subject, busy, awakened, invocationStale, completedCount, manifestationKey, composerOpen, onOpenComposer }) => {
  const orb = useRef();
  const rings = useRef();
  const flare = useRef(0);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (manifestationKey) flare.current = 1;
  }, [manifestationKey]);
  useFrame((state, delta) => {
    if (orb.current) {
      const lift = Math.sin(state.clock.elapsedTime * (busy ? 2.3 : 1.15)) * 0.07;
      orb.current.position.y = 1.38 + lift;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.7) * 0.045;
      orb.current.scale.setScalar(scale);
    }
    if (rings.current) {
      rings.current.rotation.y += delta * (busy ? 0.9 : 0.2);
      flare.current = MathUtils.damp(flare.current, 0, 2.8, delta);
      const flareScale = 1 + flare.current * 0.55;
      rings.current.scale.setScalar(flareScale);
    }
  });

  return (
    <group>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2.42, 0.36, 2.42]} />
        <meshStandardMaterial color={VR_PALETTE.stone} metalness={0.28} roughness={0.78} flatShading />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[1.92, 0.2, 1.92]} />
        <meshStandardMaterial color={VR_PALETTE.stoneLight} emissive={VR_PALETTE.blood} emissiveIntensity={0.08} metalness={0.35} roughness={0.68} flatShading />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.48, 0.18, 1.48]} />
        <meshStandardMaterial color="#080304" metalness={0.48} roughness={0.52} flatShading />
      </mesh>
      <mesh position={[0, 0.66, 0.72]}>
        <boxGeometry args={[1.5, 0.09, 0.08]} />
        <meshBasicMaterial color={awakened ? VR_PALETTE.gold : VR_PALETTE.blood} />
      </mesh>
      <GlowRing color={awakened ? VR_PALETTE.gold : VR_PALETTE.blood} radius={1.08} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.75, 0]} opacity={0.42} />
      <group ref={rings} position={[0, 1.38, 0]}>
        <GlowRing color={VR_PALETTE.blood} radius={0.66} rotation={[Math.PI / 2, 0, 0]} opacity={0.46} />
        <GlowRing color={VR_PALETTE.gold} radius={0.45} rotation={[0, Math.PI / 2, 0]} opacity={0.56} />
      </group>
      <mesh ref={orb} position={[0, 1.38, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial
          color={awakened ? VR_PALETTE.gold : hovered ? VR_PALETTE.bone : VR_PALETTE.blood}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <SacredText
        pixel
        position={[0, 0.98, 0.74]}
        fontSize={0.085}
        color={invocationStale ? VR_PALETTE.blood : awakened ? VR_PALETTE.gold : VR_PALETTE.blood}
        maxWidth={2.2}
        textAlign="center"
        anchorX="center"
      >
        {busy ? 'THE PALACE IS THINKING' : composerOpen ? 'THE CURRENT IS OPEN' : invocationStale ? 'INVOCATION UNSEALED · REBIND' : awakened ? 'REVIEW / TUNE THE CURRENT' : 'OPEN INVOCATION DOSSIER'}
      </SacredText>
      <SacredText
        position={[0, 0.8, 0.74]}
        fontSize={0.105}
        color={VR_PALETTE.bone}
        maxWidth={2.3}
        textAlign="center"
        anchorX="center"
      >
        {truncateForPanel(subject || 'THE UNREMEMBERED NAME', 40)}
      </SacredText>
      <SacredText
        pixel
        position={[0, 0.62, 0.75]}
        fontSize={0.052}
        color={completedCount === PLANETARY_STATIONS.length ? VR_PALETTE.gold : '#8d7898'}
        maxWidth={2.1}
        textAlign="center"
        anchorX="center"
      >
        {`${completedCount} / ${PLANETARY_STATIONS.length} COURTS BOUND`}
      </SacredText>
      <mesh
        position={[0, 1.25, 0.1]}
        onPointerUp={event => {
          event.stopPropagation();
          if (!busy) {
            pulsePointer(event, 0.48, 54);
            onOpenComposer();
          }
        }}
        onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        pointerEventsType={{ deny: 'grab' }}
      >
        <sphereGeometry args={[0.78, 16, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
};

const KineticRelic = ({ imageUrl, inspected, onInspect }) => {
  const [texture, setTexture] = useState(null);
  const group = useRef();
  const halo = useRef();
  const arrival = useRef(0);
  useEffect(() => {
    let cancelled = false;
    let loadedTexture = null;
    setTexture(null);
    arrival.current = 0;
    if (!imageUrl) return undefined;
    new TextureLoader().load(imageUrl, next => {
      loadedTexture = next;
      next.colorSpace = SRGBColorSpace;
      next.magFilter = NearestFilter;
      next.minFilter = NearestFilter;
      if (cancelled) next.dispose();
      else setTexture(next);
    });
    return () => {
      cancelled = true;
      loadedTexture?.dispose();
    };
  }, [imageUrl]);

  useFrame((state, delta) => {
    if (!group.current) return;
    arrival.current = MathUtils.damp(arrival.current, 1, 3.6, delta);
    const ease = 1 - ((1 - arrival.current) ** 3);
    const targetScale = inspected ? 1.15 : 1;
    group.current.scale.setScalar(Math.max(0.02, ease * targetScale));
    group.current.position.y = -1.65 + ease * 1.67;
    group.current.position.z = 0.04 + ease * (inspected ? 0.38 : 0.02);
    group.current.rotation.y = (1 - ease) * Math.PI * 1.5
      + (inspected ? Math.sin(state.clock.elapsedTime * 0.7) * 0.045 : 0);
    group.current.rotation.z = (1 - ease) * -0.32;
    if (halo.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.3) * (inspected ? 0.08 : 0.025);
      halo.current.scale.setScalar(pulse);
      halo.current.rotation.z += delta * (inspected ? 0.25 : 0.08);
    }
  });

  const inspect = event => {
    event.stopPropagation();
    pulsePointer(event, inspected ? 0.22 : 0.58, inspected ? 32 : 72);
    if (!inspected) onInspect();
  };

  return (
    <group ref={group} position={[1.52, -1.65, 0.04]}>
      <group ref={halo} position={[0, 0, -0.035]}>
        <GlowRing color={VR_PALETTE.gold} radius={0.83} tube={0.016} opacity={inspected ? 0.76 : 0.42} />
        <GlowRing color={VR_PALETTE.magenta} radius={0.69} tube={0.009} opacity={inspected ? 0.42 : 0.18} />
      </group>
      <mesh onPointerUp={inspect}>
        <planeGeometry args={[1.15, 1.72]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#0b0612" />
        )}
      </mesh>
      <Line points={[[-0.62, -0.91, 0.01], [0.62, -0.91, 0.01], [0.62, 0.91, 0.01], [-0.62, 0.91, 0.01], [-0.62, -0.91, 0.01]]} color={VR_PALETTE.gold} lineWidth={1.4} />
      <mesh position={[0, 0, 0.12]} onPointerUp={inspect} pointerEventsType={{ deny: 'grab' }}>
        <boxGeometry args={[1.65, 2.28, 0.28]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {!inspected && (
        <SacredText
          pixel
          position={[0, -1.08, 0.08]}
          fontSize={0.045}
          color={VR_PALETTE.gold}
          maxWidth={1.5}
          textAlign="center"
          anchorX="center"
        >
          POINT + RELEASE TO INSPECT
        </SacredText>
      )}
    </group>
  );
};

const CodexButton = ({ label, color, disabled, onAction }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[-0.72, -0.79, 0.055]}>
      <mesh
        onPointerUp={event => {
          event.stopPropagation();
          if (!disabled) {
            pulsePointer(event, 0.4, 44);
            onAction();
          }
        }}
        onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        pointerEventsType={{ deny: 'grab' }}
      >
        <boxGeometry args={[2.22, 0.29, 0.05]} />
        <meshBasicMaterial
          color={disabled ? '#231c2b' : color}
          transparent
          opacity={disabled ? 0.36 : hovered ? 0.42 : 0.24}
        />
      </mesh>
      <SacredText
        pixel
        position={[0, 0, 0.04]}
        fontSize={0.064}
        color={disabled ? '#776a80' : color}
        maxWidth={2.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </SacredText>
    </group>
  );
};

const FloatingCodex = ({
  station,
  title,
  body,
  subject,
  actionLabel,
  actionDisabled,
  onAction,
  status,
  inXR,
  imageUrl,
  relicInspected,
  onRelicInspect,
}) => {
  const hasImage = Boolean(imageUrl);
  const sealPosition = [1.52, 0.02, 0.05];
  const codexPose = inXR
    ? { position: [1.85, 1.65, 2.1], rotation: [0, -0.38, 0], scale: 0.84 }
    : { position: [2.48, 1.42, 2.2], rotation: [0, -0.34, 0], scale: 0.72 };
  return (
    <group {...codexPose}>
      <mesh position={[0, -1.34, -0.24]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.24, 0.86, 0.24]} />
        <meshStandardMaterial color={VR_PALETTE.stone} metalness={0.3} roughness={0.75} flatShading />
      </mesh>
      <mesh position={[0, -1.8, -0.2]}>
        <boxGeometry args={[1.18, 0.16, 0.72]} />
        <meshStandardMaterial color={VR_PALETTE.stoneLight} emissive={VR_PALETTE.blood} emissiveIntensity={0.06} metalness={0.35} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.55, 2.18, 0.08]} />
        <meshStandardMaterial color="#030102" transparent opacity={0.95} metalness={0.2} roughness={0.82} />
      </mesh>
      <Line points={[[-2.28, -1.09, 0.05], [2.28, -1.09, 0.05], [2.28, 1.09, 0.05], [-2.28, 1.09, 0.05], [-2.28, -1.09, 0.05]]} color={VR_PALETTE.blood} lineWidth={1.65} />
      <Line points={[[-2.18, -0.99, 0.058], [2.18, -0.99, 0.058], [2.18, 0.99, 0.058], [-2.18, 0.99, 0.058], [-2.18, -0.99, 0.058]]} color={VR_PALETTE.brass} lineWidth={0.8} transparent opacity={0.7} />
      <SacredText
        pixel
        position={[-0.72, 0.85, 0.06]}
        fontSize={0.078}
        color={station.color}
        maxWidth={2.35}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {`${station.glyph} ${title}`}
      </SacredText>
      <SacredText
        position={[-0.72, 0.6, 0.06]}
        fontSize={0.085}
        color={VR_PALETTE.gold}
        maxWidth={2.25}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {truncateForPanel(subject, 70)}
      </SacredText>
      <SacredText
        position={[-1.82, 0.39, 0.06]}
        fontSize={0.082}
        lineHeight={1.16}
        color={VR_PALETTE.bone}
        maxWidth={2.22}
        textAlign="left"
        anchorX="left"
        anchorY="top"
      >
        {truncateForPanel(body, 700)}
      </SacredText>
      {hasImage ? (
        <KineticRelic
          imageUrl={imageUrl}
          inspected={relicInspected}
          onInspect={onRelicInspect}
        />
      ) : (
        <group position={sealPosition} scale={0.72}>
          <MnemonicSeal seed={`${subject}:${station.id}`} color={station.color} active={status?.busy} />
        </group>
      )}
      <CodexButton
        label={actionLabel}
        color={station.color}
        disabled={actionDisabled}
        onAction={onAction}
      />
      <SacredText
        position={[1.52, -0.98, 0.06]}
        fontSize={0.07}
        color={status?.error ? VR_PALETTE.blood : status?.busy ? VR_PALETTE.teal : '#887a91'}
        maxWidth={1.32}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {truncateForPanel(status?.label || station.concept, 96)}
      </SacredText>
    </group>
  );
};

const UNICURSAL_HEXAGRAM = [
  [0, 0.96, 0],
  [0.62, -0.74, 0],
  [-0.9, 0.31, 0],
  [0.9, 0.31, 0],
  [-0.62, -0.74, 0],
  [0, 0.96, 0],
  [0, -0.96, 0],
];

const PixelBrazier = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.24, 0]}>
      <boxGeometry args={[0.58, 0.48, 0.58]} />
      <meshStandardMaterial color={VR_PALETTE.stoneLight} metalness={0.42} roughness={0.66} flatShading />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[0.76, 0.14, 0.76]} />
      <meshBasicMaterial color={VR_PALETTE.brass} />
    </mesh>
    <mesh position={[0, 0.86, 0]} rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshBasicMaterial color={VR_PALETTE.blood} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
    <mesh position={[0, 1.08, 0]} rotation={[0, 0, Math.PI / 4]}>
      <octahedronGeometry args={[0.17, 0]} />
      <meshBasicMaterial color={VR_PALETTE.gold} transparent opacity={0.88} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>
);

const TempleGuardians = () => {
  const bodies = useRef();
  const eyes = useRef();
  useEffect(() => {
    if (!bodies.current || !eyes.current) return;
    [-1, 1].forEach((direction, index) => {
      const bodyMatrix = new Matrix4().makeTranslation(direction * 4.42, 0, -5.65);
      bodies.current.setMatrixAt(index, bodyMatrix);
      const eyeMatrix = new Matrix4().makeTranslation(direction * 4.42, 2.08, -5.39);
      eyes.current.setMatrixAt(index, eyeMatrix);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    eyes.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={bodies} args={[PIXEL_GUARDIAN_GEOMETRY, null, 2]}>
        <meshStandardMaterial color="#0d0507" emissive={VR_PALETTE.blood} emissiveIntensity={0.035} metalness={0.22} roughness={0.88} flatShading />
      </instancedMesh>
      <instancedMesh ref={eyes} args={[null, null, 2]}>
        <boxGeometry args={[0.22, 0.055, 0.04]} />
        <meshBasicMaterial color={VR_PALETTE.gold} />
      </instancedMesh>
    </group>
  );
};

const ThelemicTemple = () => (
  <group>
    <mesh geometry={TEMPLE_STONE_GEOMETRY}>
      <meshStandardMaterial
        color={VR_PALETTE.stone}
        emissive="#32030c"
        emissiveIntensity={0.12}
        metalness={0.14}
        roughness={0.9}
        flatShading
      />
    </mesh>
    <mesh geometry={TEMPLE_BRASS_GEOMETRY}>
      <meshBasicMaterial color={VR_PALETTE.brass} />
    </mesh>
    <group position={[0, 3.12, -6.18]}>
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[3.8, 2.22]} />
        <meshBasicMaterial color="#020102" />
      </mesh>
      <GlowRing color={VR_PALETTE.blood} radius={0.92} tube={0.025} opacity={0.62} />
      <Line points={UNICURSAL_HEXAGRAM} color={VR_PALETTE.gold} lineWidth={2} />
      <SacredText pixel position={[0, 0.04, 0.04]} fontSize={0.19} color={VR_PALETTE.bone} anchorX="center" anchorY="middle">
        93
      </SacredText>
      <SacredText pixel position={[0, -1.34, 0.04]} fontSize={0.085} color={VR_PALETTE.gold} anchorX="center" anchorY="middle">
        THELEMA
      </SacredText>
      <SacredText position={[0, -1.6, 0.04]} fontSize={0.1} color={VR_PALETTE.bone} anchorX="center" anchorY="middle">
        DO WHAT THOU WILT · LOVE IS THE LAW
      </SacredText>
    </group>
    <PixelBrazier position={[-3.55, 0, -5.56]} />
    <PixelBrazier position={[3.55, 0, -5.56]} />
    <TempleGuardians />
  </group>
);

const ConstellationDome = ({ completedCourtIds }) => {
  const spokes = useMemo(() => PLANETARY_STATIONS.map((station, index) => {
    const pose = buildStationPose(index);
    return [[0, 4.28, -1.1], [pose.position[0], 3.35, pose.position[2]]];
  }), []);
  return (
    <group>
      <Stars radius={26} depth={12} count={360} factor={2.2} saturation={0.48} fade speed={0.16} />
      {spokes.map((points, index) => (
        <Line
          key={PLANETARY_STATIONS[index].id}
          points={points}
          color={PLANETARY_STATIONS[index].color}
          lineWidth={completedCourtIds.includes(PLANETARY_STATIONS[index].id) ? 1.35 : 0.65}
          transparent
          opacity={completedCourtIds.includes(PLANETARY_STATIONS[index].id) ? 0.54 : 0.16}
        />
      ))}
    </group>
  );
};

const MemoryFloor = ({ completedCourtIds }) => {
  const texture = useMemo(createPixelFloorTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group>
      <mesh position={[0, -0.19, -0.45]}>
        <boxGeometry args={[13.1, 0.36, 12.2]} />
        <meshStandardMaterial color={VR_PALETTE.ink} metalness={0.18} roughness={0.88} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.45]}>
        <planeGeometry args={[12.8, 11.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.025, 0.18]}>
        <boxGeometry args={[2.12, 0.045, 10.4]} />
        <meshBasicMaterial color="#24070d" />
      </mesh>
      <Line points={[[-1.08, 0.055, 5.35], [-1.08, 0.055, -5.03]]} color={VR_PALETTE.brass} lineWidth={1.1} transparent opacity={0.7} />
      <Line points={[[1.08, 0.055, 5.35], [1.08, 0.055, -5.03]]} color={VR_PALETTE.brass} lineWidth={1.1} transparent opacity={0.7} />
      <GlowRing color={VR_PALETTE.blood} radius={2.62} tube={0.013} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.065, -0.28]} opacity={0.32} />
      <GlowRing color={VR_PALETTE.brass} radius={4.9} tube={0.011} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.065, -0.8]} opacity={0.22} />
      {PLANETARY_STATIONS.map((station, index) => {
        const pose = buildStationPose(index);
        return (
          <Line
            key={station.id}
            points={[[0, 0.07, -0.1], [pose.position[0], 0.07, pose.position[2]] ]}
            color={completedCourtIds.includes(station.id) ? station.color : VR_PALETTE.blood}
            lineWidth={completedCourtIds.includes(station.id) ? 1.35 : 0.55}
            transparent
            opacity={completedCourtIds.includes(station.id) ? 0.5 : 0.12}
          />
        );
      })}
    </group>
  );
};

const ArcanaWheel = ({ count = 78, selectedIndex = 0, forgedCardIds = [] }) => {
  const group = useRef();
  const instances = useRef();
  const forged = useMemo(() => new Set(forgedCardIds), [forgedCardIds]);
  useEffect(() => {
    if (!instances.current) return;
    const dummy = new Object3D();
    const total = Math.max(1, count);
    for (let index = 0; index < total; index += 1) {
      const angle = (index / total) * Math.PI * 2;
      const radius = index % 2 ? 3.34 : 3.48;
      dummy.position.set(Math.sin(angle) * radius, 0.082, Math.cos(angle) * radius - 0.48);
      dummy.rotation.set(0, angle, 0);
      dummy.scale.set(index === selectedIndex ? 1.5 : 1, index === selectedIndex ? 1.8 : 1, 1);
      dummy.updateMatrix();
      instances.current.setMatrixAt(index, dummy.matrix);
      instances.current.setColorAt(index, new Color(
        index === selectedIndex
          ? VR_PALETTE.gold
          : forged.has(index)
            ? VR_PALETTE.blood
            : '#3b1018',
      ));
    }
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor) instances.current.instanceColor.needsUpdate = true;
  }, [count, forged, selectedIndex]);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.008;
  });
  return (
    <group ref={group}>
      <instancedMesh ref={instances} args={[null, null, Math.max(1, count)]}>
        <boxGeometry args={[0.065, 0.028, 0.24]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
};

const SpatialSpread = ({ cards = [] }) => {
  const instances = useRef();
  useEffect(() => {
    if (!instances.current || !cards.length) return;
    const matrix = new Matrix4();
    const columns = cards.length <= 3 ? cards.length : cards.length <= 6 ? 3 : 5;
    cards.forEach((_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const x = (column - (Math.min(columns, cards.length) - 1) / 2) * 0.56;
      const z = row * -0.82;
      matrix.makeTranslation(x, 0.16 + row * 0.012, z);
      instances.current.setMatrixAt(index, matrix);
      instances.current.setColorAt(index, new Color(index % 2 ? VR_PALETTE.brass : VR_PALETTE.blood));
    });
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor) instances.current.instanceColor.needsUpdate = true;
  }, [cards]);
  if (!cards.length) return null;
  return (
    <group position={[0, 0, -0.15]}>
      <instancedMesh ref={instances} args={[null, null, cards.length]}>
        <boxGeometry args={[0.42, 0.045, 0.68]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
};

const FrameMonitor = ({ onSample }) => {
  const { gl } = useThree();
  const sample = useRef({ frames: 0, startedAt: performance.now() });
  useFrame(() => {
    sample.current.frames += 1;
    const now = performance.now();
    const elapsed = now - sample.current.startedAt;
    if (elapsed < 1000) return;
    onSample({
      fps: Math.round((sample.current.frames * 1000) / elapsed),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    });
    sample.current = { frames: 0, startedAt: now };
  });
  return null;
};

export default function AtriumScene({
  subject,
  awakened,
  invocationStale = false,
  ritual,
  activeStationId,
  onSelectStation,
  codex,
  onCodexAction,
  status,
  inXR,
  imageUrl,
  relicInspected,
  onRelicInspect,
  cardIndex = 0,
  deckSize = 78,
  forgedCardIds = [],
  oracleCards = [],
  completedCourtIds = [],
  atmosphereTier = 2,
  onPerformanceSample,
  composer,
  composerActions,
  wrist,
  wristActions,
}) {
  const station = PLANETARY_STATIONS.find(entry => entry.id === activeStationId)
    || PLANETARY_STATIONS[1];
  const currentEffigy = useMemo(() => buildEffigyParameters({
    subject,
    traditionIndex: composer?.traditionIndex,
    styleIndex: composer?.styleIndex,
    erosIndex: composer?.erosIndex,
    techIndex: composer?.techIndex,
    atmosphereMode: composer?.atmosphereMode,
  }), [
    composer?.atmosphereMode,
    composer?.erosIndex,
    composer?.styleIndex,
    composer?.techIndex,
    composer?.traditionIndex,
    subject,
  ]);
  return (
    <>
      <color attach="background" args={[VR_PALETTE.void]} />
      <fog attach="fog" args={[VR_PALETTE.void, 9.5, 24]} />
      <ambientLight intensity={0.34} color="#8d303c" />
      <pointLight position={[0, 4.4, 1.5]} color={VR_PALETTE.blood} intensity={6.5} distance={10} decay={2} />
      <pointLight position={[0, 2.4, -5.4]} color={VR_PALETTE.gold} intensity={7} distance={8} decay={2} />
      <ThelemicTemple />
      <MemoryFloor completedCourtIds={completedCourtIds} />
      <ArcanaWheel count={deckSize} selectedIndex={cardIndex} forgedCardIds={forgedCardIds} />
      {activeStationId === 'oracle' && <SpatialSpread cards={oracleCards} />}
      <ConstellationDome completedCourtIds={completedCourtIds} />
      <ElectricBabalonCrown
        tier={atmosphereTier}
        busy={status.busy}
        awakened={awakened}
        completedCount={completedCourtIds.length}
      />
      {!composer?.open && (
        <group position={[0, 2.74, -0.05]} scale={0.68}>
          <MnemonicEffigy
            parameters={currentEffigy}
            active={awakened && !invocationStale}
            busy={status.busy}
          />
        </group>
      )}
      {atmosphereTier > 0 && (
        <>
          <AstralWeather tier={atmosphereTier} busy={status.busy} />
          <GlitchFragments tier={atmosphereTier} busy={status.busy} />
          <AltarVoltage tier={atmosphereTier} busy={status.busy} awakened={awakened} />
        </>
      )}
      <RitualAltar
        subject={subject}
        busy={status.busy}
        awakened={awakened}
        invocationStale={invocationStale}
        completedCount={completedCourtIds.length}
        manifestationKey={imageUrl}
        composerOpen={composer?.open}
        onOpenComposer={composerActions.open}
      />
      <PlanetaryArchitecture activeStationId={activeStationId} completedCourtIds={completedCourtIds} />
      {!composer?.open && PLANETARY_STATIONS.map((entry, index) => (
        <PlanetaryGate
          key={entry.id}
          station={entry}
          index={index}
          selected={entry.id === activeStationId}
          completed={completedCourtIds.includes(entry.id)}
          onSelect={onSelectStation}
        />
      ))}
      {composer?.open ? (
        <SpatialRitualComposer model={composer} actions={composerActions} />
      ) : (
        <FloatingCodex
          station={station}
          title={codex.title}
          body={codex.body}
          subject={ritual?.geniusTitle || subject}
          actionLabel={codex.actionLabel}
          actionDisabled={codex.actionDisabled}
          onAction={onCodexAction}
          status={status}
          inXR={inXR}
          imageUrl={imageUrl}
          relicInspected={relicInspected}
          onRelicInspect={onRelicInspect}
        />
      )}
      {!composer?.open && <WristGrimoire model={wrist} actions={wristActions} />}
      <FrameMonitor onSample={onPerformanceSample} />
      <OrbitControls
        makeDefault
        enabled={!inXR}
        target={[0, 1.45, -1.15]}
        minDistance={4.8}
        maxDistance={10.5}
        minPolarAngle={0.65}
        maxPolarAngle={Math.PI / 2.03}
        minAzimuthAngle={-Math.PI / 2.6}
        maxAzimuthAngle={Math.PI / 2.6}
        enablePan={false}
        enableDamping
      />
    </>
  );
}
