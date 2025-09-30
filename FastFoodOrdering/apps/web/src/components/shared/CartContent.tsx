// apps/web/src/components/shared/CartContent.tsx
import React from 'react'
import '../../styles/CartContent.css'
import { useAppState } from '../../hooks/useAppState'
import { MenuItemType } from '../../types'
import { useNavigate } from 'react-router-dom'

function CartContent() {
  const { cart, updateQuantity, removeFromCart } = useAppState();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const deliveryFee = 3.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <button className="continue-shopping" onClick={() => navigate('/menu')}>← Continue Shopping</button>
      <div className="cart-content">
        <div className="cart-items">
          <h2>Cart Items ({cart.length})</h2>
          {cart.map((item: MenuItemType & { quantity: number }) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-image-cart" />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
              <span className="item-price">${(item.discountedPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
          <p className="free-delivery">Free delivery on orders over $30</p>
        </div>
      </div>
    </div>
  )
}

export default CartContent