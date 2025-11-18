// apps/web/src/components/shared/Header.tsx

import React, { useState, useRef, useEffect } from 'react';
import '../../styles/Header.css';
import { useAppState } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, cart, logout } = useAppState();
  const navigate = useNavigate();
  const accountRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/');
  };

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>
        FoodieExpress
      </div>

      <nav className="nav desktop-nav">
        <ul>
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/menu')}>Menu</li>
          <li onClick={() => navigate('/orders')}>Orders</li>
          <li onClick={() => navigate('/support')}>Support</li>
          <li onClick={() => navigate('/restaurants')}>Restaurants</li>
        </ul>
      </nav>

      <div className="search">
        <input type="text" placeholder="Search food..." />
      </div>

      <div className="icons">
        {/* ACCOUNT SECTION - FIXED */}
        <div className="account" ref={accountRef}>
          {user ? (
            <div
              className="account-icon"
              onClick={() => setIsAccountOpen(!isAccountOpen)} // ← Click để mở/đóng
              style={{ cursor: 'pointer' }}
            >
             👤 Hi, {user.name}
            </div>
          ) : (
            <button className="sign-in" onClick={() => navigate('/auth')}>
              Sign In
            </button>
          )}

          {isAccountOpen && user && (
            <div className="account-dropdown">
              {user.role === 'customer' && (
                <>
                  <div onClick={() => { navigate('/profile'); setIsAccountOpen(false); }}>My Profile</div>
                  <div onClick={() => { navigate('/orders'); setIsAccountOpen(false); }}>My Orders</div>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <div onClick={() => { navigate('/admin'); setIsAccountOpen(false); }}>Admin Dashboard</div>
                  <div onClick={() => { navigate('/admin/orders'); setIsAccountOpen(false); }}>Manage Orders</div>
                </>
              )}
              {user.role === 'owner' && (
                <>
                  <div onClick={() => { navigate('/owner'); setIsAccountOpen(false); }}>Owner Dashboard</div>
                </>
              )}
              <div onClick={handleLogout} className="logout-btn">
                Logout
              </div>
            </div>
          )}
        </div>

        <div className="favorites" onClick={() => navigate('/favorites')}>
          ❤️ Favorites
        </div>

        <div className="cart-container" onClick={() => navigate('/cart')}>
          <span className="cart">🛒</span>
          {totalItems > 0 && <span className="cart-count">({totalItems})</span>}
        </div>
      </div>

      <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        Menu
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>Home</li>
            <li onClick={() => { navigate('/menu'); setIsMobileMenuOpen(false); }}>Menu</li>
            <li onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }}>Orders</li>
            {user ? (
              <>
                <li onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>Profile</li>
                <li onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</li>
              </>
            ) : (
              <li onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>Sign In</li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;