// packages/hooks/src/usePopularItems.ts
import { useState, useEffect } from 'react';
import { fetchMenuData } from '@fastfoodordering/data';
import { MenuItemType } from '@fastfoodordering/types';

export function usePopularItems() {
  const [popularItems, setPopularItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMenuData();
      const allItems = Object.values(data).flatMap((cat) => 
        cat.flatMap((subCat) => subCat.items)
      );
      const popular = allItems.filter((item) => item.isPopular).slice(0, 3);
      setPopularItems(popular);
    };
    loadData();
  }, []);

  return popularItems;
}