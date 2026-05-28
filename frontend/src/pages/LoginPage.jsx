import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { AuthScene } from '../components/Three/ServiceScenes';

const LoginPage = () => {
  const { login } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email.');
    if (email !== confirmEmail) return setError('Emails do not match.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email: email.toLowerCase() });
      setIsNewUser(data.isNewUser);
      if (data.dev_otp) setDevOtp(data.dev_otp);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: email.toLowerCase(),
        otp_code: otp,
        mode: isNewUser ? 'signup' : 'login',
      });
      login(data.token, data.refreshToken, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)', color: '#fff',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
    marginBottom: 12,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true }}
        style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}><AuthScene /></Suspense>
      </Canvas>

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          width: '100%', maxWidth: 380,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '40px 36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #0071e3, #34aadc)',
              boxShadow: '0 8px 24px rgba(0,113,227,0.45)',
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Email step */}
          {step === 'email' && (
            <>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 6 }}>
                Welcome
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
                Enter your email to sign in or create an account
              </p>

              {error && (
                <div style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6, display: 'block' }}>
                  Email address
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  autoFocus
                />
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6, display: 'block' }}>
                  Confirm email address
                </label>
                <input
                  type="email" value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ ...inputStyle, marginBottom: 20 }}
                />
                <button
                  type="submit"
                  disabled={loading || !email || !confirmEmail}
                  style={{
                    width: '100%', padding: '13px 20px', borderRadius: 14,
                    background: email && confirmEmail ? '#0071e3' : 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: loading || !email || !confirmEmail ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? 'Sending code...' : 'Send verification code'}
                </button>
              </form>

              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
                Your data stays private and secure
              </p>
            </>
          )}

          {/* OTP step */}
          {step === 'otp' && (
            <>
              <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 6 }}>
                Check your email
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
                We sent a 6-digit code to<br />
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{email}</span>
              </p>

              {devOtp && import.meta.env.DEV && (
                <div style={{ background: 'rgba(0,113,227,0.15)', border: '1px solid rgba(0,113,227,0.3)', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                  <p style={{ color: '#60a5fa', fontSize: 12, textAlign: 'center', margin: 0 }}>Dev mode — OTP: <strong>{devOtp}</strong></p>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                  <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleOtpSubmit}>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)', color: '#fff',
                    fontSize: 28, fontWeight: 700, textAlign: 'center',
                    letterSpacing: 10, outline: 'none', marginBottom: 16,
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  style={{
                    width: '100%', padding: '13px 20px', borderRadius: 14,
                    background: otp.length === 6 ? '#0071e3' : 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: otp.length !== 6 || loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>

              <button
                onClick={() => { setStep('email'); setOtp(''); setError(''); setDevOtp(null); }}
                style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}
              >
                ← Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
