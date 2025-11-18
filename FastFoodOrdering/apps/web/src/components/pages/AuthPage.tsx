// apps/web/src/components/pages/AuthPage.tsx
import React, { useState } from 'react';
import '../../styles/AuthPage.css';
import { useAppState, UserRole } from '../../hooks/useAppState';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../../services/api';

interface LocationState {
  from?: { pathname: string };
}

function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';

  // ──────────────────────────────────────────────────────
  // HANDLE LOGIN
  // ──────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const { token, user: apiUser } = data;

      const fullUser = {
        id: apiUser.user_id.toString(),
        email: apiUser.email,
        name: apiUser.full_name,
        role: apiUser.role as UserRole,
        token,
      };

      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);

      // Redirect based on role
      const redirectTo =
        fullUser.role === 'admin'
          ? '/admin'
          : fullUser.role === 'owner'
          ? '/owner' // future
          : from;

      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // HANDLE REGISTER
  // ──────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await register(fullName, email, password);

      // Auto-login after register
      const loginData = await login(email, password);
      const { token, user: apiUser } = loginData;

      const fullUser = {
        id: apiUser.user_id.toString(),
        email: apiUser.email,
        name: apiUser.full_name,
        role: apiUser.role as UserRole,
        token,
      };

      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome to FoodieExpress</h2>

        <div className="tabs">
          <button
            type="button"
            className={activeTab === 'signin' ? 'active' : ''}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={activeTab === 'signup' ? 'active' : ''}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="divider">or</div>
            <button type="button" className="social-btn" disabled>
              Sign in with Google
            </button>
            <button type="button" className="social-btn" disabled>
              Sign in with Facebook
            </button>
          </form>
        )}

        {/* SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div className="name-fields">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;