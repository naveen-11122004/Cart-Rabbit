import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [done, setDone] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Step 1 — Register, receive OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.email || !formData.password)
      return setError('All fields are required');
    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match');
    if (formData.password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await axios.post(`${API}/api/users/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setPendingEmail(formData.email);
      setStep(2);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
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
    if (code.length < 6) return setError('Please enter the full 6-digit OTP');
    setLoading(true);
    try {
      await axios.post(`${API}/api/users/verify-registration-otp`, {
        email: pendingEmail,
        otp: code,
      });
      setDone(true);
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
      await axios.post(`${API}/api/users/resend-otp`, { email: pendingEmail, purpose: 'registration' });
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (done) {
    return (
      <div className="auth-container">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1>You're all set!</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Email verified successfully. You can now log in.
          </p>
          <Link to="/login" className="submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">💬</div>

        {step === 1 ? (
          <>
            <h1>Create Account</h1>
            <p className="auth-subtitle">Join the conversation</p>
            <form onSubmit={handleRegisterSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" value={formData.username}
                  onChange={handleChange} placeholder="Choose a username" disabled={loading} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="Enter your email" disabled={loading} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="Min 6 characters" disabled={loading} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="Repeat your password" disabled={loading} />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Send OTP'}
              </button>
            </form>
            <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
          </>
        ) : (
          <>
            <h1>Verify Email</h1>
            <p className="auth-subtitle">
              We sent a 6-digit code to<br />
              <strong>{pendingEmail}</strong>
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
                {loading ? <span className="btn-spinner" /> : 'Verify & Register'}
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

export default Register;
