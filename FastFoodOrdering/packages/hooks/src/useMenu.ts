import { useState, useEffect } from 'react';
import { fetchMenuData, categories } from '@fastfoodordering/data';
import { MenuCategoryType, MenuItemType } from '@fastfoodordering/types';

export function useMenu() {
  const [menuData, setMenuData] = useState<Record<string, MenuCategoryType[]>>({});
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);

  // Load all menu data once
  useEffect(() => {
    const loadMenu = async () => {
      const data = await fetchMenuData();
      setMenuData(data);
      // Set the default view to all items
      const allItems = Object.values(data).flatMap((cat) =>
        cat.flatMap((subCat) => subCat.items)
      );
      setFilteredItems(allItems);
    };
    loadMenu();
  }, []);

  // Function to change the category
  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === 'All Items') {
      const allItems = Object.values(menuData).flatMap((cat) =>
        cat.flatMap((subCat) => subCat.items)
      );
      setFilteredItems(allItems);
    } else {
      const selected = menuData[catName] || [];
      const items = selected.flatMap((subCat) => subCat.items);
      setFilteredItems(items);
    }
  };

  // Return everything the UI will need
  return {
    filteredItems,
    categories: [{ name: 'All Items', icon: '🌍' }, ...categories], // Add 'All Items'
    selectedCategory,
    handleCategoryChange,
  };
}