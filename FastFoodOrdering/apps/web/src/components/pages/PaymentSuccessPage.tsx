// apps/web/src/components/pages/PaymentSuccessPage.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useAppState();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="payment-result success">
      <h1>Thanh toán thành công!</h1>
      <p>Mã đơn hàng: <strong>#{orderId}</strong></p>
      <p>Cảm ơn bạn đã đặt hàng. Drone đang được chuẩn bị!</p>
      <button onClick={() => navigate('/orders')}>Theo dõi đơn hàng</button>
    </div>
  );
}