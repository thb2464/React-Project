// apps/web/src/components/pages/AuthPage.tsx
import React, { useState } from 'react';
import '../../styles/AuthPage.css';
import { useAppState, User } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const { setUser } = useAppState();
const navigate = useNavigate();

const handleSignIn = (e: React.FormEvent) => {
  e.preventDefault();
  if (email === 'admin@foodie.com' && password === 'admin123') {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@foodie.com',
      name: 'Admin User',
      role: 'admin',
    };
    setUser(adminUser);
    navigate('/admin'); // ← MUST BE HERE
    return;
  }

    if (email && password) {
      const user: User = {
        id: 'user-1',
        email,
        name: firstName || 'User',
        role: 'customer',
      };
      setUser(user);
      alert('Signed in as customer!');
      navigate('/');
      return;
    }

    alert('Invalid credentials. Use admin@foodie.com / admin123 for admin.');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email,
      name: `${firstName} ${lastName}`.trim(),
      role: 'customer',
    };
    setUser(user);
    alert('Account created! Welcome!');
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome to FoodieExpress</h2>
        <div className="tabs">
          <button
            className={activeTab === 'signin' ? 'active' : ''}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            className={activeTab === 'signup' ? 'active' : ''}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">
              Sign In
            </button>
            <div className="divider">or</div>
            <button type="button" className="social-btn">
              Sign in with Google
            </button>
            <button type="button" className="social-btn">
              Sign in with Facebook
            </button>
            <button type="button" className="guest-btn">
              Continue as Guest
            </button>


          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div className="name-fields">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;