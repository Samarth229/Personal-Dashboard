import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Shared helpers ─── */
const ParticleField = ({ count = 700, color = '#ffffff', spread = 12, size = 0.022, opacity = 0.35 }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
};

/* ─── SPOTIFY ─── Vinyl record + pulsing sound rings */
const SpotifyVinyl = () => {
  const groupRef = useRef();
  const ringsRef = useRef([]);
  const { mouse } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.45;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12 + mouse.y * 0.18;
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      ring.scale.setScalar(1 + Math.sin(t * 1.8 + i * 0.75) * 0.065);
    });
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.3, 0.17, 16, 100]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={0.55} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 32]} />
        <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={2} />
      </mesh>
      {[1.7, 2.4, 3.2, 4.1].map((r, i) => (
        <mesh key={i} ref={el => ringsRef.current[i] = el}>
          <torusGeometry args={[r, 0.022, 8, 80]} />
          <meshBasicMaterial color="#1DB954" transparent opacity={0.1 + i * 0.038} />
        </mesh>
      ))}
    </group>
  );
};
export const SpotifyScene = () => (
  <>
    <color attach="background" args={['#010e05']} />
    <ambientLight intensity={0.1} />
    <pointLight position={[0, 0, 3]} intensity={3} color="#1DB954" />
    <pointLight position={[4, 3, 2]} intensity={0.4} color="#ffffff" />
    <ParticleField color="#1DB954" count={800} spread={14} />
    <SpotifyVinyl />
  </>
);

/* ─── GITHUB ─── Matrix code-rain columns (all at z=-2.5…-5, never in front of cards) */
const GitHubCodeRain = () => {
  const pointsRef = useRef();
  const { count, pos, vel } = useMemo(() => {
    const cols = 42;
    const rowsPerCol = 28;
    const n = cols * rowsPerCol;
    const p = new Float32Array(n * 3);
    const v = new Float32Array(n);
    for (let c = 0; c < cols; c++) {
      for (let row = 0; row < rowsPerCol; row++) {
        const i = c * rowsPerCol + row;
        p[i * 3]     = (c / (cols - 1) - 0.5) * 15;
        p[i * 3 + 1] = (Math.random() - 0.5) * 11;
        p[i * 3 + 2] = -2.5 - Math.random() * 2.5;
        v[i] = 0.005 + Math.random() * 0.009;
      }
    }
    return { count: n, pos: p, vel: v };
  }, []);

  useFrame(() => {
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= vel[i];
      if (arr[i * 3 + 1] < -5.5) arr[i * 3 + 1] = 5.5 + Math.random();
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#a78bfa" transparent opacity={0.48} sizeAttenuation />
    </points>
  );
};
export const GitHubScene = () => (
  <>
    <color attach="background" args={['#020109']} />
    <ambientLight intensity={0.05} />
    <pointLight position={[0, 2, 1]} intensity={1.2} color="#a78bfa" />
    <ParticleField color="#a78bfa" count={900} spread={18} size={0.016} opacity={0.26} />
    <GitHubCodeRain />
  </>
);

/* ─── GMAIL ─── Flying paper airplane */
const PaperPlane = () => {
  const groupRef = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = new Float32Array([
       0,    0,   1.3,
      -0.9,  0,  -0.8,
       0.9,  0,  -0.8,
       0,   -0.3,-0.3,
       0,    0.5,-0.8,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    g.setIndex([0,1,3, 0,3,2, 0,1,4, 0,4,2, 1,4,3, 4,2,3]);
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current.position.x = Math.sin(t * 0.45) * 1.6;
    groupRef.current.position.y = Math.cos(t * 0.28) * 0.9;
    groupRef.current.position.z = Math.sin(t * 0.35) * 0.7;
    groupRef.current.rotation.y = t * 0.35 + Math.sin(t * 0.2) * 0.3;
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.18;
  });
  return (
    <group ref={groupRef} scale={1.4}>
      <mesh geometry={geo} side={THREE.DoubleSide}>
        <meshStandardMaterial color="#ffffff" emissive="#ffcccc" emissiveIntensity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
export const GmailScene = () => (
  <>
    <color attach="background" args={['#0d0202']} />
    <ambientLight intensity={0.12} />
    <pointLight position={[0, 0, 3]} intensity={2.5} color="#f87171" />
    <pointLight position={[-3, 2, 1]} intensity={0.5} color="#ffffff" />
    <ParticleField color="#f87171" count={700} spread={12} />
    <PaperPlane />
  </>
);

/* ─── LETTERBOXD ─── Film reel */
const FilmReel = () => {
  const groupRef = useRef();
  const { mouse } = useThree();
  const holes = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return [Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0];
  }), []);
  useFrame(({ clock }) => {
    groupRef.current.rotation.z = clock.elapsedTime * 0.4;
    groupRef.current.rotation.y = mouse.x * 0.35 + Math.sin(clock.elapsedTime * 0.25) * 0.1;
    groupRef.current.rotation.x = mouse.y * 0.3;
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.85, 0.24, 8, 64]} />
        <meshStandardMaterial color="#FF8000" emissive="#FF8000" emissiveIntensity={0.4} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.13, 8, 32]} />
        <meshStandardMaterial color="#FF8000" emissive="#FF8000" emissiveIntensity={0.9} />
      </mesh>
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} rotation={[0, 0, (i / 4) * Math.PI]}>
          <boxGeometry args={[0.06, 2.7, 0.05]} />
          <meshStandardMaterial color="#FF8000" emissive="#FF8000" emissiveIntensity={0.25} transparent opacity={0.5} />
        </mesh>
      ))}
      {holes.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
};
export const LetterboxdScene = () => (
  <>
    <color attach="background" args={['#0a0400']} />
    <ambientLight intensity={0.1} />
    <pointLight position={[0, 0, 3]} intensity={2.5} color="#FF8000" />
    <pointLight position={[3, 3, 0]} intensity={0.4} color="#ffffff" />
    <ParticleField color="#FF8000" count={600} spread={12} />
    <FilmReel />
  </>
);

