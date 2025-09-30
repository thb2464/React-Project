// apps/web/src/components/pages/MenuPage.tsx
import React from 'react'
import '../../styles/MenuPage.css'
import { categories, dietaryPreferences, menuItems } from '../../data/mockData'
import { Category } from '../../types'
import MenuItemCard from '../shared/MenuItemCard'

function MenuPage() {
  return (
    <div className="menu-page">
      <aside className="sidebar">
        <h3>Categories</h3>
        <ul className="category-list">
          <li className="active">All Items</li>
          {categories.map((cat: Category) => (
            <li key={cat.name}>{cat.name}</li>
          ))}
        </ul>

        <h3>Dietary Preferences</h3>
        <ul className="dietary-list">
          {dietaryPreferences.map((pref: string) => (
            <li key={pref}>
              <input type="checkbox" id={pref} />
              <label htmlFor={pref}>{pref}</label>
            </li>
          ))}
        </ul>

        <h3>Price Range</h3>
        <div className="price-range">
          <input type="range" min="0" max="50" step="1" defaultValue="50" />
          <div className="price-labels">
            <span>$0</span>
            <span>$50+</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="header-sort">
          <h1>All Items</h1>
          <div className="sort-by">
            <select>
              <option>Popular</option>
              {/* Add more options as needed */}
            </select>
            <span>▼</span>
          </div>
        </div>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <MenuItemCard key={item.name} item={item} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default MenuPage