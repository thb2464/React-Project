// apps/web/src/components/pages/RestaurantSelectionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyRestaurants, getAllRestaurants } from '../../services/api';
import '../../styles/RestaurantSelectionPage.css';

interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  radius_km: number;
  available_drones: number;
  distance_km?: number;
}

function RestaurantSelectionPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Đang tìm nhà hàng gần bạn...');

  // Load ALL restaurants (safe fallback)
  const loadAllRestaurants = async () => {
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
      setStatusMessage('Hiển thị tất cả nhà hàng FoodieExpress');
    } catch (err) {
      console.error('Failed to load all restaurants:', err);
      setStatusMessage('Không thể kết nối máy chủ. Vui lòng thử lại.');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Try GPS → nearby
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Trình duyệt không hỗ trợ định vị. Hiển thị tất cả nhà hàng.');
      loadAllRestaurants();
      return;
    }

    setStatusMessage('Đang lấy vị trí của bạn...');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const nearby = await getNearbyRestaurants(latitude, longitude);

          if (nearby && nearby.length > 0) {
            setRestaurants(nearby.map((r: any) => ({
              ...r,
              distance_km: Math.round((r.distance_km || 0) * 10) / 10
            })));
            setStatusMessage(`Tìm thấy ${nearby.length} nhà hàng gần bạn`);
          } else {
            setStatusMessage('Không có nhà hàng nào trong phạm vi giao hàng');
            await loadAllRestaurants();
          }
        } catch (err) {
          console.log('Nearby API failed, falling back to all:', err);
          setStatusMessage('Không tìm thấy nhà hàng gần bạn');
          await loadAllRestaurants();
        }
      },
      (error) => {
        console.log('GPS denied:', error.message);
        setStatusMessage('Không thể lấy vị trí của bạn');
        loadAllRestaurants();
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <div className="restaurant-selection-page">
      <div className="header">
        <h1>Chọn nhà hàng giao đến bạn</h1>
        <p className="subtitle">{statusMessage}</p>

        {/* Only show retry button if failed */}
        {!loading && restaurants.length === 0 && (
          <button className="retry-btn" onClick={detectLocation}>
            Thử lại
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách nhà hàng...</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="no-results">
          <p>Không có nhà hàng nào khả dụng</p>
          <button onClick={loadAllRestaurants}>Tải lại</button>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.restaurant_id}
              className="restaurant-card"
              onClick={() => navigate(`/menu/${restaurant.restaurant_id}`)}
            >
              <div className="card-image">
                <div className="placeholder-image">
                  Nhà hàng
                </div>
              </div>

              <div className="card-content">
                <h3>{restaurant.name}</h3>
                <p className="address">{restaurant.address}</p>

                <div className="card-footer">
                  {restaurant.distance_km !== undefined && (
                    <span className="distance">
                      ~ {restaurant.distance_km} km
                    </span>
                  )}
                  <span className={`drones ${restaurant.available_drones > 0 ? 'available' : 'busy'}`}>
                    {restaurant.available_drones} drone sẵn sàng
                  </span>
                </div>

                <button className="select-btn" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/menu/${restaurant.restaurant_id}`);
                }}>
                  Chọn nhà hàng này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show "View All" only if we used GPS and found some */}
      {!loading && statusMessage.includes('Tìm thấy') && (
        <div className="all-restaurants-footer">
          <button className="show-all-btn" onClick={loadAllRestaurants}>
            Xem tất cả nhà hàng
          </button>
        </div>
      )}
    </div>
  );
}

export default RestaurantSelectionPage;