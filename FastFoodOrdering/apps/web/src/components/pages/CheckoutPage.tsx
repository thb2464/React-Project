// apps/web/src/components/pages/CheckoutPage.tsx
import React, { useState } from 'react'
import '../../styles/CheckoutPage.css'
import { useAppState } from '../../hooks/useAppState'
import { MenuItemType } from '../../types'
import { useNavigate } from 'react-router-dom'

function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity } = useAppState();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const deliveryFee = 3.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePlaceOrder = () => {
    // Placeholder for order placement logic (e.g., API call)
    if (promoCode === 'DISCOUNT10' && discount === 0) {
      setDiscount(subtotal * 0.10); // 10% discount
    }
    alert('Order placed successfully!');
    cart.forEach(item => removeFromCart(item.id)); // Clear cart after order
    navigate('/orders');
  };

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode === 'DISCOUNT10' && discount === 0) {
      setDiscount(subtotal * 0.10);
      alert('Promo code applied! 10% discount added.');
    } else if (discount > 0) {
      alert('Promo code already applied!');
    } else {
      alert('Invalid promo code!');
    }
  };

  const finalTotal = total - discount;

  return (
    <div className="checkout-page">
      <button className="back-to-cart" onClick={() => navigate('/cart')}>← Back to Cart</button>
      <h1>Checkout</h1>
      <div className="checkout-content">
        <div className="delivery-details">
          <h2>Delivery Details</h2>
          <input type="text" placeholder="Full Name" required />
          <input type="text" placeholder="Address Line 1" required />
          <input type="text" placeholder="Address Line 2 (Optional)" />
          <input type="text" placeholder="City" required />
          <input type="text" placeholder="Postal Code" required />
          <input type="tel" placeholder="Phone Number" required />
          <button className="save-address">Save Address</button>
        </div>
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cart.map((item: MenuItemType & { quantity: number }) => (
            <div key={item.id} className="summary-item">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.discountedPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          <form className="promo-code" onSubmit={applyPromoCode}>
            <input
              type="text"
              placeholder="Enter Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>
          <div className="payment-methods">
            <h3>Payment Method</h3>
            <div className="payment-option">
              <input type="radio" name="payment" id="credit-card" defaultChecked />
              <label htmlFor="credit-card">Credit Card</label>
              <div className="card-details">
                <input
                  type="text"
                  placeholder="Card Number (e.g., 1234 5678 9012 3456)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="payment-option">
              <input type="radio" name="payment" id="paypal" />
              <label htmlFor="paypal">PayPal</label>
            </div>
            <div className="payment-option">
              <input type="radio" name="payment" id="cod" />
              <label htmlFor="cod">Cash on Delivery</label>
            </div>
          </div>
          <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
          <p className="delivery-note">Estimated delivery: 30-45 minutes</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage