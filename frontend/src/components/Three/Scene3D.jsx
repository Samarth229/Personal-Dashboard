import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const Scene3D = ({ children, height = 280, style = {} }) => (
  <div style={{ height, background: '#000', borderRadius: 28, overflow: 'hidden', cursor: 'grab', ...style }}>
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  </div>
);

export default Scene3D;
