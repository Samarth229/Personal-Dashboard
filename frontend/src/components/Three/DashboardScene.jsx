import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* Service planets — color matches brand */
const PLANETS = [
  { color: '#1DB954', emissive: '#0a3d1a', radius: 3.2, size: 0.22, speed: 0.18, phase: 0,    inclination: 0.18 },   // Spotify
  { color: '#a78bfa', emissive: '#2d1a5e', radius: 4.6, size: 0.28, speed: 0.12, phase: 1.05, inclination: -0.1 },  // GitHub
  { color: '#f87171', emissive: '#4a1010', radius: 2.5, size: 0.18, speed: 0.26, phase: 2.1,  inclination: 0.25 },   // Gmail
  { color: '#fb923c', emissive: '#4a1f00', radius: 5.5, size: 0.20, speed: 0.09, phase: 3.14, inclination: -0.2 },  // Letterboxd
  { color: '#66C0F4', emissive: '#0a2a40', radius: 3.9, size: 0.24, speed: 0.15, phase: 4.19, inclination: 0.12 },  // Steam
  { color: '#fbbf24', emissive: '#4a2d00', radius: 6.2, size: 0.26, speed: 0.07, phase: 5.24, inclination: -0.15 }, // Riot
];

const StarField = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 12 + Math.random() * 18;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={2000} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

const NebulaCloud = ({ color, position, scale }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * scale;
      arr[i * 3 + 1] = (Math.random() - 0.5) * scale * 0.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * scale * 0.6;
    }
    return arr;
  }, [scale]);
  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={300} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={color} transparent opacity={0.06} sizeAttenuation />
    </points>
  );
};

/* Sun — glowing central sphere */
const Sun = () => {
  const ref = useRef();
  const glowRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.08;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04);
    }
  });
  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshBasicMaterial color="#fff5cc" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color="#fffde7" emissive="#ffcc00" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
};

/* Orbital ring */
const OrbitalRing = ({ radius, inclination }) => (
  <mesh rotation={[Math.PI / 2 + inclination, 0, 0]}>
    <torusGeometry args={[radius, 0.006, 4, 180]} />
    <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
  </mesh>
);

/* Planet with moons / rings for some */
const Planet = ({ color, emissive, radius, size, speed, phase, inclination }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * Math.tan(inclination);
    ref.current.rotation.y += 0.012;
    ref.current.rotation.x = inclination * 0.5;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} roughness={0.6} metalness={0.1} />
    </mesh>
  );
};

const DashboardScene = () => {
  const groupRef = useRef();
  const { mouse } = useThree();
  useFrame(() => {
    groupRef.current.rotation.x += (mouse.y * -0.15 - groupRef.current.rotation.x) * 0.025;
    groupRef.current.rotation.y += (mouse.x * 0.2  - groupRef.current.rotation.y) * 0.02;
  });

  return (
    <>
      <color attach="background" args={['#00000f']} />
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 0, 0]} intensity={8} color="#fffde7" distance={20} decay={2} />
      <pointLight position={[8, 6, 4]} intensity={0.4} color="#4466ff" />
      <pointLight position={[-8, -4, -6]} intensity={0.3} color="#ff6644" />

      <StarField />
      <NebulaCloud color="#4466ff" position={[6, 2, -8]} scale={12} />
      <NebulaCloud color="#ff4466" position={[-7, -3, -6]} scale={10} />
      <NebulaCloud color="#44ffaa" position={[0, 5, -10]} scale={8} />

      <group ref={groupRef}>
        <Sun />
        {PLANETS.map((p, i) => (
          <group key={i}>
            <OrbitalRing radius={p.radius} inclination={p.inclination} />
            <Planet {...p} />
          </group>
        ))}
      </group>
    </>
  );
};

export default DashboardScene;
