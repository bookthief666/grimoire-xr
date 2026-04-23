import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR, createXRStore, useXR } from '@react-three/xr'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGrimoireEngine } from './engine/useGrimoireEngine'
import { RitualChamberScene } from './scene/RitualChamberScene'
import type { TechLevel, Tone, Tradition } from './types/grimoire'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
  TRADITION_OPTIONS,
} from './constants/ritualOptions'
import './index.css'

const xrStore = createXRStore()

function XRSessionBridge({
  onVRChange,
}: {
  onVRChange: (isVR: boolean) => void
}) {
  const mode = useXR((xr) => xr.mode)

  useEffect(() => {
    onVRChange(mode === 'immersive-vr')
  }, [mode, onVRChange])

  return null
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: '#c58a53',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}

function InfoBlock({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 10,
        border: '1px solid rgba(143,91,0,0.35)',
        background: 'rgba(28, 10, 10, 0.6)',
      }}
    >
      {children}
    </div>
  )
}

function SelectField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        background: '#120707',
        border: '1px solid #6a2b10',
        color: '#ffe0a6',
        outline: 'none',
        fontFamily: 'monospace',
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function RitualControlPanel({
  subject,
  tradition,
  tone,
  techLevel,
  intent,
  onSubjectChange,
  onTraditionChange,
  onToneChange,
  onTechLevelChange,
  onIntentChange,
  onSuggestedQuestionClick,
  onBegin,
  onClear,
  loading,
  phase,
  error,
  deckName,
  dossierSummary,
  omen,
  archetype,
  magicalDiagnosis,
  operativeAdvice,
  suggestedQuestions,
}: {
  subject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  intent: string
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onSuggestedQuestionClick: (question: string) => void
  onBegin: () => Promise<void>
  onClear: () => void
  loading: boolean
  phase: string
  error: string | null
  deckName: string | null
  dossierSummary: string | null
  omen: string | null
  archetype: string | null
  magicalDiagnosis?: string | null
  operativeAdvice?: string | null
  suggestedQuestions?: string[]
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 12,
        width: 400,
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        padding: 14,
        border: '1px solid rgba(191, 123, 39, 0.45)',
        background:
          'linear-gradient(180deg, rgba(18,6,6,0.92) 0%, rgba(9,4,4,0.88) 100%)',
        color: '#ffe0a6',
        fontFamily: 'monospace',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.45), 0 0 22px rgba(120,20,20,0.16)',
      }}
    >
      <div style={{ marginBottom: 12, fontSize: 13, letterSpacing: 1.4 }}>
        GRIMOIRE XR // RITUAL FORGE
      </div>

      <SectionLabel>Subject</SectionLabel>
      <input
        value={subject}
        onChange={(event) => onSubjectChange(event.target.value)}
        placeholder="Enter ritual subject"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 10,
          padding: '10px 12px',
          background: '#120707',
          border: '1px solid #6a2b10',
          color: '#ffe0a6',
          outline: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <SectionLabel>Tradition</SectionLabel>
          <SelectField
            value={tradition}
            onChange={onTraditionChange}
            options={TRADITION_OPTIONS}
          />
        </div>

        <div>
          <SectionLabel>Tone</SectionLabel>
          <SelectField
            value={tone}
            onChange={onToneChange}
            options={TONE_OPTIONS}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Tech Level</SectionLabel>
        <SelectField
          value={techLevel}
          onChange={onTechLevelChange}
          options={TECH_LEVEL_OPTIONS}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Intent / Query</SectionLabel>
        <textarea
          value={intent}
          onChange={(event) => onIntentChange(event.target.value)}
          placeholder="Optional: what specifically should the oracle reveal, diagnose, or clarify?"
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px',
            background: '#120707',
            border: '1px solid #6a2b10',
            color: '#ffe0a6',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => void onBegin()}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: loading ? '#35140b' : '#5a1a0d',
            color: '#ffe0a6',
            border: '1px solid #d94e16',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Forging…' : 'Begin Ritual'}
        </button>

        <button
          onClick={onClear}
          style={{
            padding: '10px 12px',
            background: '#140b0b',
            color: '#d7b891',
            border: '1px solid rgba(143,91,0,0.4)',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <InfoBlock>
        <div style={{ fontSize: 11, color: '#d89b6b', marginBottom: 4 }}>
          Forge phase: {phase}
        </div>
        <div style={{ fontSize: 11, color: '#d89b6b', marginBottom: 4 }}>
          Tradition: {tradition}
        </div>
        <div style={{ fontSize: 11, color: '#d89b6b', marginBottom: 4 }}>
          Tone: {tone}
        </div>
        <div style={{ fontSize: 11, color: '#d89b6b', marginBottom: 4 }}>
          Tech level: {techLevel}
        </div>
        {intent ? (
          <div style={{ fontSize: 11, color: '#d89b6b', marginBottom: 4 }}>
            Intent: {intent}
          </div>
        ) : null}
        {deckName ? (
          <div style={{ fontSize: 12, color: '#ffb000' }}>Active deck: {deckName}</div>
        ) : null}
      </InfoBlock>

      {dossierSummary ? (
        <div style={{ marginTop: 12 }}>
          <SectionLabel>Dossier</SectionLabel>
          <InfoBlock>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: '#d8bf9b' }}>
              {dossierSummary}
            </div>
          </InfoBlock>
        </div>
      ) : null}

      {(archetype || omen || magicalDiagnosis || operativeAdvice) ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {archetype ? (
            <div>
              <SectionLabel>Archetype</SectionLabel>
              <InfoBlock>
                <div style={{ fontSize: 12, color: '#ffe0a6' }}>{archetype}</div>
              </InfoBlock>
            </div>
          ) : null}

          {omen ? (
            <div>
              <SectionLabel>Omen</SectionLabel>
              <InfoBlock>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: '#d8bf9b' }}>
                  {omen}
                </div>
              </InfoBlock>
            </div>
          ) : null}

          {magicalDiagnosis ? (
            <div>
              <SectionLabel>Magical Diagnosis</SectionLabel>
              <InfoBlock>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: '#d8bf9b' }}>
                  {magicalDiagnosis}
                </div>
              </InfoBlock>
            </div>
          ) : null}

          {operativeAdvice ? (
            <div>
              <SectionLabel>Operative Advice</SectionLabel>
              <InfoBlock>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: '#d8bf9b' }}>
                  {operativeAdvice}
                </div>
              </InfoBlock>
            </div>
          ) : null}

          {suggestedQuestions && suggestedQuestions.length > 0 ? (
            <div>
              <SectionLabel>Suggested Questions</SectionLabel>
              <InfoBlock>
                <div style={{ display: 'grid', gap: 8 }}>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={`${question}-${index}`}
                      onClick={() => onSuggestedQuestionClick(question)}
                      style={{
                        fontSize: 12,
                        lineHeight: 1.4,
                        color: '#d8bf9b',
                        border: '1px solid rgba(143,91,0,0.25)',
                        padding: '8px 10px',
                        background: 'rgba(90,26,13,0.12)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </InfoBlock>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 10, fontSize: 12, color: '#ff7a7a' }}>{error}</div>
      ) : null}
    </div>
  )
}

