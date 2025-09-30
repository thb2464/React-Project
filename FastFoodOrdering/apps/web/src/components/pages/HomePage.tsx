// apps/web/src/components/pages/HomePage.tsx
import React, { useState, useEffect } from 'react'
import '../../styles/HomePage.css'
import { categories, fetchMenuData, TOP_OFFERS } from '../../data/mockData'
import { Category, MenuItemType } from '../../types'
import MenuItemCard from '../shared/MenuItemCard'

function HomePage() {
  const [popularItems, setPopularItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMenuData();
      // Flatten and filter popular items (assuming isPopular: true)
      const allItems = Object.values(data).flatMap((cat) => cat.flatMap((subCat) => subCat.items));
      const popular = allItems.filter((item) => item.isPopular).slice(0, 3); // Limit to 3 as example
      setPopularItems(popular);
    };
    loadData();
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Delicious Food, Delivered Fast</h1>
        <p>Order from your favorite restaurants and get it delivered in minutes</p>
        <button className="order-now" onClick={() => window.location.href = '/menu'}>Order Now</button>
      </section>

      {/* Top Offers Section */}
      <section className="top-offers">
        <h2>Top Offers</h2>
        <div className="offers-grid">
          {TOP_OFFERS.map((offer) => (
            <div key={offer.id} className="offer-item">
              <img src={offer.image} alt={offer.title} />
              <p>{offer.title} - {offer.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="categories">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          {categories.map((cat: Category) => (
            <div className="category-item" key={cat.name}>
              <span className="icon">{cat.icon}</span>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="popular-items">
        <h2>Popular Items</h2>
        <div className="popular-items-grid">
          {popularItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose FoodieExpress?</h2>
        <div className="why-choose-grid">
          <div className="why-item">Fast Delivery</div>
          <div className="why-item">Wide Selection</div>
          <div className="why-item">Easy Ordering</div>
        </div>
      </section>
    </>
  )
}

export default HomePage