import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerification = ({ email, onVerify, requirePassword = false, devOtp = null }) => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill the OTP in dev mode
  useEffect(() => {
    if (devOtp) setOtp(devOtp);
  }, [devOtp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onVerify(otp, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-gray-400 text-sm">
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      {/* Dev mode banner — shown when no email is configured */}
      {devOtp && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">
            Dev Mode — Email not configured
          </p>
          <p className="text-amber-300 text-xs mb-3">
            Your OTP code (auto-filled below):
          </p>
          <div className="text-3xl font-bold tracking-[0.4em] text-amber-300 font-mono">
            {devOtp}
          </div>
          <p className="text-amber-500 text-xs mt-2">
            Add EMAIL_USER + EMAIL_PASSWORD to .env to send real emails
          </p>
        </div>
      )}

      <div>
        <label className="label">Verification Code</label>
        <input
          type="text"
          className="input text-center text-2xl tracking-widest font-mono"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>

      {requirePassword && (
        <div>
          <label className="label">Create Password</label>
          <input
            type="password"
            className="input"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>
    </form>
  );
};

export default OTPVerification;
