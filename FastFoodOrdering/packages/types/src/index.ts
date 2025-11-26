// --- 1. Helper Interfaces (UI only) ---
export interface Category {
  icon: string;
  name: string;
}

export type UserRole = 'customer' | 'owner' | 'admin' | 'manager';

export type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
};


export type MenuItemType = {
  item_id: number;
  restaurant_id: number;
  name: string;
  category: string;
  img_url: string;
  price: number;
  is_available: boolean;
  description?: string;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Matches 'orders' table
export type Order = {
  order_id: number;
  user_id: number;
  restaurant_id: number;
  total: number; // DB column 'total'
  status: OrderStatus; // DB column 'status'
  delivery_address: string;
  created_at: string;
  items: OrderItem[];
};

export type OrderItem = {
  item_id: number;
  name: string; 
  quantity: number;
  unit_price: number;
  price?: number;     // Optional alias if needed for UI compatibility
};

// --- 4. Legacy/UI Types ---
export type Drone = {
  drone_id: number;
  status: 'idle' | 'in_flight' | 'charging' | 'maintenance';
  battery: number; // Matches DB column 'battery'
};