import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Step 1 — Send credentials, get OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/users/login`, { email, password });
      setStep(2);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // OTP input navigation
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Step 2 — Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/users/verify-login-otp`, { email, otp: code });
      login(res.data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await axios.post(`${API}/api/users/resend-otp`, { email, purpose: 'login' });
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">💬</div>

        {step === 1 ? (
          <>
            <h1>Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue</p>
            <form onSubmit={handleCredentialsSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" disabled={loading} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" disabled={loading} />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Continue'}
              </button>
            </form>
            <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
          </>
        ) : (
          <>
            <h1>Verify OTP</h1>
            <p className="auth-subtitle">
              We sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>
            <form onSubmit={handleOtpSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                  />
                ))}
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Verify & Login'}
              </button>
            </form>
            <div className="otp-footer">
              <span>Didn't receive the code?</span>
              <button className="resend-btn" onClick={handleResend} disabled={resendCooldown > 0}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
            <button className="back-btn" onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}>
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
