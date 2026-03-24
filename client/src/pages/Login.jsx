import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Login attempt:', { email, password }); // DEBUG
    console.log('API URL:', API); // DEBUG
    
    if (!email || !password) {
      const msg = 'Email and password are required';
      setError(msg);
      console.error(msg);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Sending login request to:', `${API}/api/users/login`); // DEBUG
      const res = await axios.post(`${API}/api/users/login`, { email, password });
      console.log('Login response:', res.data); // DEBUG
      login(res.data);
      navigate('/chat');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      console.error('Login error:', { 
        status: err.response?.status,
        data: err.response?.data,
        message: err.message 
      }); // DEBUG
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">💬</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              disabled={loading} 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              disabled={loading} 
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
