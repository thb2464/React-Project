// apps/web/src/App.tsx
import React from 'react'
import './styles/App.css'
import Header from './components/shared/Header'
import HomePage from './components/pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import MenuPage from './components/pages/MenuPage'
import OrdersPage from './components/pages/OrdersPage'
import ProfilePage from './components/pages/ProfilePage'
import AuthPage from './components/pages/AuthPage'
import CartContent from './components/shared/CartContent'
import CheckoutPage from './components/pages/CheckoutPage'
import RestaurantDashboard from './components/pages/RestaurantDashboard'
import SupportPage from './components/pages/SupportPage'

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartContent />} />
        <Route path="/checkout" element={<CheckoutPage />} />  
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
    </div>
  )
}

export default App