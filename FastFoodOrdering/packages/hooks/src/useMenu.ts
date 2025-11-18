import { useState, useEffect } from 'react';
import { apiClient } from '@fastfoodordering/utils';
import { MenuItemType, Category } from '@fastfoodordering/types';

export function useMenu() {
  // We will build categories dynamically from the items
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [allItems, setAllItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        // Call the Real API
        const data: MenuItemType[] = await apiClient('/food-items', 'GET');
        
        setAllItems(data);
        setFilteredItems(data);

        // Extract unique categories from the data
        const uniqueCats = Array.from(new Set(data.map(item => item.category)));
        const catList = [
          { name: 'All Items', icon: '🌍' },
          ...uniqueCats.map(c => ({ name: c, icon: '🍽️' }))
        ];
        setCategories(catList);

      } catch (error) {
        console.error("Failed to load menu", error);
      }
    };
    loadMenu();
  }, []);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === 'All Items') {
      setFilteredItems(allItems);
    } else {
      const items = allItems.filter((item) => item.category === catName);
      setFilteredItems(items);
    }
  };

  return {
    filteredItems,
    categories,
    selectedCategory,
    handleCategoryChange,
  };
}