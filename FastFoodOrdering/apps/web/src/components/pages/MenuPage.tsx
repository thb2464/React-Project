// apps/web/src/components/pages/MenuPage.tsx
import React, { useState, useEffect } from 'react'
import '../../styles/MenuPage.css'
import { categories, dietaryPreferences, fetchMenuData } from '@fastfoodordering/data'
import { Category, MenuItemType, MenuCategoryType } from '@fastfoodordering/types'
import MenuItemCard from '../shared/MenuItemCard'

function MenuPage() {
  const [menuData, setMenuData] = useState<Record<string, MenuCategoryType[]>>({});
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Adjust as needed

  useEffect(() => {
    const loadMenu = async () => {
      const data = await fetchMenuData();
      setMenuData(data);
      // Flatten all items for 'All Items'
      const allItems = Object.values(data).flatMap((cat) => cat.flatMap((subCat) => subCat.items));
      setFilteredItems(allItems);
    };
    loadMenu();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [selectedCategory]);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === 'All Items') {
      const allItems = Object.values(menuData).flatMap((cat) => cat.flatMap((subCat) => subCat.items));
      setFilteredItems(allItems);
    } else {
      const selected = menuData[catName] || [];
      const items = selected.flatMap((subCat) => subCat.items);
      setFilteredItems(items);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="menu-page">
      <aside className="sidebar">
        <h3>Categories</h3>
        <ul className="category-list">
          <li className={selectedCategory === 'All Items' ? 'active' : ''} onClick={() => handleCategoryChange('All Items')}>All Items</li>
          {categories.map((cat: Category) => (
            <li key={cat.name} className={selectedCategory === cat.name ? 'active' : ''} onClick={() => handleCategoryChange(cat.name)}>{cat.name}</li>
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
          <h1>{selectedCategory}</h1>
          <div className="sort-by">
            <select>
              <option>Popular</option>
              {/* Add more options as needed */}
            </select>
            <span>▼</span>
          </div>
        </div>

        <div className="menu-grid">
          {currentItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page} 
              onClick={() => paginate(page)} 
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}

export default MenuPage