// apps/web/src/components/shared/CartContent.tsx
import React from 'react';
import '../../styles/CartContent.css';
import { useAppState } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';

function CartContent() {
  const { cart, updateQuantity, removeFromCart } = useAppState();
  const navigate = useNavigate();

  // Tính toán tiền (đảm bảo là number)
  const subtotal = cart.reduce((sum, item: any) => {
    const price = Number(item.discountedPrice) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  const deliveryFee = 20000;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  // Hàm format tiền Việt Nam đẹp: 125.000 ₫
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page empty">
        <h2>Giỏ hàng trống</h2>
        <button className="continue-shopping" onClick={() => navigate('/menu')}>
          ← Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button className="continue-shopping" onClick={() => navigate('/menu')}>
        ← Tiếp tục mua sắm
      </button>

      <div className="cart-content">
        <div className="cart-items">
          <h2>Giỏ hàng ({cart.length} món)</h2>
          {cart.map((item: any) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="item-image-cart" />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  Xóa món
                </button>
              </div>

              {/* Giá mỗi món đã tính số lượng */}
              <span className="item-price">
                {formatVND((Number(item.discountedPrice) || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h2>Tóm tắt đơn hàng</h2>

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatVND(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Phí giao hàng</span>
            <span>{formatVND(deliveryFee)}</span>
          </div>

          <div className="summary-row">
            <span>Thuế (8%)</span>
            <span>{formatVND(tax)}</span>
          </div>

          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span className="big-total">{formatVND(total)}</span>
          </div>

          {subtotal >= 300000 && (
            <p className="free-delivery">Miễn phí giao hàng (đơn từ 300.000₫)</p>
          )}

          <button className="checkout-btn" onClick={handleCheckout}>
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartContent;