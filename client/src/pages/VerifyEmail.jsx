import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/verify-email/${token}`
        );
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Email Verification</h1>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {status === 'verifying' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#4CAF50' }}>✓</div>
              <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>{message}</p>
              <Link to="/login" style={{ marginTop: '20px', display: 'block', color: '#007bff' }}>
                Go to Login
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#f44336' }}>✗</div>
              <p style={{ color: '#f44336' }}>{message}</p>
              <Link to="/register" style={{ marginTop: '20px', display: 'block', color: '#007bff' }}>
                Register Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
