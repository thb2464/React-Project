// apps/web/src/components/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/CheckoutPage.css';
import { useAppState } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants } from '../../services/api';

// HÀM LẤY USER + TOKEN TỪ localStorage
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return {
      user_id: user.id || user.user_id,
      token: user.token,
      full_name: user.name || user.full_name,
    };
  } catch (e) {
    console.error('Lỗi parse user từ localStorage:', e);
    return null;
  }
};

function CheckoutPage() {
  const { cart, clearCart } = useAppState();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Đang tải nhà hàng...');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // STATE MỚI: Phương thức thanh toán (Mặc định là COD)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'VNPAY'>('COD');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.discountedPrice || 0) * (item.quantity || 1), 0);
  const deliveryFee = 25000;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;
  const finalTotal = total - discount;

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getAllRestaurants();
        setRestaurants(data);
        setStatusMessage(`Tìm thấy ${data.length} nhà hàng`);
        if (data.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data[0].restaurant_id);
        }
      } catch (err) {
        setStatusMessage('Không tải được nhà hàng');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    loadRestaurants();
  }, []);

  const handlePlaceOrder = async () => {
  if (!currentUser || !currentUser.token) {
    alert('Bạn chưa đăng nhập!');
    navigate('/login');
    return;
  }

  const customerName = (document.querySelector('input[placeholder="Họ và tên"]') as HTMLInputElement)?.value?.trim();
  const phone = (document.querySelector('input[placeholder="Số điện thoại"]') as HTMLInputElement)?.value?.trim();
  const address = (document.querySelector('input[placeholder="Địa chỉ giao hàng chi tiết"]') as HTMLInputElement)?.value?.trim();
  const note = (document.querySelector('input[placeholder="Ghi chú (tầng lầu, công ty...)"]') as HTMLInputElement)?.value || '';

  if (!customerName || !phone || !address || !selectedRestaurant) {
    alert('Vui lòng điền đầy đủ thông tin!');
    return;
  }

  const orderData = {
    restaurant_id: Number(selectedRestaurant),
    delivery_address: address,
    note: note,
    items: cart.map((item: any) => ({
      item_id: item.id,
      quantity: item.quantity,
    })),
    payment_method: paymentMethod, // Gửi thêm để biết COD hay Online
  };

  setIsPlacingOrder(true);
  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.token}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      const orderId = result.order?.order_id;

      if (paymentMethod === 'COD') {
        clearCart();
        alert('Đặt hàng thành công! Drone đang chuẩn bị...');
        navigate('/orders');
      } else {
        // Chuyển sang trang thanh toán MoMo/VNPay
        navigate(`/payment-success?order_id=${orderId}&method=${paymentMethod}`);
      }
    } else {
      alert('Lỗi: ' + (result.error || 'Không đặt được hàng'));
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối server');
  } finally {
    setIsPlacingOrder(false);
  }
};

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode === 'FOODIE10' && discount === 0) {
      setDiscount(subtotal * 0.1);
      alert('Áp dụng mã FOODIE10 thành công! Giảm 10%');
    } else if (discount > 0) {
      alert('Bạn đã dùng mã rồi!');
    } else {
      alert('Mã không hợp lệ!');
    }
  };

  if (!currentUser) {
    return <div className="checkout-page"><h1>Đang tải thông tin người dùng...</h1></div>;
  }

  return (
    <div className="checkout-page">
      <button className="back-to-cart" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
      <h1>Thanh toán đơn hàng</h1>
      <p>Xin chào, <strong>{currentUser.full_name}</strong>!</p>

      <div className="checkout-content">
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="delivery-details">
          <h2>Chọn nhà hàng</h2>
          <p>{statusMessage}</p>
          {loadingRestaurants ? (
            <div>Đang tải...</div>
          ) : (
            <select value={selectedRestaurant} onChange={e => setSelectedRestaurant(e.target.value)}>
              <option value="">-- Chọn nhà hàng --</option>
              {restaurants.map(r => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.name} • {r.address}
                </option>
              ))}
            </select>
          )}

          <h2>Thông tin nhận hàng</h2>
          <input type="text" placeholder="Họ và tên" defaultValue={currentUser.full_name} required />
          <input type="text" placeholder="Số điện thoại" required />
          <input type="text" placeholder="Địa chỉ giao hàng chi tiết" required />
          <input type="text" placeholder="Ghi chú (tầng lầu, công ty...)" />

          {/* PHẦN CHỌN PHƯƠNG THỨC THANH TOÁN MỚI */}
          <h2 style={{ marginTop: '30px' }}>Phương thức thanh toán</h2>
          <div className="payment-methods-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* COD */}
            <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`} 
                   style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'COD' ? '#f0f9ff' : 'white', borderColor: paymentMethod === 'COD' ? '#3498db' : '#ddd' }}>
              <input 
                type="radio" 
                name="payment" 
                value="COD" 
                checked={paymentMethod === 'COD'} 
                onChange={() => setPaymentMethod('COD')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                


                <span style={{ fontWeight: 'bold' }}>Thanh toán khi nhận hàng (COD)</span>
              </div>
            </label>

            {/* MOMO */}
            <label className={`payment-option ${paymentMethod === 'MOMO' ? 'selected' : ''}`}
                   style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'MOMO' ? '#fff0f6' : 'white', borderColor: paymentMethod === 'MOMO' ? '#d63384' : '#ddd' }}>
              <input 
                type="radio" 
                name="payment" 
                value="MOMO" 
                checked={paymentMethod === 'MOMO'} 
                onChange={() => setPaymentMethod('MOMO')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                
                <span style={{ fontWeight: 'bold', color: '#d63384' }}><></>Ví MoMo</span>
              </div>
            </label>

            {/* VNPAY */}
            <label className={`payment-option ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                   style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'VNPAY' ? '#f0fcfd' : 'white', borderColor: paymentMethod === 'VNPAY' ? '#007bff' : '#ddd' }}>
              <input 
                type="radio" 
                name="payment" 
                value="VNPAY" 
                checked={paymentMethod === 'VNPAY'} 
                onChange={() => setPaymentMethod('VNPAY')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                
                <span style={{ fontWeight: 'bold', color: '#0056b3' }}>VNPAY-QR</span>
              </div>
            </label>

          </div>
        </div>

        {/* CỘT PHẢI: TỔNG KẾT */}
        <div className="order-summary">
          <h2>Tóm tắt đơn hàng</h2>
          {cart.map((item: any) => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatVND(item.discountedPrice * item.quantity)}</span>
            </div>
          ))}

          <div className="summary-row"><span>Tạm tính</span><span>{formatVND(subtotal)}</span></div>
          <div className="summary-row"><span>Phí giao Drone</span><span>{formatVND(deliveryFee)}</span></div>
          <div className="summary-row"><span>VAT 8%</span><span>{formatVND(tax)}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Giảm giá</span><span>-{formatVND(discount)}</span></div>}
          <div className="summary-row total"><span>Tổng cộng</span><span>{formatVND(finalTotal)}</span></div>

          <form className="promo-code" onSubmit={applyPromoCode}>
            <input placeholder="Mã giảm giá" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
            <button type="submit">Áp dụng</button>
          </form>

          <button 
            className="place-order-btn" 
            onClick={handlePlaceOrder} 
            disabled={isPlacingOrder}
            style={{ backgroundColor: paymentMethod === 'MOMO' ? '#d63384' : paymentMethod === 'VNPAY' ? '#0056b3' : '#e74c3c' }}
          >
            {isPlacingOrder ? 'Đang xử lý...' : paymentMethod === 'COD' 
              ? `Đặt hàng ngay • ${formatVND(finalTotal)}` 
              : `Thanh toán ${paymentMethod} • ${formatVND(finalTotal)}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;