/* ─── STEAM ─── Rising steam particles + wireframe sphere */
const SteamParticles = ({ count = 450 }) => {
  const pointsRef = useRef();
  const { pos, vel } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i*3]   = (Math.random() - 0.5) * 4;
      p[i*3+1] = (Math.random() - 0.5) * 4;
      p[i*3+2] = (Math.random() - 0.5) * 2.5;
      v[i] = 0.003 + Math.random() * 0.005;
    }
    return { pos: p, vel: v };
  }, [count]);
  useFrame(() => {
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i*3+1] += vel[i];
      arr[i*3]   += Math.sin(arr[i*3+1] * 2) * 0.001;
      if (arr[i*3+1] > 2.5) {
        arr[i*3+1] = -2.5;
        arr[i*3]   = (Math.random() - 0.5) * 4;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#66C0F4" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};
const SteamGlobe = () => {
  const ref = useRef();
  useFrame(({ clock }) => { ref.current.rotation.y = clock.elapsedTime * 0.28; ref.current.rotation.x = clock.elapsedTime * 0.1; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.75, 32, 32]} />
      <meshStandardMaterial color="#66C0F4" emissive="#66C0F4" emissiveIntensity={0.25} wireframe />
    </mesh>
  );
};
export const SteamScene = () => (
  <>
    <color attach="background" args={['#00090f']} />
    <ambientLight intensity={0.12} />
    <pointLight position={[0, 2, 3]} intensity={2.5} color="#66C0F4" />
    <pointLight position={[3, -2, 0]} intensity={0.4} color="#ffffff" />
    <SteamParticles />
    <SteamGlobe />
  </>
);

/* ─── RIOT ─── Hexagonal crystal + orbiting satellites */
const RiotCrystal = () => {
  const groupRef = useRef();
  const satsRef = useRef([]);
  const { mouse } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.18 + mouse.x * 0.3;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15 + mouse.y * 0.2;
    satsRef.current.forEach((s, i) => {
      if (!s) return;
      const a = t * 0.55 + (i / 6) * Math.PI * 2;
      s.position.x = Math.cos(a) * 2.1;
      s.position.z = Math.sin(a) * 2.1;
      s.position.y = Math.sin(a * 0.6) * 0.6;
      s.rotation.x = t * 0.9;
      s.rotation.y = t * 0.6;
    });
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.85, 0.85, 1.7, 6]} />
        <meshStandardMaterial color="#C89B3C" emissive="#C89B3C" emissiveIntensity={0.45} wireframe />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.2} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={el => satsRef.current[i] = el}>
          <tetrahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#C89B3C" emissive="#C89B3C" emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  );
};
export const RiotScene = () => (
  <>
    <color attach="background" args={['#06040a']} />
    <ambientLight intensity={0.08} />
    <pointLight position={[0, 0, 3]} intensity={3} color="#C89B3C" />
    <pointLight position={[3, 3, 0]} intensity={0.4} color="#ffffff" />
    <ParticleField color="#C89B3C" count={700} spread={13} size={0.024} opacity={0.38} />
    <RiotCrystal />
  </>
);

/* ─── AUTH ─── Abstract floating shapes for login/signup */
const FloatingShape = ({ position, type, size, color, speed, wireframe = false }) => {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 0.25;
    ref.current.rotation.x = t * 0.6;
    ref.current.rotation.y = t * 0.45;
  });
  const geo = type === 'icosahedron' ? <icosahedronGeometry args={[size, 0]} />
            : type === 'octahedron'  ? <octahedronGeometry  args={[size, 0]} />
            :                          <tetrahedronGeometry args={[size, 0]} />;
  return (
    <mesh ref={ref} position={position}>
      {geo}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={wireframe ? 0.3 : 0.4} wireframe={wireframe} transparent opacity={0.75} />
    </mesh>
  );
};
export const AuthScene = () => {
  const { mouse } = useThree();
  const groupRef = useRef();
  useFrame(() => {
    groupRef.current.rotation.x += (mouse.y * -0.15 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.y += (mouse.x * 0.2  - groupRef.current.rotation.y) * 0.04;
  });
  return (
    <>
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#0071e3" />
      <pointLight position={[-4, -3, -2]} intensity={0.6} color="#ffffff" />
      <ParticleField count={1400} color="#ffffff" spread={22} size={0.016} opacity={0.28} />
      <group ref={groupRef}>
        <FloatingShape position={[-3.2,  1.0, -2.5]} type="icosahedron" size={0.6}  color="#0071e3" speed={0.28} />
        <FloatingShape position={[ 3.0, -1.0, -3.0]} type="octahedron"  size={0.45} color="#ffffff" speed={0.22} wireframe />
        <FloatingShape position={[ 0.5,  2.5, -4.0]} type="tetrahedron" size={0.5}  color="#60a5fa" speed={0.32} />
        <FloatingShape position={[-2.0, -2.2, -2.0]} type="icosahedron" size={0.35} color="#a78bfa" speed={0.38} wireframe />
        <FloatingShape position={[ 2.5,  1.8, -1.5]} type="octahedron"  size={0.28} color="#ffffff" speed={0.25} />
        <FloatingShape position={[-1.0,  0.5, -5.0]} type="tetrahedron" size={0.7}  color="#0071e3" speed={0.18} wireframe />
      </group>
    </>
  );
};
