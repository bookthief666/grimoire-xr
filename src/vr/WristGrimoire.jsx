import React, { memo, useEffect, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { Color, DoubleSide, Matrix4 } from 'three';
import vt323Font from '@fontsource/vt323/files/vt323-latin-400-normal.woff?url';
import pixelFont from '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff?url';
import { VR_PALETTE, truncateForPanel } from './vrContent.js';

const pulsePointer = (event, intensity = 0.3, milliseconds = 34) => {
  const gamepad = event?.pointerState?.inputSource?.gamepad
    || event?.nativeEvent?.inputSource?.gamepad;
  const actuator = gamepad?.hapticActuators?.[0];
  if (actuator?.pulse) void actuator.pulse(intensity, milliseconds)?.catch?.(() => {});
};

const WristText = memo(({ children, pixel = false, ...props }) => (
  <Text
    font={pixel ? pixelFont : vt323Font}
    color={VR_PALETTE.bone}
    material-side={DoubleSide}
    {...props}
  >
    {children}
  </Text>
));
WristText.displayName = 'WristText';

const CompassButton = ({
  label,
  position,
  width = 1.1,
  height = 0.38,
  color = VR_PALETTE.blood,
  active = false,
  disabled = false,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <mesh
        onPointerUp={event => {
          event.stopPropagation();
          if (disabled) return;
          pulsePointer(event, active ? 0.42 : 0.28, active ? 48 : 30);
          onSelect?.();
        }}
        onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        pointerEventsType={{ deny: 'grab' }}
      >
        <boxGeometry args={[width, height, 0.075]} />
        <meshStandardMaterial
          color={disabled ? '#10080a' : active ? '#390811' : '#080405'}
          emissive={disabled ? '#000000' : color}
          emissiveIntensity={hovered ? 0.82 : active ? 0.4 : 0.14}
          metalness={0.32}
          roughness={0.68}
          transparent
          opacity={disabled ? 0.42 : 0.96}
        />
      </mesh>
      <WristText
        pixel
        position={[0, 0, 0.065]}
        fontSize={0.046}
        color={disabled ? '#62545a' : hovered ? VR_PALETTE.bone : color}
        maxWidth={width - 0.12}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </WristText>
    </group>
  );
};

const ProviderGem = ({ position, label, state }) => {
  const color = state === 'ready'
    ? VR_PALETTE.teal
    : state === 'demo'
      ? VR_PALETTE.gold
      : state === 'checking'
        ? VR_PALETTE.violet
        : VR_PALETTE.blood;
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <WristText
        pixel
        position={[0.16, 0, 0.02]}
        fontSize={0.036}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {`${label} ${state.toUpperCase()}`}
      </WristText>
    </group>
  );
};

const CircuitProgress = ({ courts }) => {
  const instances = useRef();
  useEffect(() => {
    if (!instances.current) return;
    const matrix = new Matrix4();
    courts.forEach((court, index) => {
      matrix.makeTranslation((index - 3) * 0.18, 0, 0);
      instances.current.setMatrixAt(index, matrix);
      instances.current.setColorAt(index, new Color(
        court.active ? VR_PALETTE.bone : court.complete ? VR_PALETTE.teal : court.next ? VR_PALETTE.gold : '#3b1018',
      ));
    });
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor) instances.current.instanceColor.needsUpdate = true;
  }, [courts]);
  return (
    <instancedMesh ref={instances} args={[null, null, 7]}>
      <octahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
};