function ActiveCardPanel({
  cardName,
  exegesis,
  ritualFunction,
  keywords,
  element,
  planet,
  alchemical,
  hebrew,
  daimon,
  gematria,
}: {
  cardName: string | null
  exegesis: string | null
  ritualFunction: string | null
  keywords: string[]
  element: string | null
  planet: string | null
  alchemical: string | null
  hebrew: string | null
  daimon: string | null
  gematria: number | null
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 12,
        width: 440,
        padding: 14,
        border: '1px solid rgba(191, 123, 39, 0.35)',
        background:
          'linear-gradient(180deg, rgba(15,6,6,0.88) 0%, rgba(10,4,4,0.82) 100%)',
        color: '#ffe0a6',
        fontFamily: 'monospace',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.38)',
      }}
    >
      <SectionLabel>Active Arcanum</SectionLabel>

      {cardName ? (
        <>
          <div style={{ fontSize: 16, color: '#ffcf7c', marginBottom: 10 }}>
            {cardName}
          </div>

          {exegesis ? (
            <InfoBlock>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: '#d8bf9b' }}>
                {exegesis}
              </div>
            </InfoBlock>
          ) : null}

          {ritualFunction ? (
            <div style={{ marginTop: 10 }}>
              <SectionLabel>Ritual Function</SectionLabel>
              <InfoBlock>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: '#d8bf9b' }}>
                  {ritualFunction}
                </div>
              </InfoBlock>
            </div>
          ) : null}

          {(element || planet || alchemical || hebrew || daimon || gematria !== null) ? (
            <div style={{ marginTop: 10 }}>
              <SectionLabel>Correspondences</SectionLabel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {element ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>Element</div>
                    <div style={{ fontSize: 12 }}>{element}</div>
                  </InfoBlock>
                ) : null}

                {planet ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>Planet</div>
                    <div style={{ fontSize: 12 }}>{planet}</div>
                  </InfoBlock>
                ) : null}

                {alchemical ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>
                      Alchemical
                    </div>
                    <div style={{ fontSize: 12 }}>{alchemical}</div>
                  </InfoBlock>
                ) : null}

                {hebrew ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>Hebrew</div>
                    <div style={{ fontSize: 12 }}>{hebrew}</div>
                  </InfoBlock>
                ) : null}

                {daimon ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>Daimon</div>
                    <div style={{ fontSize: 12 }}>{daimon}</div>
                  </InfoBlock>
                ) : null}

                {gematria !== null ? (
                  <InfoBlock>
                    <div style={{ fontSize: 10, color: '#c58a53', marginBottom: 4 }}>
                      Gematria
                    </div>
                    <div style={{ fontSize: 12 }}>{gematria}</div>
                  </InfoBlock>
                ) : null}
              </div>
            </div>
          ) : null}

          {keywords.length > 0 ? (
            <div style={{ marginTop: 10 }}>
              <SectionLabel>Keywords</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {keywords.map((keyword) => (
                  <div
                    key={keyword}
                    style={{
                      padding: '5px 8px',
                      border: '1px solid rgba(143,91,0,0.35)',
                      background: 'rgba(90,26,13,0.22)',
                      fontSize: 11,
                      color: '#e6c48f',
                    }}
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <InfoBlock>
          <div style={{ fontSize: 12, lineHeight: 1.45, color: '#bfa788' }}>
            Select a card to reveal its exegesis, operative role, and correspondences.
          </div>
        </InfoBlock>
      )}
    </div>
  )
}

function CeremonyOverlay({
  visible,
}: {
  visible: boolean
}) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 11,
        pointerEvents: 'none',
        background:
          'radial-gradient(circle at center, rgba(120,20,20,0.12) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.72) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 380,
          padding: 18,
          border: '1px solid rgba(191,123,39,0.45)',
          background: 'rgba(15,5,5,0.82)',
          color: '#ffe0a6',
          fontFamily: 'monospace',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(120,20,20,0.2)',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1.8, color: '#c58a53', marginBottom: 8 }}>
          FORGING RITUAL IN PROGRESS
        </div>
        <div style={{ fontSize: 18, color: '#ffcf7c', marginBottom: 8 }}>
          Inscribing the Arcanum
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: '#d8bf9b' }}>
          The chamber is aligning correspondences, tempering names, and arranging the deck.
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [isVR, setIsVR] = useState(false)
  const engine = useGrimoireEngine()

  const activeKeywords = useMemo(
    () => engine.focusedCard?.metadata.keywords ?? [],
    [engine.focusedCard],
  )

  const handleEnterVR = async () => {
    try {
      await xrStore.enterVR()
    } catch (err) {
      console.error('Failed to enter VR', err)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {!isVR && (
        <button
          onClick={handleEnterVR}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 10,
            padding: '12px 16px',
            background: '#120000',
            color: '#ff3b3b',
            border: '1px solid #ff3b3b',
            fontFamily: 'monospace',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(255,0,0,0.35)',
          }}
        >
          Enter VR
        </button>
      )}

      {!isVR && (
        <>
          <RitualControlPanel
            subject={engine.subject}
            tradition={engine.tradition}
            tone={engine.tone}
            techLevel={engine.techLevel}
            intent={engine.intent}
            onSubjectChange={engine.setSubject}
            onTraditionChange={engine.setTradition}
            onToneChange={engine.setTone}
            onTechLevelChange={engine.setTechLevel}
            onIntentChange={engine.setIntent}
            onSuggestedQuestionClick={engine.setIntent}
            onBegin={engine.beginRitual}
            onClear={engine.clearRitual}
            loading={engine.loading}
            phase={engine.forgePhase}
            error={engine.error}
            deckName={engine.deck?.name ?? null}
            dossierSummary={engine.dossier?.summary ?? null}
            omen={engine.dossier?.omen ?? null}
            archetype={engine.dossier?.archetype ?? null}
            magicalDiagnosis={engine.dossier?.magicalDiagnosis ?? null}
            operativeAdvice={engine.dossier?.operativeAdvice ?? null}
            suggestedQuestions={engine.dossier?.suggestedQuestions ?? []}
          />

          <ActiveCardPanel
            cardName={engine.focusedCard?.name ?? null}
            exegesis={engine.focusedCard?.exegesis ?? null}
            ritualFunction={engine.focusedCard?.ritualFunction ?? null}
            keywords={activeKeywords}
            element={engine.focusedCard?.metadata.element ?? null}
            planet={engine.focusedCard?.metadata.planet ?? null}
            alchemical={engine.focusedCard?.metadata.alchemical ?? null}
            hebrew={engine.focusedCard?.metadata.hebrew ?? null}
            daimon={engine.focusedCard?.metadata.daimon ?? null}
            gematria={engine.focusedCard?.metadata.gematria ?? null}
          />
        </>
      )}

      <CeremonyOverlay visible={!isVR && engine.loading} />

      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <XR store={xrStore}>
          <XRSessionBridge onVRChange={setIsVR} />

          <color attach="background" args={['#050000']} />
          <fog attach="fog" args={['#050000', 4, 15]} />

          <hemisphereLight intensity={1.2} groundColor="#110000" color="#aa2222" />
          <pointLight position={[0, 2.5, -1.5]} intensity={15} color="#ffcc88" distance={10} />

          <RitualChamberScene
            cards={engine.cards}
            selectedCardId={engine.selection.focusedCardId}
            altarCard={engine.altarCard}
            onCardActivate={(card) => engine.activateCard(card.id)}
            onAltarLanding={engine.acknowledgeAltarLanding}
          />
        </XR>

        {!isVR && <OrbitControls target={[0, 1.2, -1.5]} />}
      </Canvas>
    </div>
  )
}
