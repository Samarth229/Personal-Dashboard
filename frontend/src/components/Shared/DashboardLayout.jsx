import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Canvas } from '@react-three/fiber';
import api from '../../services/api';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, scene }) => {
  const { data: sources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => api.get('/data-sources').then((r) => r.data.sources || []),
    staleTime: 30 * 1000,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative' }}>
      {/* Full-page 3D background — fixed so it stays while content scrolls */}
      {scene && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
            <Suspense fallback={null}>{scene}</Suspense>
          </Canvas>
        </div>
      )}

      {/* UI layer — isolation:isolate creates a new stacking context above the WebGL canvas */}
      <div style={{ position: 'relative', zIndex: 1, isolation: 'isolate', transform: 'translateZ(0)', display: 'flex', minHeight: '100vh' }}>
        <Sidebar sources={sources} />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-6 page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
