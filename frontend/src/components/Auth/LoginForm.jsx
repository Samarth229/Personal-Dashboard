import { useState } from 'react';
import { requestLoginOTP, verifyOTPLogin } from '../../services/authAPI';
import useAuth from '../../hooks/useAuth';
import OTPVerification from './OTPVerification';

const LoginForm = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await requestLoginOTP(email);
      if (data.dev_otp) setDevOtp(data.dev_otp);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    const { data } = await verifyOTPLogin(email, otp);
    login(data.token, data.refreshToken, data.user);
  };

  if (step === 'otp') {
    return <OTPVerification email={email} onVerify={handleOTPVerify} devOtp={devOtp} />;
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <label className="label">Email address</label>
        <input
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Send Login Code'}
      </button>
    </form>
  );
};

export default LoginForm;
