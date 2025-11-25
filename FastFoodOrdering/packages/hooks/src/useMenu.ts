import { useState, useEffect } from 'react';
import { apiClient } from '@fastfoodordering/utils';
import { MenuItemType } from '@fastfoodordering/types';
import { useAppState } from '@fastfoodordering/store';

export function useMenu() {
  const { token } = useAppState();
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        // FIX: Cast the response to MenuItemType[] so TypeScript knows the shape
        const data = await apiClient('/food-items') as MenuItemType[]; 
        
        setItems(data);

        // Now TS knows 'i.category' is a string
        const uniqueCats = Array.from(new Set(data.map((i) => i.category)));
        setCategories(['All', ...uniqueCats]);
        
      } catch (err: any) {
        console.error('Fetch Menu Error:', err);
        setError(err.message || 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { items, categories, isLoading, error };
}