import { Link } from 'react-router-dom';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SignupForm from '../components/Auth/SignupForm';
import { AuthScene } from '../components/Three/ServiceScenes';

const SignupPage = () => (
  <div className="min-h-screen flex" style={{ background: '#000' }}>
    {/* Left: 3D canvas */}
    <div className="hidden lg:flex flex-1 relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <Suspense fallback={null}><AuthScene /></Suspense>
      </Canvas>
      <div className="absolute bottom-10 left-10">
        <p className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Personal Hub
        </p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          All your data, one place.
        </p>
      </div>
    </div>

    {/* Right: form */}
    <div className="w-full lg:w-[440px] flex-shrink-0 flex items-center justify-center px-8 py-12"
      style={{ background: '#f5f5f7' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #0071e3, #34aadc)', boxShadow: '0 4px 16px rgba(0,113,227,0.3)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1d1d1f', letterSpacing: '-0.03em' }}>
            Create your hub
          </h1>
          <p className="text-sm mt-1" style={{ color: '#707070' }}>Connect all your data in one place</p>
        </div>

        <div className="card" style={{ borderRadius: 18 }}>
          <SignupForm />
          <p className="text-center text-sm mt-5" style={{ color: '#aeaeb2' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium transition-colors" style={{ color: '#0071e3' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0077ed'}
              onMouseLeave={e => e.currentTarget.style.color = '#0071e3'}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SignupPage;
