// apps/web/src/components/pages/HomePage.tsx
import React from 'react'; // Removed useState and useEffect
import '../../styles/HomePage.css';

// Correct: Imports from your new shared packages
import { categories, TOP_OFFERS } from '@fastfoodordering/data';
import { Category, MenuItemType } from '@fastfoodordering/types';
import { usePopularItems } from '@fastfoodordering/hooks';

import MenuItemCard from '../shared/MenuItemCard';

function HomePage() {
  // Correct: All your data-fetching logic is now in this one line!
  const popularItems = usePopularItems();

  // Removed: The old useState and useEffect are now gone.
  
  return (
    // This JSX (HTML part) stays exactly the same
    <>
      <section className="hero">
        <h1>Delicious Food, Delivered Fast</h1>
        <p>Order from your favorite restaurants and get it delivered in minutes</p>
        <button className="order-now" onClick={() => (window.location.href = '/menu')}>
          Order Now
        </button>
      </section>

      {/* Top Offers Section */}
      <section className="top-offers">
        {/* ... (rest of your JSX is unchanged) ... */}
        <h2>Top Offers</h2>
        <div className="offers-grid">
          {TOP_OFFERS.map((offer) => (
            <div key={offer.id} className="offer-item">
              <img src={offer.image} alt={offer.title} />
              <p>
                {offer.title} - {offer.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
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

      {/* Popular Items Section */}
      <section className="popular-items">
        <h2>Popular Items</h2>
        <div className="popular-items-grid">
          {/* This will now be populated by your hook */}
          {popularItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose">
        <h2>Why Choose FoodieExpress?</h2>
        <div className="why-choose-grid">
          <div className="why-item">Fast Delivery</div>
          <div className="why-item">Wide Selection</div>
          <div className="why-item">Easy Ordering</div>
        </div>
      </section>
    </>
  );
}

export default HomePage;