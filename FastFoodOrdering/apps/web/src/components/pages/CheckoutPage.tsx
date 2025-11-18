// apps/web/src/components/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/CheckoutPage.css';
import { useAppState } from '../../hooks/useAppState';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants } from '../../services/api';

interface Restaurant {
  restaurant_id: string;
  name: string;
  address: string;
  available_drones: number;
}

interface Drone {
  drone_id: string;
  name: string;
  battery: number;
}

function CheckoutPage() {
  const { cart, clearCart } = useAppState();
  const navigate = useNavigate();

  // === States ===
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingDrones, setLoadingDrones] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Đang tải danh sách nhà hàng...');

  

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // === Tính tiền ===
  const subtotal = cart.reduce((sum: number, item: any) => {
    return sum + (Number(item.discountedPrice) || 0) * (item.quantity || 1);
  }, 0);

  const deliveryFee = 25000;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;
  const finalTotal = total - discount;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // === Load danh sách nhà hàng ===
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getAllRestaurants();
        setRestaurants(data);
        setStatusMessage(`Tìm thấy ${data.length} nhà hàng khả dụng`);
        if (data.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data[0].restaurant_id);
        }
      } catch (err) {
        console.error('Lỗi tải nhà hàng:', err);
        setStatusMessage('Không thể tải danh sách nhà hàng');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    loadRestaurants();
  }, []);

  // === Load drone khi chọn nhà hàng ===
  useEffect(() => {
    if (!selectedRestaurant) {
      setDrones([]);
      setSelectedDrone('');
      return;
    }

    const loadDrones = async () => {
      setLoadingDrones(true);
      try {
        // Giả lập API lấy drone theo nhà hàng (bạn sẽ làm thật sau)
        // Dữ liệu mẫu giống hệt RestaurantSelectionPage
        const mockDrones: Drone[] = [
          { drone_id: 'drone1', name: 'Drone Alpha-01', battery: 96 },
          { drone_id: 'drone2', name: 'Drone Beta-02', battery: 88 },
          { drone_id: 'drone3', name: 'Drone Gamma-03', battery: 75 },
        ].filter(() => Math.random() > 0.3); // Giả lập có/không drone

        setDrones(mockDrones);
        if (mockDrones.length > 0) {
          setSelectedDrone(mockDrones[0].drone_id);
        }
      } catch (err) {
        console.error('Lỗi tải drone:', err);
        setDrones([]);
      } finally {
        setLoadingDrones(false);
      }
    };

    loadDrones();
  }, [selectedRestaurant]);

  // === Xử lý đặt hàng ===
  const handlePlaceOrder = async () => {
  const state = useAppState.getState();
  console.log('AppState hiện tại:', state); // LOG NÀY

  const { user, token } = state;

  if (!user || !user.user_id) {
    alert('Bạn chưa đăng nhập! (user null)');
    navigate('/login');
    return;
  }

  if (!token) {
    alert('Token không tồn tại!');
    navigate('/login');
    return;
  }

  if (!selectedRestaurant || !selectedDrone) {
    alert('Vui lòng chọn nhà hàng và drone!');
    return;
  }

  const customerName = (document.querySelector('input[placeholder="Họ và tên"]') as HTMLInputElement)?.value;
  const phone = (document.querySelector('input[placeholder="Số điện thoại"]') as HTMLInputElement)?.value;
  const address = (document.querySelector('input[placeholder="Địa chỉ giao hàng chi tiết"]') as HTMLInputElement)?.value;
  const note = (document.querySelector('input[placeholder="Ghi chú (tầng lầu, công ty...)"]') as HTMLInputElement)?.value || '';

  if (!customerName || !phone || !address) {
    alert('Vui lòng điền đầy đủ thông tin!');
    return;
  }

  // KHAI BÁO orderData Ở ĐÂY
  const orderData = {
    user_id: user.user_id,
    restaurant_id: selectedRestaurant,
    total_amount: finalTotal,
    delivery_address: address,
    delivery_lat: 10.7769,
    delivery_lng: 106.7009,
    note,
    items: cart.map(item => ({
      item_id: item.id,
      quantity: item.quantity,
      unit_price: item.discountedPrice,
      customizations: item.customizations || [],
      note: item.note || '',
    })),
  };

  console.log('Gửi orderData:', orderData); // DEBUG

  setIsPlacingOrder(true);

  try {
    if (paymentMethod === 'VNPAY') {
      const res = await fetch('http://localhost:3000/api/payments/create-vnpay-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // token giờ hợp lệ
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.message || 'Không thể tạo thanh toán');
      }
    }
    // ... COD
  } catch (err) {
    console.error(err);
    alert('Lỗi mạng');
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
      alert('Mã giảm giá đã được sử dụng!');
    } else {
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  return (
    <div className="checkout-page">
      <button className="back-to-cart" onClick={() => navigate('/cart')}>
        ← Quay lại giỏ hàng
      </button>
      <h1>Thanh toán đơn hàng</h1>

      <div className="checkout-content">
        {/* Bên trái: Chọn nhà hàng + Drone + Thông tin giao hàng */}
        <div className="delivery-details">
          <h2>Chọn nhà hàng giao hàng</h2>
          <p className="status-message">{statusMessage}</p>

          {loadingRestaurants ? (
            <div className="loading">Đang tải nhà hàng...</div>
          ) : (
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="restaurant-select"
            >
              <option value="">-- Chọn nhà hàng --</option>
              {restaurants.map((r) => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.name} • {r.address} • {r.available_drones} drone sẵn sàng
                </option>
              ))}
            </select>
          )}

          {/* Drone selection - chỉ hiện khi đã chọn nhà hàng */}
          {selectedRestaurant && (
            <>
              <h2>Chọn Drone giao hàng</h2>
              {loadingDrones ? (
                <div className="loading">Đang kiểm tra drone...</div>
              ) : drones.length > 0 ? (
                <select
                  value={selectedDrone}
                  onChange={(e) => setSelectedDrone(e.target.value)}
                  className="drone-select"
                >
                  {drones.map((d) => (
                    <option key={d.drone_id} value={d.drone_id}>
                      {d.name} • Pin: {d.battery}% • Sẵn sàng
                    </option>
                  ))}
                </select>
              ) : (
                <p className="no-drone">Nhà hàng này hiện không có drone khả dụng</p>
              )}
            </>
          )}

          <h2>Thông tin người nhận</h2>
          <input type="text" placeholder="Họ và tên" required />
          <input type="text" placeholder="Số điện thoại" required />
          <input type="text" placeholder="Địa chỉ giao hàng chi tiết" required />
          <input type="text" placeholder="Ghi chú (tầng lầu, công ty...)" />
        </div>

        {/* Bên phải: Tóm tắt đơn hàng */}
        <div className="order-summary">
          <h2>Chi tiết đơn hàng</h2>
          {cart.map((item: any) => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatVND(item.discountedPrice * item.quantity)}</span>
            </div>
          ))}

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{	formatVND(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Phí giao hàng (Drone)</span>
            <span>{formatVND(deliveryFee)}</span>
          </div>
          <div className="summary-row">
            <span>Thuế VAT (8%)</span>
            <span>{formatVND(tax)}</span>
          </div>

          {discount > 0 && (
            <div className="summary-row discount">
              <span>Giảm giá (FOODIE10)</span>
              <span>-{formatVND(discount)}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Tổng thanh toán</span>
            <span className="final-price">{formatVND(finalTotal)}</span>
          </div>

          <form className="promo-code" onSubmit={applyPromoCode}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <button type="submit">Áp dụng</button>
          </form>

          <div className="payment-methods">
  <h3>Hình thức thanh toán</h3>
  <label>
    <input
      type="radio"
      name="pay"
      checked={paymentMethod === 'COD'}
      onChange={() => setPaymentMethod('COD')}
    />
    Thanh toán khi nhận hàng (COD)
  </label>
  <label>
    <input
      type="radio"
      name="pay"
      checked={paymentMethod === 'VNPAY'}
      onChange={() => setPaymentMethod('VNPAY')}
    />
    Thanh toán qua VNPAY
  </label>
</div>

<button
  className="place-order-btn"
  onClick={handlePlaceOrder}
  disabled={isPlacingOrder}
>
  {isPlacingOrder
    ? 'Đang xử lý...'
    : paymentMethod === 'VNPAY'
    ? `Thanh toán VNPAY • ${formatVND(finalTotal)}`
    : `Đặt hàng COD • ${formatVND(finalTotal)}`}
</button>

          <p className="delivery-note">
            Thời gian giao: 25-40 phút bằng Drone
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;