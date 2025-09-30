// apps/web/src/components/pages/HomePage.tsx
import React from 'react'
import '../../styles/HomePage.css'
import { categories, menuItems } from '../../data/mockData'
import { Category } from '../../types'
import MenuItemCard from '../shared/MenuItemCard'

function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Delicious Food, Delivered Fast</h1>
        <p>Order from your favorite restaurants and get it delivered in minutes</p>
        <button className="order-now">Order Now</button>
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
          {menuItems.slice(0, 3).map((item) => (  // Showing first 3 as example
            <MenuItemCard key={item.name} item={item} />
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