// apps/web/src/components/pages/PaymentFailedPage.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const code = searchParams.get('code');

  return (
    <div className="payment-result failed">
      <h1>Thanh toán thất bại</h1>
      <p>Mã đơn: #{orderId}</p>
      <p>Mã lỗi: {code}</p>
      <button onClick={() => navigate('/checkout')}>Thử lại</button>
    </div>
  );
}