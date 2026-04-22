import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR, createXRStore, useXR } from '@react-three/xr'
import { useEffect, useState } from 'react'
import { useGrimoireEngine } from './engine/useGrimoireEngine'
import { RitualChamberScene } from './scene/RitualChamberScene'
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

function RitualInitiationPanel({
  subject,
  onSubjectChange,
  onBegin,
  loading,
  phase,
  error,
  deckName,
  dossierSummary,
}: {
  subject: string
  onSubjectChange: (subject: string) => void
  onBegin: () => Promise<void>
  loading: boolean
  phase: string
  error: string | null
  deckName: string | null
  dossierSummary: string | null
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 12,
        width: 340,
        padding: 14,
        border: '1px solid #8f5b00',
        background: 'rgba(12, 4, 4, 0.84)',
        color: '#ffe0a6',
        fontFamily: 'monospace',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: 1.2 }}>
        RITUAL FORGE INITIATION
      </div>

      <input
        value={subject}
        onChange={(event) => onSubjectChange(event.target.value)}
        placeholder="Enter ritual subject"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 8,
          padding: '8px 10px',
          background: '#120707',
          border: '1px solid #6a2b10',
          color: '#ffe0a6',
        }}
      />

      <button
        onClick={() => void onBegin()}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: loading ? '#35140b' : '#5a1a0d',
          color: '#ffe0a6',
          border: '1px solid #d94e16',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Forging…' : 'Begin Ritual'}
      </button>

      <div style={{ marginTop: 8, fontSize: 12, color: '#d89b6b' }}>
        Forge phase: {phase}
      </div>

      {deckName ? (
        <div style={{ marginTop: 6, fontSize: 12, color: '#ffb000' }}>
          Active deck: {deckName}
        </div>
      ) : null}

      {dossierSummary ? (
        <div style={{ marginTop: 8, fontSize: 12, color: '#d89b6b', lineHeight: 1.4 }}>
          {dossierSummary}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 6, fontSize: 12, color: '#ff7a7a' }}>{error}</div>
      ) : null}
    </div>
  )
}

export default function App() {
  const [isVR, setIsVR] = useState(false)
  const engine = useGrimoireEngine()

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
        <RitualInitiationPanel
          subject={engine.subject}
          onSubjectChange={engine.setSubject}
          onBegin={engine.beginRitual}
          loading={engine.loading}
          phase={engine.forgePhase}
          error={engine.error}
          deckName={engine.deck?.name ?? null}
          dossierSummary={engine.dossier?.summary ?? null}
        />
      )}

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
