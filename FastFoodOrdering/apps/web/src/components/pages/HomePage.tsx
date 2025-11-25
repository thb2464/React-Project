// apps/web/src/components/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/HomePage.css';
import { getFoodMenu } from '../../services/api';
import MenuItemCard from '../shared/MenuItemCard';
import { useNavigate } from 'react-router-dom';

interface MenuItemType {
  id: number;
  name: string;
  image: string;
  discountedPrice: number;
  originalPrice?: number;
  description?: string;
  tags?: string[];
  rating?: number;
  isPopular?: boolean;
  veg?: boolean;
  calories?: number;
}

function HomePage() {
  const navigate = useNavigate();
  const [popularItems, setPopularItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dbItems = await getFoodMenu();

        // Lấy 6 món phổ biến nhất (ưu tiên món đắt + random để đa dạng)
        const popular = dbItems
          .filter(item => item.is_available !== false)
          .sort((a: any, b: any) => {
            // Ưu tiên món có đánh giá cao + giá cao (giả lập "phổ biến")
            const scoreA = (a.rating || 4.5) + (a.price > 80000 ? 0.5 : 0);
            const scoreB = (b.rating || 4.5) + (b.price > 80000 ? 0.5 : 0);
            return scoreB - scoreA;
          })
          .slice(0, 6)
          .map((item: any) => ({
            id: item.item_id,
            name: item.name,
            image: item.image,
            discountedPrice: Number(item.price),
            originalPrice: Number(item.price),
            description: item.description || 'Món ăn ngon tuyệt đối',
            tags: item.category ? [item.category] : [],
            rating: item.rating || Number((4.3 + Math.random() * 0.7).toFixed(1)),
            calories: Math.floor(Math.random() * 350) + 200,
            isPopular: true,
            veg: item.is_veg || false,
          }));

        setPopularItems(popular);
      } catch (err) {
        console.error('Lỗi tải món phổ biến:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Dùng ảnh thật + ưu đãi giả lập cho Top Offers (vì DB chưa có bảng offer)
  const TOP_OFFERS = popularItems.slice(0, 4).map((item, idx) => ({
    id: idx + 1,
    image: item.image,
    title: item.name,
    price: new Intl.NumberFormat('vi-VN').format(item.discountedPrice) + '₫',
  }));

  // Danh mục nhanh (cố định, đẹp như cũ)
  const categories = [
    { name: 'Burger', icon: 'Burger' },
    { name: 'Gà rán', icon: 'Fried Chicken' },
    { name: 'Pizza', icon: 'Pizza' },
    { name: 'Cơm tấm', icon: 'Rice Dish' },
    { name: 'Trà sữa', icon: 'Drink' },
    { name: 'Bánh mì', icon: 'Bánh mì' },
  ];

  return (
    // This JSX (HTML part) stays exactly the same
    <>
      {/* HERO - giữ nguyên template */}
      <section className="hero">
        <h1>Đồ ăn ngon – Giao siêu nhanh bằng Drone</h1>
        <p>Chỉ 25-40 phút là có ngay bữa ăn nóng hổi từ nhà hàng yêu thích</p>
        <button className="order-now" onClick={() => navigate('/menu')}>
          Đặt Hàng Ngay
        </button>
      </section>

      {/* TOP OFFERS - dùng món thật */}
      <section className="top-offers">
        <h2>Ưu đãi hôm nay</h2>
        <div className="offers-grid">
          {TOP_OFFERS.length > 0 ? (
            TOP_OFFERS.map((offer) => (
              <div key={offer.id} className="offer-item" onClick={() => navigate('/menu')}>
                <img src={offer.image} alt={offer.title} />
                <p>{offer.title}</p>
                <p className="offer-price">Chỉ {offer.price}</p>
              </div>
            ))
          ) : (
            <p>Đang tải ưu đãi...</p>
          )}
        </div>
      </section>

      {/* CATEGORIES - giữ nguyên cấu trúc */}
      <section className="categories">
        <h2>Danh mục phổ biến</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <div
              className="category-item"
              key={cat.name}
              onClick={() => navigate('/menu')}
            >
              <span className="icon">{cat.icon}</span>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR ITEMS - dùng dữ liệu thật */}
      <section className="popular-items">
        <h2>Món ăn được yêu thích</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Đang tải món ngon...</p>
          </div>
        ) : (
          <div className="popular-items-grid">
            {popularItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE - giữ nguyên template, nội dung đẹp hơn */}
      <section className="why-choose">
        <h2>Tại sao chọn FoodieExpress?</h2>
        <div className="why-choose-grid">
          <div className="why-item">
            <strong>Giao bằng Drone</strong>
            <p>Nhanh gấp 3 lần xe máy</p>
          </div>
          <div className="why-item">
            <strong>Luôn nóng hổi</strong>
            <p>Đóng gói chống tràn, giữ nhiệt</p>
          </div>
          <div className="why-item">
            <strong>Đặt hàng dễ dàng</strong>
            <p>Chỉ 3 bước là xong</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;