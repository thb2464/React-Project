import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/OrdersPage.css';
import { useAppState } from '../../hooks/useAppState';

// ... (Phần Setup Icon giữ nguyên) ...
// FIX ICON LEAFLET CHO VITE
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const droneIcon = new L.Icon({ iconUrl: 'https://img.icons8.com/color/48/drone.png', iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45] });
const restaurantIcon = new L.Icon({ iconUrl: 'https://img.icons8.com/color/48/restaurant.png', iconSize: [45, 45], iconAnchor: [22, 45] });
const customerIcon = new L.Icon({ iconUrl: 'https://img.icons8.com/color/48/home.png', iconSize: [45, 45], iconAnchor: [22, 45] });

function OrdersPage() {
  const { user } = useAppState();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // THÊM STATE CHO HISTORY
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [droneLocation, setDroneLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [showReceiveButton, setShowReceiveButton] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const RESTAURANT_COORD: [number, number] = [10.7769, 106.7009];
  const CUSTOMER_COORD: [number, number] = [10.7869, 106.7109];

  // Helper format
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng giao',
      out_for_delivery: 'Drone đang giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return '#27ae60'; // Xanh lá
    if (status === 'cancelled') return '#e74c3c'; // Đỏ
    if (status === 'pending') return '#f39c12';   // Cam
    return '#3498db'; // Xanh dương
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // ... (useEffect Map Size & Animation giữ nguyên) ...
  useEffect(() => {
    if (mapRef.current && activeTab === 'current' && currentOrder?.drone_id) {
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
    }
  }, [activeTab, currentOrder?.drone_id]);

  useEffect(() => {
    if (mapRef.current && droneLocation) {
      mapRef.current.panTo(droneLocation, { animate: true, duration: 2.0 });
    }
  }, [droneLocation]);


  // --- LOAD CURRENT ORDER ---
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let isMounted = true;
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).token : null;

    const loadCurrentOrder = async () => {
      if (!token || !isMounted) return;
      try {
        const res = await fetch('http://localhost:3000/api/orders/current', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCurrentOrder(data);
            if (data?.drone_id && data.status === 'out_for_delivery' && !droneLocation) {
               setDroneLocation(RESTAURANT_COORD);
            }
          }
        } else {
          setCurrentOrder(null);
        }
      } catch (err) { console.error(err); } finally { if (isMounted) setLoading(false); }
    };
    loadCurrentOrder();
    const interval = setInterval(loadCurrentOrder, 8000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [user?.id]);

  // --- MỚI: LOAD HISTORY KHI CHUYỂN TAB ---
  useEffect(() => {
    if (activeTab === 'history' && user) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).token : null;
        try {
          const res = await fetch('http://localhost:3000/api/orders/history', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setOrderHistory(await res.json());
          }
        } catch (err) {
          console.error("Lỗi tải lịch sử:", err);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, user]);


  // ... (Logic Simulation & Handle Receive Button giữ nguyên) ...
  useEffect(() => {
    if (simulationActive && currentOrder?.drone_id) {
      const route: [number, number][] = [
        [10.7769, 106.7009], [10.7800, 106.6950], [10.7850, 106.6980],
        [10.7880, 106.7050], [10.7875, 106.7080], [10.7869, 106.7109]
      ];
      let i = 0;
      const timer = setInterval(() => {
        if (i < route.length) { setDroneLocation(route[i]); i++; } 
        else {
          setDroneLocation(CUSTOMER_COORD); clearInterval(timer); setSimulationActive(false);
          setTimeout(() => { alert('Đơn hàng đã tới!'); setShowReceiveButton(true); }, 500);
        }
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [simulationActive, currentOrder?.drone_id]);

  const handleReceiveOrder = async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).token : null;
    if (!token || !currentOrder) return;
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${currentOrder.order_id}/complete`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Cảm ơn bạn đã sử dụng dịch vụ!");
        setShowReceiveButton(false);
        setCurrentOrder({ ...currentOrder, status: 'delivered' });
        // Reload history nếu cần
      } else { alert("Lỗi xác nhận."); }
    } catch { alert("Lỗi kết nối server"); }
  };

  if (loading) return <div className="orders-page"><p style={{textAlign:'center',padding:'60px'}}>Đang tải...</p></div>;

  return (
    <div className="orders-page">
      <div className="tabs" style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
        <button
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
          style={{
            flex: 1, padding: '16px', fontSize: '18px', fontWeight: activeTab === 'current' ? 'bold' : 'normal',
            border: 'none', background: activeTab === 'current' ? '#000' : '#f8f9fa',
            borderBottom: activeTab === 'current' ? '4px solid #e74c3c' : 'none', cursor: 'pointer'
          }}
        >
          Đơn hàng hiện tại
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1, padding: '16px', fontSize: '18px', fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            border: 'none', background: activeTab === 'history' ? '#000' : '#f8f9fa',
            borderBottom: activeTab === 'history' ? '4px solid #e74c3c' : 'none', cursor: 'pointer'
          }}
        >
          Lịch sử đơn hàng
        </button>
      </div>

      {/* TAB HIỆN TẠI */}
      {activeTab === 'current' && (
        <>
          {!currentOrder ? (
             <div style={{textAlign:'center',padding:'100px 20px'}}>
               <h2>Bạn chưa có đơn hàng nào đang xử lý</h2>
               <button onClick={() => window.location.href = '/menu'} className="order-now-btn">Đặt món ngay</button>
             </div>
          ) : (
            <>
              {/* ... (Giữ nguyên phần UI Current Order: Header, Progress, Map, Items...) ... */}
              <div className="order-header">
                 <h2>Đơn hàng #{currentOrder.order_id}</h2>
                 <span className={`status ${currentOrder.status}`}>{getStatusText(currentOrder.status)}</span>
              </div>

              {/* Tiến trình (Giữ nguyên code cũ của bạn) */}
              <div className="order-progress" style={{ margin: '20px 0', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                 {/* ...Paste lại code progress bar cũ vào đây nếu bị mất... */}
                 <div className="progress-steps" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((step, i) => {
                    const isCompleted = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].indexOf(currentOrder.status) >= i;
                    return (
                      <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: isCompleted ? '#27ae60' : '#ddd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold', fontSize: '20px' }}>{isCompleted ? '✓' : i + 1}</div>
                        <p style={{ margin: 0, fontSize: '14px' }}>{getStatusText(step)}</p>
                      </div>
                    );
                  })}
                  <div style={{ position: 'absolute', top: '25px', left: '50px', right: '50px', height: '4px', background: '#ddd', zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: '25px', left: '50px', width: `${['confirmed','preparing','ready','out_for_delivery','delivered'].indexOf(currentOrder.status) * 25}%`, height: '4px', background: '#27ae60', transition: 'width 0.6s ease', zIndex: 1 }} />
                </div>
              </div>

              {showReceiveButton && currentOrder.status !== 'delivered' && (
                 <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <button onClick={handleReceiveOrder} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '15px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(39,174,96,0.4)' }}>ĐÃ NHẬN HÀNG</button>
                 </div>
              )}

              {currentOrder.status === 'delivered' && (
                 <div style={{ textAlign: 'center', padding: '20px', background: '#e8f8f5', borderRadius: '12px', marginBottom: '20px', color: '#27ae60', border: '1px solid #27ae60' }}>
                   <h3>🎉 Giao hàng thành công!</h3>
                 </div>
              )}

              {currentOrder.drone_id && (
                 <div className="tracking-map-section">
                    <div style={{padding: '5px', background: 'rgba(236, 229, 229, 0.7)', WebkitBackdropFilter: 'blur(12px)', color: '#111111', textAlign: 'center', borderRadius: '16px 16px 0 0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'}}>
                       <div>Drone: {currentOrder.drone_name || 'Alpha-01'} • ETA: ~5 phút</div>
                       {currentOrder.status === 'out_for_delivery' && !showReceiveButton && (
                          <button onClick={() => setSimulationActive(true)} style={{ marginTop:'5px',padding:'8px 16px',background:'#000000ff', border:'none',borderRadius:'8px',color:'white',fontWeight:'bold',cursor:'pointer' }}>Simulate Flight</button>
                       )}
                    </div>
                    <div style={{ height: '480px', borderRadius: '0 0 16px 16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                       <MapContainer key={`map-${currentOrder.order_id}`} ref={mapRef} center={RESTAURANT_COORD} zoom={15} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Polyline positions={[RESTAURANT_COORD, droneLocation || RESTAURANT_COORD, CUSTOMER_COORD]} color="#e74c3c" weight={5} dashArray="10,10" />
                          <Marker position={RESTAURANT_COORD} icon={restaurantIcon}><Popup>Nhà hàng</Popup></Marker>
                          {droneLocation && <Marker position={droneLocation} icon={droneIcon}><Popup>Drone</Popup></Marker>}
                          <Marker position={CUSTOMER_COORD} icon={customerIcon}><Popup>Bạn</Popup></Marker>
                       </MapContainer>
                    </div>
                 </div>
              )}

              <div className="order-items" style={{marginTop: '20px'}}>
                 <h3>Món đã đặt</h3>
                 {currentOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="item-row"><span>{item.quantity}x {item.name}</span><span>{formatVND(item.price * item.quantity)}</span></div>
                 ))}
                 <div className="item-row total"><span>Tổng cộng</span><span>{formatVND(currentOrder.total || currentOrder.total_amount || 0)}</span></div>
              </div>
              <div className="delivery-details">
                 <h3>Thông tin giao hàng</h3>
                 <p><strong>Người nhận: {user?.name || 'Khách hàng'}</strong></p>
                 <p>Địa chỉ: {currentOrder.delivery_address}</p>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB LỊCH SỬ */}
      {activeTab === 'history' && (
        <div className="history-container" style={{ padding: '0 10px' }}>
          {historyLoading ? (
            <p style={{ textAlign: 'center' }}>Đang tải lịch sử...</p>
          ) : orderHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <img src="https://img.icons8.com/ios/100/000000/order-history.png" alt="Empty" style={{ opacity: 0.3 }} />
              <h3>Chưa có lịch sử đơn hàng</h3>
              <p>Hãy đặt món ăn đầu tiên của bạn ngay!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orderHistory.map((order) => (
                <div key={order.order_id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #eee' }}>
                  
                  {/* Header Card */}
                  <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#333' }}>{order.restaurant_name}</h3>
                      <small style={{ color: '#777' }}>{formatDate(order.created_at)}</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'white',
                        backgroundColor: getStatusColor(order.status)
                      }}>
                        {getStatusText(order.status)}
                      </span>
                      <div style={{ fontSize: '12px', marginTop: '5px', color: '#555' }}>#{order.order_id}</div>
                    </div>
                  </div>

                  {/* Body Card: Danh sách món */}
                  <div style={{ padding: '15px' }}>
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#555' }}>
                          <strong style={{ marginRight: '8px' }}>{item.quantity}x</strong> 
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Card: Tổng tiền */}
                  <div style={{ padding: '15px', borderTop: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#777' }}>Tổng thanh toán</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
                      {formatVND(order.total)}
                    </span>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;