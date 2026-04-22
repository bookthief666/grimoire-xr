import { Canvas } from '@react-three/fiber'
import { XR, createXRStore, useXR } from '@react-three/xr'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
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

export default function App() {
  const [isVR, setIsVR] = useState(false)

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

      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <XR store={xrStore}>
          <XRSessionBridge onVRChange={setIsVR} />

          <color attach="background" args={['#050000']} />
          <fog attach="fog" args={['#050000', 4, 15]} />

          <hemisphereLight intensity={1.2} groundColor="#110000" color="#aa2222" />
          <pointLight position={[0, 2.5, -1.5]} intensity={15} color="#ffcc88" distance={10} />

          <RitualChamberScene />
        </XR>

        {!isVR && <OrbitControls target={[0, 1.2, -1.5]} />}
      </Canvas>
    </div>
  )
}
