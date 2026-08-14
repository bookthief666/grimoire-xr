import React, { memo, useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import {
  DoubleSide,
} from 'three';
import vt323Font from '@fontsource/vt323/files/vt323-latin-400-normal.woff?url';
import pixelFont from '@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff?url';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
import { ATMOSPHERE_MODES, VR_PALETTE, truncateForPanel } from './vrContent.js';
import MnemonicEffigy from './MnemonicEffigy.jsx';
import {
  ART_STYLE_FAMILIES,
  SPATIAL_COMPOSER_STAGES,
  buildComposerSnapshot,
  buildEffigyParameters,
  getChoiceWindow,
  getStyleFamilyForIndex,
  navigateComposer,
  normalizeComposerIndices,
  selectComposerStage,
  wrapIndex,
} from './spatialRitualModel.js';

const pulsePointer = (event, intensity = 0.28, milliseconds = 32) => {
  const gamepad = event?.pointerState?.inputSource?.gamepad
    || event?.nativeEvent?.inputSource?.gamepad;
  const actuator = gamepad?.hapticActuators?.[0];
  if (actuator?.pulse) void actuator.pulse(intensity, milliseconds)?.catch?.(() => {});
};

const SpatialText = memo(({ children, pixel = false, ...props }) => (
  <Text
    font={pixel ? pixelFont : vt323Font}
    color={VR_PALETTE.bone}
    material-side={DoubleSide}
    {...props}
  >
    {children}
  </Text>
));
SpatialText.displayName = 'SpatialText';

const SigilButton = ({
  label,
  position,
  width = 1.25,
  height = 0.42,
  accent = VR_PALETTE.blood,
  disabled = false,
  primary = false,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);
  const activate = event => {
    event.stopPropagation();
    if (disabled) return;
    pulsePointer(event, primary ? 0.48 : 0.28, primary ? 56 : 30);
    onSelect?.();
  };
  return (
    <group position={position}>
      <mesh
        onPointerUp={activate}
        onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        pointerEventsType={{ deny: 'grab' }}
      >
        <boxGeometry args={[width, height, 0.075]} />
        <meshStandardMaterial
          color={disabled ? '#160b0d' : primary ? '#3f0712' : '#0c0709'}
          emissive={disabled ? '#000000' : accent}
          emissiveIntensity={hovered ? 0.72 : primary ? 0.34 : 0.16}
          metalness={0.34}
          roughness={0.66}
          transparent
          opacity={disabled ? 0.45 : 0.96}
        />
      </mesh>
      <SpatialText
        pixel
        position={[0, 0, 0.09]}
        fontSize={0.055}
        color={disabled ? '#5f5055' : hovered ? VR_PALETTE.bone : accent}
        maxWidth={width - 0.14}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </SpatialText>
    </group>
  );
};

const COURT_SHORT_LABELS = Object.freeze(['NAME', 'LINEAGE', 'ART', 'EROS', 'MIND', 'WEATHER', 'SEAL']);

const CourtTab = ({ stage, index, selected, onSelect, disabled }) => (
  <SigilButton
    label={`${stage.glyph} ${COURT_SHORT_LABELS[index]}`}
    position={[(index - 3) * 0.715, 0.86, 0.07]}
    width={0.65}
    height={0.3}
    accent={selected ? VR_PALETTE.gold : '#7f2637'}
    primary={selected}
    disabled={disabled}
    onSelect={onSelect}
  />
);

const ChoiceTile = ({ entry, stageId, x, width, selected, disabled, onSelect }) => (
  <SigilButton
    label={truncateForPanel(labelEntry(stageId, entry), width > 1.2 ? 24 : 15)}
    position={[x, 0.07, 0.07]}
    width={width}
    height={selected ? 0.5 : 0.42}
    accent={selected ? VR_PALETTE.gold : VR_PALETTE.blood}
    primary={selected}
    disabled={disabled}
    onSelect={onSelect}
  />
);

const getVisibleChoiceIndices = (entryCount, selectedIndex, maximum = 5) => {
  if (!entryCount) return [];
  if (entryCount <= maximum) return Array.from({ length: entryCount }, (_, index) => index);
  const half = Math.floor(maximum / 2);
  return Array.from({ length: maximum }, (_, offset) => wrapIndex(selectedIndex + offset - half, entryCount));
};

const describeEntry = (stageId, entry) => {
  if (!entry) return '';
  if (stageId === 'subject') return 'THE NAME THAT ORGANIZES THE PALACE';
  if (stageId === 'tradition') return entry.desc;
  if (stageId === 'aesthetic-family') return `${entry.styles.length} VISUAL CURRENTS IN THIS CONSTELLATION`;
  if (stageId === 'aesthetic-style') return `${entry.cat} · THE IMAGE-FORGE INHERITS THIS CURRENT`;
  if (stageId === 'eros') return entry.context || 'DESIRE QUIET · SYMBOLIC VOLTAGE MINIMAL';
  if (stageId === 'intellect') return entry.desc;
  if (stageId === 'atmosphere') return 'PERFORMANCE-AWARE LIGHT, PARTICLES, GLITCH, AND ELECTRIC WEATHER';
  return '';
};

const labelEntry = (stageId, entry) => {
  if (!entry) return 'UNNAMED';
  if (stageId === 'subject') return entry.label;
  if (stageId === 'tradition' || stageId === 'aesthetic-style') return entry.name.toUpperCase();
  if (stageId === 'aesthetic-family') return entry.label;
  return entry.label;
};

export default function SpatialRitualComposer({ model, actions }) {
  const [navigation, setNavigation] = useState({ stageIndex: 0, aestheticMode: 'family' });
  const stage = SPATIAL_COMPOSER_STAGES[navigation.stageIndex];
  const indices = useMemo(() => normalizeComposerIndices(model), [model]);
  const family = getStyleFamilyForIndex(indices.styleIndex);
  const invocationEntry = useMemo(() => ({
    id: 'authored-invocation',
    label: String(model.subject || '').trim().toUpperCase() || 'NO INVOCATION BOUND',
    value: String(model.subject || '').trim(),
  }), [model.subject]);
  const familyIndex = Math.max(0, ART_STYLE_FAMILIES.findIndex(entry => entry.id === family?.id));
  const familyStyleIndex = Math.max(0, family?.styles.findIndex(entry => entry.catalogIndex === indices.styleIndex));
  const effigy = useMemo(() => buildEffigyParameters(model), [model]);
  const snapshot = useMemo(() => buildComposerSnapshot(model), [model]);

  let choiceStageId = stage.id;
  let entries = [];
  let selectedIndex = 0;
  let setSelected = () => {};
  if (stage.id === 'subject') {
    entries = [invocationEntry];
    selectedIndex = 0;
  } else if (stage.id === 'tradition') {
    entries = TRADITIONS;
    selectedIndex = indices.traditionIndex;
    setSelected = actions.setTraditionIndex;
  } else if (stage.id === 'aesthetic' && navigation.aestheticMode === 'family') {
    choiceStageId = 'aesthetic-family';
    entries = ART_STYLE_FAMILIES;
    selectedIndex = familyIndex;
    setSelected = index => actions.setStyleIndex(entries[wrapIndex(index, entries.length)].styles[0].catalogIndex);
  } else if (stage.id === 'aesthetic') {
    choiceStageId = 'aesthetic-style';
    entries = family?.styles || ART_STYLE_FAMILIES[0].styles;
    selectedIndex = familyStyleIndex;
    setSelected = index => actions.setStyleIndex(entries[wrapIndex(index, entries.length)].catalogIndex);
  } else if (stage.id === 'eros') {
    entries = EROS_LEVELS;
    selectedIndex = indices.erosIndex;
    setSelected = actions.setErosIndex;
  } else if (stage.id === 'intellect') {
    entries = TECH_LEVELS;
    selectedIndex = indices.techIndex;
    setSelected = actions.setTechIndex;
  } else if (stage.id === 'atmosphere') {
    entries = ATMOSPHERE_MODES;
    selectedIndex = indices.atmosphereIndex;
    setSelected = index => actions.setAtmosphereMode(entries[wrapIndex(index, entries.length)].id);
  }
  const choice = getChoiceWindow(entries, selectedIndex);
  const visibleChoiceIndices = getVisibleChoiceIndices(entries.length, selectedIndex);
  const choiceTileWidth = Math.min(1.18, 4.7 / Math.max(1, visibleChoiceIndices.length) - 0.06);

  const moveChoice = direction => {
    if (!entries.length || model.status.busy) return;
    setSelected(wrapIndex(selectedIndex + direction, entries.length));
  };
  const moveStage = direction => {
    if (model.status.busy) return;
    if (navigation.stageIndex === 0 && direction < 0) {
      actions.close();
      return;
    }
    setNavigation(current => navigateComposer(current, direction));
  };
  const jumpToStage = nextStageIndex => {
    if (model.status.busy) return;
    setNavigation(selectComposerStage(nextStageIndex));
  };
  const moveFamily = direction => {
    if (model.status.busy || !ART_STYLE_FAMILIES.length) return;
    const nextFamily = ART_STYLE_FAMILIES[wrapIndex(familyIndex + direction, ART_STYLE_FAMILIES.length)];
    actions.setStyleIndex(nextFamily.styles[0].catalogIndex);
  };
  const awaken = () => {
    if (!snapshot.readiness.ready) return;
    actions.awaken();
  };
  const isReview = stage.id === 'review';
  const title = stage.title;
  const reviewText = [
    snapshot.subject.toUpperCase(),
    `${snapshot.tradition.name.toUpperCase()} · ${snapshot.aesthetic.family}`,
    `${snapshot.aesthetic.name.toUpperCase()} · EROS ${snapshot.eros.label} · ${snapshot.intellect.label}`,
    `${snapshot.atmosphere.label} · ${snapshot.operationMode.replaceAll('-', ' ').toUpperCase()}`,
    `TEXT ${snapshot.textReady ? 'READY' : 'UNAVAILABLE'} · IMAGE ${snapshot.imageReady ? 'READY' : 'UNAVAILABLE'}`,
  ].join('\n');
  const boundCurrent = [
    snapshot.subject,
    snapshot.tradition.name,
    snapshot.aesthetic.name,
    `EROS ${snapshot.eros.label}`,
    snapshot.intellect.label,
    snapshot.atmosphere.label,
  ].join(' · ').toUpperCase();
  // Opening an already-bound dossier is a review/tuning action, not an
  // invitation to regenerate all 78 cards. Only a changed subject/lineage
  // should turn the final seal back into an awaken/rebind action.
  const ritualBound = model.ritualReady && !model.status.busy && !model.status.error;

  return (
    <group>
      <group position={[0, 3.25, 1.18]} scale={0.82}>
        <MnemonicEffigy parameters={effigy} active busy={model.status.busy} />
      </group>
      <group position={[0, 1.75, 2.22]}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[5.45, 2.7, 0.12]} />
          <meshStandardMaterial
            color="#050205"
            emissive="#2a030d"
            emissiveIntensity={0.24}
            metalness={0.34}
            roughness={0.7}
            transparent
            opacity={0.94}
          />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[5.25, 2.5]} />
          <meshBasicMaterial color="#070308" transparent opacity={0.88} />
        </mesh>
        <SpatialText
          pixel
          position={[-2.34, 1.18, 0.06]}
          fontSize={0.036}
          color="#38e6d1"
          maxWidth={4.35}
          anchorX="left"
          anchorY="middle"
        >
          {`BOUND CURRENT · ${truncateForPanel(boundCurrent, 104)}`}
        </SpatialText>
        {SPATIAL_COMPOSER_STAGES.map((court, index) => (
          <CourtTab
            key={court.id}
            stage={court}
            index={index}
            selected={index === navigation.stageIndex}
            disabled={model.status.busy}
            onSelect={() => jumpToStage(index)}
          />
        ))}
        <SigilButton
          label="CLOSE"
          position={[2.37, 1.18, 0.06]}
          width={0.52}
          height={0.24}
          disabled={model.status.busy}
          onSelect={actions.close}
        />
        <SpatialText
          pixel
          position={[0, 0.56, 0.05]}
          fontSize={0.074}
          color={stage.id === 'review' ? VR_PALETTE.gold : VR_PALETTE.blood}
          maxWidth={4.45}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </SpatialText>

        {!isReview && (
          <>
            {stage.id === 'aesthetic' && (
              <>
                <SigilButton
                  label="◀ FAMILY"
                  position={[-1.65, 0.34, 0.06]}
                  width={0.85}
                  height={0.24}
                  disabled={model.status.busy}
                  onSelect={() => moveFamily(-1)}
                />
                <SpatialText
                  pixel
                  position={[0, 0.34, 0.07]}
                  fontSize={0.052}
                  color={VR_PALETTE.gold}
                  maxWidth={2.1}
                  textAlign="center"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`${family?.label || 'UNCATEGORIZED'} · ${family?.styles.length || 0} CURRENTS`}
                </SpatialText>
                <SigilButton
                  label="FAMILY ▶"
                  position={[1.65, 0.34, 0.06]}
                  width={0.85}
                  height={0.24}
                  disabled={model.status.busy}
                  onSelect={() => moveFamily(1)}
                />
              </>
            )}
            {visibleChoiceIndices.map((entryIndex, slotIndex) => (
              <ChoiceTile
                key={`${choiceStageId}-${entries[entryIndex]?.id || entryIndex}`}
                entry={entries[entryIndex]}
                stageId={choiceStageId}
                x={(slotIndex - (visibleChoiceIndices.length - 1) / 2) * (choiceTileWidth + 0.07)}
                width={choiceTileWidth}
                selected={entryIndex === selectedIndex}
                disabled={model.status.busy}
                onSelect={() => setSelected(entryIndex)}
              />
            ))}
            <SpatialText
              position={[0, -0.35, 0.07]}
              fontSize={0.076}
              color={VR_PALETTE.gold}
              maxWidth={4.65}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {truncateForPanel(describeEntry(choiceStageId, choice.current), 116)}
            </SpatialText>
            {stage.id === 'subject' && (
              <>
                <SigilButton
                  label="◉ SPEAK INVOCATION"
                  position={[-1.12, -0.62, 0.07]}
                  width={1.8}
                  height={0.25}
                  accent={VR_PALETTE.gold}
                  disabled={model.status.busy}
                  onSelect={actions.dictateInvocation}
                />
                <SigilButton
                  label="TYPE IN RITUAL CONSOLE"
                  position={[1.12, -0.62, 0.07]}
                  width={1.8}
                  height={0.25}
                  accent="#38e6d1"
                  disabled={model.status.busy}
                  onSelect={actions.openConsole}
                />
              </>
            )}
          </>
        )}

        {isReview && (
          <>
            <SpatialText
              position={[0, 0.05, 0.06]}
              fontSize={0.096}
              color={VR_PALETTE.bone}
              maxWidth={4.4}
              lineHeight={1.15}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {reviewText}
            </SpatialText>
            <SpatialText
              pixel
              position={[0, -0.47, 0.06]}
              fontSize={0.052}
              color={snapshot.readiness.ready ? '#38e6d1' : VR_PALETTE.blood}
              maxWidth={4.2}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              {snapshot.readiness.reason}
            </SpatialText>
          </>
        )}

        <SigilButton
          label={navigation.stageIndex === 0 ? 'CLOSE COMPOSER' : `◀ ${COURT_SHORT_LABELS[navigation.stageIndex - 1]}`}
          position={[-1.32, -1.03, 0.06]}
          width={2.25}
          disabled={model.status.busy}
          onSelect={() => moveStage(-1)}
        />
        <SigilButton
          label={isReview
            ? model.status.busy
              ? 'THE PALACE IS THINKING'
              : ritualBound
                ? 'SEAL BOUND · RETURN TO TEMPLE'
                : model.status.error
                  ? 'RETRY AWAKENING'
                  : 'AWAKEN 78 ARCANA'
            : navigation.stageIndex === SPATIAL_COMPOSER_STAGES.length - 2
              ? 'REVIEW THE CENTRAL SEAL ▶'
              : `${COURT_SHORT_LABELS[navigation.stageIndex + 1]} ▶`}
          position={[1.32, -1.03, 0.06]}
          width={2.25}
          accent={isReview ? VR_PALETTE.gold : '#38e6d1'}
          primary
          disabled={model.status.busy || (isReview && !snapshot.readiness.ready)}
          onSelect={isReview ? (ritualBound ? actions.close : awaken) : () => moveStage(1)}
        />
      </group>
    </group>
  );
}
