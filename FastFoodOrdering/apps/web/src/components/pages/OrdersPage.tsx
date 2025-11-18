// apps/web/src/components/pages/OrdersPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';
import '../../styles/OrdersPage.css';
import { getCurrentOrder, getOrderHistory, getDroneById } from '../../services/api';
import { useAppState } from '../../hooks/useAppState';

// Fix Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const droneIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/drone.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/restaurant.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/home.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function OrdersPage() {
  const { user } = useAppState();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [droneLocation, setDroneLocation] = useState<LatLngTuple | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Lấy đơn hàng hiện tại (đang giao) + lịch sử
  useEffect(() => {
    
    const loadOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Lấy đơn hàng đang giao (status: confirmed, preparing, out_for_delivery)
        const active = await getCurrentOrder(); // API mới bạn sẽ tạo
        setCurrentOrder(active || null);

        // 2. Lấy lịch sử đơn hàng
        const history = await getOrderHistory(); // API lấy đơn đã giao
        setOrderHistory(history || []);

        // 3. Nếu có đơn đang giao → lấy vị trí drone real-time
        if (active?.drone_id && active?.status === 'out_for_delivery') {
          const drone = await getDroneById(active.drone_id);
          if (drone?.current_lat && drone?.current_lng) {
            setDroneLocation([drone.current_lat, drone.current_lng]);
          }
        }
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Cập nhật mỗi 10s
    return () => clearInterval(interval);
  }, [user]);
  

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusText = (status: string) => {
    const map: any = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      out_for_delivery: 'Drone đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return map[status] || status;
  };

  if (loading) {
    return <div className="orders-page"><p>Đang tải đơn hàng...</p></div>;
  }

  return (
    <div className="orders-page">
      <div className="tabs">
        <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>
          Đơn hàng hiện tại
        </button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
          Lịch sử đơn hàng
        </button>
      </div>

      {/* TAB: ĐƠN HÀNG HIỆN TẠI */}
      {activeTab === 'current' && (
        <div className="current-order">
          {!currentOrder ? (
            <div className="no-order">
              <h2>Bạn chưa có đơn hàng nào đang giao</h2>
              <p>Hãy đặt món ăn ngay hôm nay!</p>
              <button onClick={() => window.location.href = '/restaurants'} className="order-now-btn">
                Đặt món ngay
              </button>
            </div>
          ) : (
            <>
              <div className="order-header">
                <h2>Đơn hàng #{currentOrder.order_id}</h2>
                <span className={`status ${currentOrder.status}`}>
                  {getStatusText(currentOrder.status)}
                </span>
              </div>

              {/* Thanh tiến độ */}
              <div className="order-progress">
                <div className="progress-steps">
                  {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((step, i) => {
                    const isActive = currentOrder.status === step || 
                      (currentOrder.status === 'delivered' && step !== 'delivered');
                    const isCompleted = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].indexOf(currentOrder.status) >= i;
                    return (
                      <div key={step} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <span>{isCompleted ? 'Check' : 'Circle'}</span>
                        <p>{getStatusText(step)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bản đồ LIVE nếu đang giao */}
              {currentOrder.status === 'out_for_delivery' && droneLocation && (
                <div className="tracking-map-section">
                  <div className="map-controls">
                    <span className="live">LIVE TRACKING</span>
                    <span>Drone: {currentOrder.drone_name || 'Alpha-01'}</span>
                    <span>Thời gian dự kiến: 8 phút</span>
                  </div>
                  <MapContainer center={droneLocation} zoom={15} style={{ height: '320px' }} ref={mapRef}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline positions={[
                      [currentOrder.restaurant_lat, currentOrder.restaurant_lng],
                      droneLocation,
                      [currentOrder.customer_lat || 10.7769, currentOrder.customer_lng || 106.7009]
                    ]} color="#e67e22" weight={5} opacity={0.7} />
                    <Marker position={[currentOrder.restaurant_lat, currentOrder.restaurant_lng]} icon={restaurantIcon}>
                      <Popup>Nhà hàng</Popup>
                    </Marker>
                    <Marker position={droneLocation} icon={droneIcon}>
                      <Popup>Drone đang bay đến bạn!</Popup>
                    </Marker>
                    <Marker position={[currentOrder.customer_lat || 10.7769, currentOrder.customer_lng || 106.7009]} icon={customerIcon}>
                      <Popup>Địa chỉ giao hàng</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {/* Chi tiết đơn */}
              <div className="order-items">
                <h3>Món đã đặt</h3>
                {currentOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="item-row">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="item-row total">
                  <span>Phí giao hàng (Drone)</span>
                  <span>{formatVND(25000)}</span>
                </div>
                <div className="item-row total">
                  <span>Tổng cộng</span>
                  <span>{formatVND(currentOrder.total_amount)}</span>
                </div>
              </div>

              <div className="delivery-details">
                <h3>Thông tin giao hàng</h3>
                <p><strong>{currentOrder.customer_name}</strong></p>
                <p>{currentOrder.phone}</p>
                <p>{currentOrder.address}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: LỊCH SỬ ĐƠN HÀNG */}
      {activeTab === 'history' && (
        <div className="order-history">
          <h2>Lịch sử đơn hàng</h2>
          {orderHistory.length === 0 ? (
            <p>Chưa có đơn hàng nào</p>
          ) : (
            orderHistory.map((order: any) => (
              <div key={order.order_id} className="history-card">
                <div className="history-header">
                  <div>
                    <h3>Đơn hàng #{order.order_id}</h3>
                    <p>{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    <p>Drone: {order.drone_name || 'Không có'}</p>
                  </div>
                  <div>
                    <span className="status delivered">{formatVND(order.total_amount)}</span>
                  </div>
                </div>
                <div className="history-actions">
                  <button onClick={() => window.location.href = '/menu'}>Đặt lại</button>
                  <button>Xem chi tiết</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;