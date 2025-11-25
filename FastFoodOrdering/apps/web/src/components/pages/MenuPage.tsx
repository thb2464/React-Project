// apps/web/src/components/pages/MenuPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/MenuPage.css';
import { getFoodMenu } from '../../services/api';
import MenuItemCard from '../shared/MenuItemCard';

interface MenuItemType {
  id: number;
  name: string;
  image: string;
  discountedPrice: number;
  originalPrice: number;
  description: string;
  tags: string[];
  rating: number;
  time: string;
  calories: number;
  isPopular: boolean;
  veg: boolean;
  options?: any[];
}

function MenuPage() {
  const [allItems, setAllItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Items']);
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // FILTER STATES
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isDiscountOnly, setIsDiscountOnly] = useState(false);

  // SORT STATE
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);

  const mapDbToMenuItem = (dbItem: any): MenuItemType => ({
    id: dbItem.item_id,
    name: dbItem.name,
    image: dbItem.image || 'https://placehold.co/600x400/e67e22/white?text=No+Image',
    discountedPrice: dbItem.price,
    originalPrice: dbItem.original_price || dbItem.price, // nếu có cột giảm giá thật thì dùng
    description: dbItem.description || 'Món ngon khó cưỡng',
    tags: dbItem.category ? [dbItem.category] : ['Khác'],
    rating: dbItem.rating || Number((4.3 + Math.random() * 0.7).toFixed(1)),
    time: '20-35 phút',
    calories: Math.floor(Math.random() * 350) + 200,
    isPopular: dbItem.is_popular || Math.random() > 0.5,
    veg: dbItem.is_veg || false,
    options: dbItem.options || [],
  });

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      try {
        const dbItems = await getFoodMenu();
        const mapped = dbItems.map(mapDbToMenuItem);

        setAllItems(mapped);

        const uniqueCats = [...new Set(mapped.map(i => i.tags[0]))]
          .filter(Boolean)
          .sort();
        setCategories(['All Items', ...uniqueCats]);
      } catch (err) {
        console.error('Lỗi tải menu:', err);
        alert('Không thể tải thực đơn!');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  // === ÁP DỤNG FILTER + SORT ===
  const filteredAndSortedItems = useMemo(() => {
    let result = [...allItems];

    // 1. Filter theo danh mục
    if (selectedCategory !== 'All Items') {
      result = result.filter(item => item.tags.includes(selectedCategory));
    }

    // 2. Filter món chay
    if (isVegOnly) {
      result = result.filter(item => item.veg);
    }

    // 3. Filter đang giảm giá (giả lập: nếu originalPrice > discountedPrice)
    if (isDiscountOnly) {
      result = result.filter(item => item.originalPrice > item.discountedPrice);
    }

    // 4. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating;
        case 'price-asc':
          return a.discountedPrice - b.discountedPrice;
        case 'price-desc':
          return b.discountedPrice - a.discountedPrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [allItems, selectedCategory, isVegOnly, isDiscountOnly, sortBy]);

  // Pagination
  const totalItems = filteredAndSortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as any);
    setCurrentPage(1);
  };

  const paginate = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="menu-page">
      <aside className="menu-sidebar">
        <h3>Danh mục món ăn</h3>
        <ul className="menu-category-list">
          {categories.map((cat) => {
            const count = cat === 'All Items'
              ? allItems.length
              : allItems.filter(i => i.tags.includes(cat)).length;

            return (
              <li
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === 'All Items' ? 'Tất cả món' : cat}
                <span className="count">({count})</span>
              </li>
            );
          })}
        </ul>

        <div className="menu-filters">
          <h3>Bộ lọc</h3>
          <label>
            <input
              type="checkbox"
              checked={isVegOnly}
              onChange={(e) => {
                setIsVegOnly(e.target.checked);
                setCurrentPage(1);
              }}
            />
            Món chay
          </label>
          <label>
            <input
              type="checkbox"
              checked={isDiscountOnly}
              onChange={(e) => {
                setIsDiscountOnly(e.target.checked);
                setCurrentPage(1);
              }}
            />
            Đang giảm giá
          </label>
        </div>
      </aside>

      <main className="main-content">
        {loading ? (
          <div className="loading-menu">
            <div className="spinner"></div>
            <p>Đang tải thực đơn...</p>
          </div>
        ) : (
          <>
            <div className="header-sort">
              <h1>
                {selectedCategory === 'All Items' ? 'Tất cả món ăn' : selectedCategory}
                <span className="item-count"> ({totalItems} món)</span>
              </h1>

              <select value={sortBy} onChange={handleSortChange}>
                <option value="popular">Phổ biến nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            <div className="menu-grid">
              {currentItems.length === 0 ? (
                <p>Không tìm thấy món nào phù hợp.</p>
              ) : (
                currentItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className='page-btn'>
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span>...</span>}
                      <button
                        onClick={() => paginate(page)}
                        className={currentPage === page ? 'active' : 'page-btn'}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className='page-btn'>
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MenuPage;