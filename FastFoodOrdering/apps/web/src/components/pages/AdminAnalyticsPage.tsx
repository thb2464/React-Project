// apps/web/src/components/pages/AdminAnalyticsPage.tsx
import React from 'react';
import '../../styles/AdminAnalyticsPage.css';
import { useAppState } from '../../hooks/useAppState';

interface BestSellingDish {
  rank: number;
  dish: string;
  restaurant: string;
  orders: number;
  revenue: number;
  avgRating: number;
  trend: 'up' | 'down';
}

export default function AdminAnalyticsPage() {
  const { user } = useAppState();

  // Mock data for best-selling dishes
  const bestSellingDishes: BestSellingDish[] = [
    {
      rank: 1,
      dish: 'Classic Burger',
      restaurant: 'Burger Palace',
      orders: 847,
      revenue: 12705,
      avgRating: 4.8,
      trend: 'up',
    },
    {
      rank: 2,
      dish: 'Margherita Pizza',
      restaurant: 'Pizza Paradise',
      orders: 723,
      revenue: 10485,
      avgRating: 4.7,
      trend: 'up',
    },
    {
      rank: 3,
      dish: 'Pad Thai',
      restaurant: 'Thai Delight',
      orders: 684,
      revenue: 8170,
      avgRating: 4.9,
      trend: 'up',
    },
    {
      rank: 4,
      dish: 'Chicken Tikka',
      restaurant: 'Indian Spice',
      orders: 589,
      revenue: 8835,
      avgRating: 4.8,
      trend: 'down',
    },
    {
      rank: 5,
      dish: 'Sushi Combo',
      restaurant: 'Sushi Master',
      orders: 512,
      revenue: 7680,
      avgRating: 4.8,
      trend: 'up',
    },
  ];

  // Mock data for satisfaction breakdown
  const satisfactionData = [
    { stars: 5, percentage: 12, count: 127 },
    { stars: 4, percentage: 68, count: 42 },
    { stars: 3, percentage: 15, count: 8 },
    { stars: 2, percentage: 4, count: 5 },
    { stars: 1, percentage: 1, count: 0 },
  ];

  // Helper to render single star for avg rating
  const renderAvgRating = (rating: number) => (
    <span className="avg-rating">
      {rating.toFixed(1)} <span className="star-filled">★</span>
    </span>
  );

  // Helper to render stars for satisfaction row
  const renderSatisfactionStars = (numStars: number) => (
    <div className="satisfaction-stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < numStars ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Performance analysis, best-selling dishes, and customer satisfaction levels</p>
        </div>
      </header>

      {/* Best-Selling Dishes Table */}
      <div className="table-section">
        <div className="table-header">
          <h2>Best-Selling Dishes</h2>
          <div className="table-actions">
            <button className="export-btn">Export</button>
          </div>
        </div>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Dish</th>
                <th>Restaurant</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Avg Rating</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {bestSellingDishes.map((dish) => (
                <tr key={dish.rank}>
                  <td>{dish.rank}</td>
                  <td>{dish.dish}</td>
                  <td>{dish.restaurant}</td>
                  <td>{dish.orders}</td>
                  <td>${dish.revenue.toLocaleString()}</td>
                  <td>{renderAvgRating(dish.avgRating)}</td>
                  <td>
                    <span className={`trend ${dish.trend}`}>
                      {dish.trend === 'up' ? '↑' : '↓'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Satisfaction Breakdown */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Customer Satisfaction Breakdown</h2>
          <p>Breakdown of customer ratings</p>
        </div>
        <div className="chart-container">
          <div className="bar-chart">
            {satisfactionData.map((data, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">
                  {renderSatisfactionStars(data.stars)}
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
                <div className="bar-value">{data.percentage}%</div>
                <div className="bar-count">{data.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}