// apps/web/src/components/shared/Header.tsx
import React, { useState, useEffect } from 'react'
import '../../styles/Header.css'
import { categories } from '../../data/mockData'
import { Category } from '../../types'
import { useAppState } from '../../hooks/useAppState'

// Mock user state (replace with actual auth context if available)
const mockCurrentUser = null; // Set to { role: 'user' } or { role: 'admin' } for testing
const mockIsAdmin = false;

function Header() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { cart } = useAppState();

  useEffect(() => {
    let count = 0;
    if (cart.length) {
      cart.forEach((item: any) => {
        if (item.amount) {
          count += item.amount;
        }
      });
    }
    setItemCount(count);
  }, [cart]);

  const handleLogout = () => {
    // Implement logout logic, e.g., remove cookies, clear user
    console.log('Logged out');
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => window.location.href = '/'}>FoodieExpress</div>
      
      {/* Desktop Nav */}
      <nav className="nav desktop-nav">
        <ul>
          <li onClick={() => window.location.href = '/'}>Home</li>
          <li onClick={() => window.location.href = '/menu'}>Menu</li>
          <li onClick={() => window.location.href = '/orders'}>Orders</li>
          <li onClick={() => window.location.href = '/support'}>Support</li>
        </ul>
      </nav>
      
      <div className="search">
        <input type="text" placeholder="Search food..." />
      </div>
      
      <div className="icons">
        {/* Account Section */}
        <div 
          className="account" 
          onMouseEnter={() => setIsAccountOpen(true)} 
          onMouseLeave={() => setIsAccountOpen(false)}
        >
          {mockCurrentUser ? (
            <div className="account-icon">👤 Account</div>
          ) : (
            <button className="sign-in" onClick={() => window.location.href = '/auth'}>Sign in</button>
          )}
          
          {isAccountOpen && mockCurrentUser && (
            <div className="account-dropdown">
              {!mockIsAdmin && (
                <>
                  <div onClick={() => window.location.href = '/profile'}>My Profile</div>
                  <div onClick={() => window.location.href = '/orders'}>Orders</div>
                </>
              )}
              {mockIsAdmin && (
                <>
                  <div onClick={() => window.location.href = '/admin/items'}>Manage Items</div>
                  <div onClick={() => window.location.href = '/admin/categories'}>Manage Categories</div>
                  <div onClick={() => window.location.href = '/admin/reports'}>Reports</div>
                  <div onClick={() => window.location.href = '/admin/orders'}>All Orders</div>
                </>
              )}
              <div onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
        
        {/* Favorites/Wishlist */}
        <div className="favorites" onClick={() => window.location.href = '/favorites'}>
          ❤️ Favorites
        </div>
        
        {/* Cart */}
        <div className="cart-container" onClick={() => window.location.href = '/cart'}>
          <span className="cart">🛒</span>
          <span>{itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}</span>
        </div>
      </div>
      
      {/* Hamburger for Mobile */}
      <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        ☰
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li onClick={() => window.location.href = '/'}>Home</li>
            <li onClick={() => window.location.href = '/menu'}>Menu</li>
            <li onClick={() => window.location.href = '/orders'}>Orders</li>
            <li onClick={() => window.location.href = '/support'}>Support</li>
          </ul>
        </div>
      )}
      

    </header>
  )
}

export default Header