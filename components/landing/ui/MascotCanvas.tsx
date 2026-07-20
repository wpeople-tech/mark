'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/cat+character+3d+model.glb'
const FALLBACK_URL = '/mark-image.png'

interface Tilt {
  deg: number
  tx: number
  ty: number
}

interface MascotCanvasProps {
  tilt: Tilt
}

function Model({ tilt, onLoad }: { tilt: Tilt; onLoad: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  useEffect(() => {
    if (scene) {
      onLoad()
    }
  }, [scene, onLoad])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = Math.sin(t * 1.6) * 0.06 - 0.5
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      tilt.deg * 0.025,
      0.1
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -tilt.ty * 0.015,
      0.1
    )
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      tilt.tx * 0.01,
      0.1
    )
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    camera.lookAt(0, 0, 0)
  })
  return null
}

function FallbackImage({ tilt, visible }: { tilt: Tilt; visible: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
      style={{
        transform: `rotate(${tilt.deg}deg) translate(${tilt.tx}px, ${tilt.ty}px) scale(1.04)`,
        animation: 'rktF 4s ease-in-out infinite',
        filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.12))',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <img
        src={FALLBACK_URL}
        alt="MARK mascot"
        className="w-full h-auto block"
      />
    </div>
  )
}

export function MascotCanvas({ tilt }: MascotCanvasProps) {
  const [modelLoaded, setModelLoaded] = useState(false)

  return (
    <div
      className="relative w-full aspect-[3/4]"
      style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.12))' }}
    >
      <FallbackImage tilt={tilt} visible={!modelLoaded} />
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0.2, 2.0], fov: 36 }}
        >
          <CameraRig />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[3, 4, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-3, 2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Model tilt={tilt} onLoad={() => setModelLoaded(true)} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
