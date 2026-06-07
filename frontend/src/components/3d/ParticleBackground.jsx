// components/3d/ParticleBackground.jsx
// Lightweight GPU-rendered particle field using React Three Fiber.
// Fixed behind all content — pointer-events disabled so it never
// blocks clicks. Particles rotate slowly on two axes.
// Performance notes:
//   - PointMaterial is a single draw call regardless of particle count
//   - depthWrite false prevents sorting overhead
//   - frustumCulled false avoids per-frame bounding calculations

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

function Particles () {
  const ref = useRef()

  // Generate particles in a sphere distribution
  const positions = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Uniform sphere distribution using spherical coordinates
      const r = 1.6 * Math.cbrt(Math.random()) // cube root for uniform volume
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  // Rotate the field — GPU transform, zero JS cost after first frame
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x -= delta * 0.035
    ref.current.rotation.y -= delta * 0.055
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color='#a78bfa'
        size={0.0045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  )
}

function FloatingOrb ({ position, color, amplitude = 0.25, speed = 0.8 }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    // Float up and down — sine wave on Y axis only
    ref.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * speed) * amplitude
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function ParticleBackground () {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none' // never intercepts clicks
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 60 }}
        gl={{ antialias: false, alpha: true }} // alpha for transparent bg
        dpr={Math.min(window.devicePixelRatio, 1.5)} // cap at 1.5x for perf
      >
        <ambientLight intensity={0.4} />
        <Particles />
        <FloatingOrb position={[-1.3, 0.4, 0]} color='#7c3aed' speed={0.7} />
        <FloatingOrb position={[1.3, -0.3, 0]} color='#db2777' speed={1.0} />
        <FloatingOrb position={[0, 0.8, -0.8]} color='#f97316' speed={0.5} />
        <FloatingOrb position={[-0.8, -0.7, 0.5]} color='#06b6d4' speed={0.9} />
      </Canvas>
    </div>
  )
}
