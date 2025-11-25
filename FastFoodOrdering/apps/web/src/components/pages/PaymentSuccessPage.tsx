// apps/web/src/components/pages/PaymentSuccessPage.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import '../../styles/PaymentSuccessPage.css'; // Nhớ tạo file css này

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useAppState();
  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(10); // Tự động chuyển trang sau 10s

  useEffect(() => {
    // 1. Xóa giỏ hàng ngay khi vào trang
    clearCart();

    // 2. Đếm ngược để tự động chuyển hướng (Optional)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders'); // Tự động chuyển qua trang theo dõi
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart, navigate]);

  return (
    <div className="payment-success-page">
      <div className="success-card">
        {/* Animation Checkmark */}
        <div className="icon-container">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        <h1 className="success-title">Thanh toán thành công!</h1>
        <p className="success-message">
          Đơn hàng <strong className="order-id">#{orderId}</strong> của bạn đã được xác nhận.
        </p>
        
        {/* Hình ảnh Drone trang trí */}
        <div className="drone-delivery-visual">
          
          <img 
            src="/drone.png" 
            alt="Delivery Drone" 
            className="drone-img"
          />
          <div className="road-shadow"></div>
        </div>

        <div className="order-info-box">
          <p>🕒 Thời gian giao dự kiến: <strong>15 - 20 phút</strong></p>
          <p>🚁 Phương thức: <strong>Drone Express</strong></p>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/orders')} className="btn-track">
            Theo dõi đơn hàng ({countdown}s)
          </button>
          <button onClick={() => navigate('/')} className="btn-home">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}