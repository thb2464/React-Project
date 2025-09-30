// apps/web/src/components/pages/AuthPage.tsx
import React, { useState } from 'react'
import '../../styles/AuthPage.css'

function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for sign-in logic
    alert('Signed in!');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Placeholder for sign-up logic
    alert('Account created!');
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
            <button type="submit" className="auth-btn">Sign In</button>
            <div className="divider">or</div>
            <button className="social-btn">Sign in with Google</button>
            <button className="social-btn">Sign in with Facebook</button>
            <button className="guest-btn">Continue as Guest</button>
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
            <button type="submit" className="auth-btn">Create Account</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthPage