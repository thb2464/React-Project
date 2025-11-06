// apps/web/src/components/pages/MenuPage.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/MenuPage.css';
import { fetchAllFoodItems } from '../../services/api';
import { MenuItemType } from '../../types';
import MenuItemCard from '../shared/MenuItemCard';

// KHÔI PHỤC LẠI: Dữ liệu tĩnh cho bộ lọc, vì chúng không đến từ API
const dietaryPreferences: string[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

function MenuPage() {
  const [allItems, setAllItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadAllItems = async () => {
      setLoading(true);
      const data = await fetchAllFoodItems();
      
      setAllItems(data);
      setFilteredItems(data);

      const uniqueCategories = [...new Set(data.flatMap(item => item.tags))];
      setCategories(uniqueCategories);

      setLoading(false);
    };

    loadAllItems();
  }, []);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1); 

    if (catName === 'All Items') {
      setFilteredItems(allItems);
    } else {
      const itemsInCategory = allItems.filter(item => item.tags.includes(catName));
      setFilteredItems(itemsInCategory);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="menu-page">
      <aside className="menu-sidebar">
        <h3>Categories</h3>
        <ul className="menu-category-list">
          <li className={selectedCategory === 'All Items' ? 'active' : ''} onClick={() => handleCategoryChange('All Items')}>All Items</li>
          {categories.map((cat) => (
            <li key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => handleCategoryChange(cat)}>{cat}</li>
          ))}
        </ul>

        <h3>Dietary Preferences</h3>
        <ul className="menu-dietary-list">
          {dietaryPreferences.map((pref: string) => (
            <li key={pref}>
              <input type="checkbox" id={pref} />
              <label htmlFor={pref}>{pref}</label>
            </li>
          ))}
        </ul>

        <h3>Price Range</h3>
        <div className="menu-price-range">
          <input type="range" min="0" max="50" step="1" defaultValue="50" />
          <div className="price-labels">
            <span>$0</span>
            <span>$50+</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {loading ? (
          <h1>Loading menu...</h1>
        ) : (
          <>
            <div className="header-sort">
              <h1>{selectedCategory}</h1>
              <div className="sort-by">
                <select>
                  <option>Popular</option>
                </select>
              </div>
            </div>

            <div className="menu-grid">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))
              ) : (
                <p>No items found for this category.</p>
              )}
            </div>

            <div className="pagination">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => paginate(page)} className={`page-btn ${currentPage === page ? 'active' : ''}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">Next</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MenuPage;

