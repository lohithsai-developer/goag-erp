import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      setCurrentUser(result.user);
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f4f0'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#065F46' }}>GOAG ERP</h1>
        <p style={{ textAlign: 'center', color: '#6B7280' }}>Login to your account</p>

        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '10px',
            borderRadius: '8px',
            margin: '16px 0'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '8px 0',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9CA3AF' : '#065F46',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              marginTop: '16px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginTop: '16px' }}>
          admin@goag.com / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;