export default function WristGrimoire({ model, actions }) {
  if (!model.open) {
    return (
      <CompassButton
        label="✶ RITUAL COMPASS"
        position={[3.92, 2.52, 2.72]}
        width={1.58}
        height={0.46}
        color={VR_PALETTE.gold}
        onSelect={actions.open}
      />
    );
  }

  return (
    <group position={[2.9, 2.26, 2.7]} rotation={[0, -0.33, 0]} scale={0.86}>
      <mesh position={[0, 0, -0.07]}>
        <boxGeometry args={[3.54, 3.5, 0.12]} />
        <meshStandardMaterial
          color="#030102"
          emissive="#2b060d"
          emissiveIntensity={0.25}
          metalness={0.36}
          roughness={0.72}
          transparent
          opacity={0.96}
        />
      </mesh>
      <WristText pixel position={[-1.52, 1.5, 0.04]} fontSize={0.06} color={VR_PALETTE.gold} anchorX="left">
        WRIST GRIMOIRE · 0.11A
      </WristText>
      <WristText position={[-1.52, 1.29, 0.04]} fontSize={0.09} color={model.activeCourt?.color} anchorX="left">
        {`${model.activeCourt?.glyph || '☿'} ${model.activeCourt?.planet || 'MERCURY'} · ${model.activeCourt?.concept || 'GNOSIS'}`}
      </WristText>
      <group position={[0, 1.11, 0.045]}>
        <CircuitProgress courts={model.courts} />
      </group>
      <CompassButton label="CLOSE" position={[1.39, 1.46, 0.04]} width={0.62} height={0.28} color={VR_PALETTE.blood} onSelect={actions.close} />

      {model.courts.map((court, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const label = `${court.glyph} ${court.planet}${court.complete ? ' ◆' : court.next ? ' ◇' : ''}`;
        return (
          <CompassButton
            key={court.id}
            label={label}
            position={[-0.83 + column * 1.66, 0.75 - row * 0.48, 0.04]}
            width={1.48}
            height={0.39}
            color={court.color}
            active={court.active}
            disabled={model.busy}
            onSelect={() => actions.openCourt(court.id)}
          />
        );
      })}
      <CompassButton
        label={model.current.stale ? '⚠ REBIND AT ALTAR' : '✶ CURRENT / ALTAR'}
        position={[0.83, -0.69, 0.04]}
        width={1.48}
        height={0.39}
        color={VR_PALETTE.gold}
        disabled={model.busy}
        onSelect={actions.openComposer}
      />

      <group position={[-0.83, -0.69, 0.04]}>
        <WristText pixel position={[0, 0.09, 0]} fontSize={0.034} color={model.current.stale ? VR_PALETTE.blood : VR_PALETTE.teal} maxWidth={1.45} textAlign="center" anchorX="center">
          {model.current.stale ? 'INVOCATION UNSEALED' : model.current.ready ? 'BOUND INVOCATION' : 'INVOCATION DOSSIER'}
        </WristText>
        <WristText position={[0, -0.03, 0]} fontSize={0.058} color={VR_PALETTE.gold} maxWidth={1.45} textAlign="center" anchorX="center">
          {truncateForPanel(model.current.subject, 36)}
        </WristText>
        <WristText position={[0, -0.15, 0]} fontSize={0.047} color="#a9978a" maxWidth={1.45} textAlign="center" anchorX="center">
          {truncateForPanel(`${model.current.tradition} · ${model.current.style}\nEROS ${model.current.eros} · ${model.current.intellect}`, 72)}
        </WristText>
      </group>

      <ProviderGem position={[-1.46, -1.02, 0.04]} label="TEXT" state={model.textGem} />
      <ProviderGem position={[0.03, -1.02, 0.04]} label="IMAGE" state={model.imageGem} />
      <WristText pixel position={[1.5, -1.02, 0.04]} fontSize={0.038} color={model.busy ? VR_PALETTE.blood : VR_PALETTE.teal} anchorX="right">
        {`${model.operationKind} · Q${model.queueDepth}`}
      </WristText>

      <CompassButton
        label={model.demoMode ? 'DEMO CURRENT' : 'LIVE LOCAL AI'}
        position={[-1.12, -1.37, 0.04]}
        width={1.18}
        height={0.3}
        color={model.demoMode ? VR_PALETTE.gold : VR_PALETTE.teal}
        disabled={model.busy}
        onSelect={actions.toggleDemoMode}
      />
      <CompassButton
        label={model.audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
        position={[0, -1.37, 0.04]}
        width={0.9}
        height={0.3}
        color={model.audioEnabled ? VR_PALETTE.teal : VR_PALETTE.violet}
        disabled={model.busy}
        onSelect={actions.toggleAudio}
      />
      <CompassButton
        label={truncateForPanel(model.atmosphere.label, 20)}
        position={[1.16, -1.37, 0.04]}
        width={1.16}
        height={0.3}
        color={VR_PALETTE.magenta}
        disabled={model.busy}
        onSelect={actions.cycleAtmosphere}
      />
      <WristText
        position={[0, -1.64, 0.04]}
        fontSize={0.073}
        color={model.error ? VR_PALETTE.blood : model.busy ? VR_PALETTE.gold : '#8f7e89'}
        maxWidth={3.12}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {truncateForPanel(model.statusLabel, 92)}
      </WristText>
    </group>
  );
}
